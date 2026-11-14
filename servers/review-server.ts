"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import { reviews, tenants, tenantOrders, orders } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import type { SellerReview } from "@/types/seller";
import { classifyComment } from "@/lib/ai-client";

export type SubmitReviewInput = {
  orderId: string;
  rating: number; // 1 - 5
  comment: string;
  tenantId?: string;
  customerName?: string;
};

export type SubmitReviewResult = {
  success: boolean;
  message: string;
  reviewId?: string;
  moderationBadge?: string;
  tenantName?: string;
};

/**
 * Simpan data ulasan dari sisi Customer ke Database Neon PostgreSQL.
 * Terelasi langsung dengan ID Pesanan (orderId) dan ID UMKM (tenantId).
 */
export async function submitCustomerReviewAction(
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  try {
    const commentText = input.comment?.trim() || "";
    if (!commentText) {
      return { success: false, message: "Komentar ulasan wajib diisi." };
    }

    if (!input.orderId) {
      return { success: false, message: "ID Pesanan tidak valid." };
    }

    const ratingVal = Math.max(1, Math.min(5, Math.round(input.rating || 5)));

    // 1. Dapatkan informasi sesi pelanggan jika ada
    let customerId: string | null = null;
    let customerName = input.customerName || "Pelanggan";

    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user) {
        customerId = session.user.id;
        if (session.user.name) {
          customerName = session.user.name;
        }
      }
    } catch {
      // ignore session lookup in dev / public guest mode
    }

    // 2. Hubungkan dengan tenantId yang tepat melalui tenantOrders
    let targetTenantId = input.tenantId;
    let tenantNameFound = "";

    const tOrders = await db
      .select({
        tenantId: tenantOrders.tenantId,
        customerName: tenantOrders.customerName,
      })
      .from(tenantOrders)
      .where(eq(tenantOrders.orderId, input.orderId));

    if (tOrders.length > 0) {
      if (!targetTenantId || !tOrders.some((t) => t.tenantId === targetTenantId)) {
        targetTenantId = tOrders[0].tenantId;
      }
      if (tOrders[0].customerName && customerName === "Pelanggan") {
        customerName = tOrders[0].customerName;
      }
    }

    // Jika tenant belum ditemukan, periksa fallback ke tenant database pertama
    if (!targetTenantId) {
      const [firstTenant] = await db.select().from(tenants).limit(1);
      if (firstTenant) {
        targetTenantId = firstTenant.id;
        tenantNameFound = firstTenant.name;
      } else {
        return { success: false, message: "Data stan UMKM tidak ditemukan." };
      }
    } else {
      const [matched] = await db
        .select({ name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, targetTenantId))
        .limit(1);
      if (matched) {
        tenantNameFound = matched.name;
      }
    }

    // 3. Jalankan moderasi AI NLU secara terintegrasi
    let moderationBadge = "Ulasan Terverifikasi";
    try {
      const moderation = await classifyComment({
        comment_text: commentText,
        comment_id: `cmt-${input.orderId}`,
        tenant_id: tenantNameFound || targetTenantId,
        rating: ratingVal,
      });

      moderationBadge =
        moderation.dashboard_badge ||
        moderation.category ||
        "Ulasan Terverifikasi";
    } catch {
      // Fallback tetap aman jika AI service tidak merespon
    }

    // 4. Periksa apakah sudah ada ulasan untuk order & tenant ini
    const existing = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.orderId, input.orderId))
      .limit(1);

    let reviewId: string;
    if (existing.length > 0) {
      reviewId = existing[0].id;
      await db
        .update(reviews)
        .set({
          rating: ratingVal,
          comment: commentText,
          customerName,
          customerId,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, reviewId));
    } else {
      reviewId = `REV-${Date.now().toString().slice(-6)}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      await db.insert(reviews).values({
        id: reviewId,
        orderId: input.orderId,
        tenantId: targetTenantId,
        customerId,
        customerName,
        rating: ratingVal,
        comment: commentText,
      });
    }

    // 5. Update kalkulasi agregat rating & total review di tabel tenants
    try {
      const tenantReviewRows = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.tenantId, targetTenantId));

      const count = tenantReviewRows.length;
      const sum = tenantReviewRows.reduce((acc, r) => acc + r.rating, 0);
      const avg = count > 0 ? (sum / count).toFixed(1) : "0.0";

      await db
        .update(tenants)
        .set({
          rating: avg,
          totalReviews: count,
        })
        .where(eq(tenants.id, targetTenantId));
    } catch (calcErr) {
      console.warn("Gagal memperbarui agregat rating tenant:", calcErr);
    }

    // 6. Revalidate cache halaman seller & customer
    revalidatePath("/dashboard/seller/reviews");
    revalidatePath("/dashboard/seller");
    revalidatePath("/orders");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Ulasan Anda berhasil dikirim ke UMKM!",
      reviewId,
      moderationBadge,
      tenantName: tenantNameFound,
    };
  } catch (error) {
    console.error("Gagal menyimpan ulasan ke database:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan ulasan ke database.",
    };
  }
}

/**
 * Tarik data ulasan dinamis khusus untuk toko/UMKM yang sedang login di dashboard seller.
 */
export async function getSellerReviewsAction(
  tenantIdOverride?: string,
): Promise<{
  reviews: SellerReview[];
  tenantId: string;
  tenantName: string;
}> {
  try {
    let sellerTenant: { id: string; name: string } | null = null;

    // 1. Identifikasi seller yang sedang login melalui auth session
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user?.id) {
        const [found] = await db
          .select({ id: tenants.id, name: tenants.name })
          .from(tenants)
          .where(eq(tenants.sellerId, session.user.id))
          .limit(1);
        if (found) {
          sellerTenant = found;
        }
      }
    } catch {
      // ignore
    }

    // 2. Fallback tenant jika tenantIdOverride diberikan atau ambil tenant pertama
    if (!sellerTenant) {
      if (tenantIdOverride) {
        const [byOverride] = await db
          .select({ id: tenants.id, name: tenants.name })
          .from(tenants)
          .where(eq(tenants.id, tenantIdOverride))
          .limit(1);
        if (byOverride) {
          sellerTenant = byOverride;
        }
      }

      if (!sellerTenant) {
        const [firstTenant] = await db
          .select({ id: tenants.id, name: tenants.name })
          .from(tenants)
          .limit(1);
        if (firstTenant) {
          sellerTenant = firstTenant;
        }
      }
    }

    if (!sellerTenant) {
      return { reviews: [], tenantId: "", tenantName: "" };
    }

    // 3. Tarik seluruh data ulasan dari database untuk tenant tersebut
    const reviewRows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.tenantId, sellerTenant.id))
      .orderBy(desc(reviews.createdAt));

    // 4. Format data ulasan menjadi SellerReview untuk komponen frontend
    const mappedReviews: SellerReview[] = reviewRows.map((r) => {
      const words = (r.customerName || "Pelanggan").trim().split(" ");
      const avatarText =
        words.length >= 2
          ? `${words[0][0]}${words[1][0]}`.toUpperCase()
          : (words[0]?.slice(0, 2) || "PL").toUpperCase();

      const createdAtFormatted = r.createdAt
        ? new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(r.createdAt))
        : "Baru saja";

      const repliedAtFormatted = r.repliedAt
        ? new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(r.repliedAt))
        : undefined;

      const safeRating = Math.max(1, Math.min(5, r.rating)) as
        | 1
        | 2
        | 3
        | 4
        | 5;

      return {
        id: r.id,
        customerName: r.customerName || "Pelanggan",
        avatarText,
        rating: safeRating,
        comment: r.comment,
        createdAt: createdAtFormatted,
        reply: r.replyMessage
          ? {
              message: r.replyMessage,
              repliedAt: repliedAtFormatted || "Baru saja",
            }
          : undefined,
      };
    });

    return {
      reviews: mappedReviews,
      tenantId: sellerTenant.id,
      tenantName: sellerTenant.name,
    };
  } catch (error) {
    console.error("Gagal mengambil data review seller dari database:", error);
    return { reviews: [], tenantId: "", tenantName: "" };
  }
}

/**
 * Balas ulasan pelanggan dari dashboard seller dan simpan ke database.
 */
export async function replyToReviewAction(
  reviewId: string,
  message: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const textMsg = message.trim();
    if (!textMsg) {
      return { success: false, message: "Pesan balasan tidak boleh kosong." };
    }

    await db
      .update(reviews)
      .set({
        replyMessage: textMsg,
        repliedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));

    revalidatePath("/dashboard/seller/reviews");

    return { success: true, message: "Balasan berhasil disimpan." };
  } catch (error) {
    console.error("Gagal menyimpan balasan review:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal membalas ulasan.",
    };
  }
}

/**
 * Dapatkan riwayat ulasan untuk pesanan-pesanan customer (untuk orders history)
 */
export async function getCustomerOrderReviewsAction(
  orderIds: string[],
): Promise<
  Record<
    string,
    {
      rating: number;
      comment: string;
      badge: string;
      createdAt: string;
    }
  >
> {
  try {
    if (!orderIds || orderIds.length === 0) return {};

    const rows = await db
      .select()
      .from(reviews)
      .where(inArray(reviews.orderId, orderIds));

    const result: Record<
      string,
      {
        rating: number;
        comment: string;
        badge: string;
        createdAt: string;
      }
    > = {};

    for (const r of rows) {
      result[r.orderId] = {
        rating: r.rating,
        comment: r.comment,
        badge: "Terkirim",
        createdAt: r.createdAt ? r.createdAt.toLocaleDateString("id-ID") : "",
      };
    }

    return result;
  } catch (error) {
    console.warn("Gagal mengambil riwayat ulasan pesanan:", error);
    return {};
  }
}
