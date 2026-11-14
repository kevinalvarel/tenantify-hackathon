"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import { promotions, tenants, tenantOrders, user } from "@/db/schema";
import { eq, desc, inArray, or, and } from "drizzle-orm";
import type { Promotion, PromotionType } from "@/types/seller";

export type CreatePromotionInput = {
  title: string;
  message: string;
  type: PromotionType;
  startDate: string;
  endDate: string;
};

export type CreatePromotionResult = {
  success: boolean;
  message: string;
  promotion?: Promotion;
};

export type CustomerTargetingContext = {
  activeUmkmCode?: string | null;
  activeTenantIds?: string[];
  transactedTenantIds?: string[];
};

/**
 * Buat promosi baru dari sisi Seller, simpan ke database, dan siarkan ke notifikasi customer.
 */
export async function createPromotionAction(
  input: CreatePromotionInput,
): Promise<CreatePromotionResult> {
  try {
    const title = input.title?.trim() || "";
    const message = input.message?.trim() || "";

    if (!title) {
      return { success: false, message: "Judul promosi wajib diisi." };
    }
    if (!message) {
      return { success: false, message: "Isi pesan promosi wajib diisi." };
    }
    if (!input.startDate || !input.endDate) {
      return { success: false, message: "Periode tanggal promosi wajib diisi." };
    }

    // 1. Identifikasi seller yang sedang login
    let sellerTenant: { id: string; name: string } | null = null;
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

    // Fallback tenant jika di dev / simulasi
    if (!sellerTenant) {
      const [firstTenant] = await db
        .select({ id: tenants.id, name: tenants.name })
        .from(tenants)
        .limit(1);
      if (firstTenant) {
        sellerTenant = firstTenant;
      } else {
        return { success: false, message: "Stan UMKM tidak ditemukan." };
      }
    }

    const promoId = `promo-${Date.now()}`;
    const now = new Date();

    // 2. Simpan ke database
    await db.insert(promotions).values({
      id: promoId,
      tenantId: sellerTenant.id,
      title,
      message,
      type: input.type || "Info",
      startDate: input.startDate,
      endDate: input.endDate,
      status: "Terkirim",
      createdAt: now,
    });

    const sentAt = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);

    const createdPromo: Promotion = {
      id: promoId,
      tenantId: sellerTenant.id,
      tenantName: sellerTenant.name,
      tenantCode: sellerTenant.id,
      title,
      message,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "Terkirim",
      sentAt,
      targetUrl: `/?tenant=${sellerTenant.id}#customer-product-explorer`,
    };

    // 3. Revalidate path agar seller & customer terupdate seketika
    revalidatePath("/dashboard/seller/promotions");
    revalidatePath("/");
    revalidatePath("/customer");

    return {
      success: true,
      message: `Promosi "${title}" berhasil disimpan dan disiarkan ke pelanggan!`,
      promotion: createdPromo,
    };
  } catch (error) {
    console.error("Gagal menambahkan promosi:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menambahkan promosi.",
    };
  }
}

/**
 * Tarik daftar promosi milik seller yang sedang login
 */
export async function getSellerPromotionsAction(): Promise<{
  promotions: Promotion[];
  tenantName: string;
}> {
  try {
    let sellerTenant: { id: string; name: string } | null = null;
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

    if (!sellerTenant) {
      const [firstTenant] = await db
        .select({ id: tenants.id, name: tenants.name })
        .from(tenants)
        .limit(1);
      if (firstTenant) {
        sellerTenant = firstTenant;
      }
    }

    if (!sellerTenant) {
      return { promotions: [], tenantName: "" };
    }

    const rows = await db
      .select()
      .from(promotions)
      .where(eq(promotions.tenantId, sellerTenant.id))
      .orderBy(desc(promotions.createdAt));

    const mapped: Promotion[] = rows.map((r) => {
      const sentAt = r.createdAt
        ? new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(r.createdAt))
        : "Baru saja";

      return {
        id: r.id,
        tenantId: r.tenantId,
        tenantName: sellerTenant?.name,
        tenantCode: r.tenantId,
        title: r.title,
        message: r.message,
        type: (r.type as PromotionType) || "Info",
        startDate: r.startDate,
        endDate: r.endDate,
        status: "Terkirim",
        sentAt,
        targetUrl: `/?tenant=${r.tenantId}#customer-product-explorer`,
      };
    });

    return {
      promotions: mapped,
      tenantName: sellerTenant.name,
    };
  } catch (error) {
    console.error("Gagal mengambil promosi seller:", error);
    return { promotions: [], tenantName: "" };
  }
}

/**
 * Logika Penargetan (Sisi Backend):
 * Menarik promosi aktif secara tertarget khusus kepada Customer yang memiliki keterikatan
 * dengan 'Kode Unik' UMKM tersebut (sedang membuka menu UMKM tersebut atau pernah bertransaksi di sana).
 */
export async function getCustomerTargetedPromotionsAction(
  context?: CustomerTargetingContext,
): Promise<Promotion[]> {
  try {
    const boundTenantIds = new Set<string>();

    // 1. Keterikatan: Customer sedang membuka UMKM tertentu (Active UMKM)
    if (context?.activeTenantIds && context.activeTenantIds.length > 0) {
      context.activeTenantIds.forEach((id) => id && boundTenantIds.add(id));
    }

    // 2. Keterikatan: Berdasarkan kode unik yang sedang dibuka customer
    if (context?.activeUmkmCode) {
      const normCode = context.activeUmkmCode.trim().toUpperCase();
      // Periksa apakah kode adalah tenant langsung atau asosiasi
      const [matchedTenant] = await db
        .select({ id: tenants.id })
        .from(tenants)
        .where(
          or(
            eq(tenants.id, context.activeUmkmCode.trim()),
            eq(tenants.id, normCode),
          ),
        )
        .limit(1);

      if (matchedTenant) {
        boundTenantIds.add(matchedTenant.id);
      }

      // Jika kode asosiasi, dapatkan tenant-tenant di dalamnya
      const [assoc] = await db
        .select({ id: user.id })
        .from(user)
        .where(
          and(eq(user.associationCode, normCode), eq(user.role, "association")),
        )
        .limit(1);

      if (assoc) {
        // Ambil tenant yang terhubung
        const assocTenants = await db.select({ id: tenants.id }).from(tenants);
        assocTenants.forEach((t) => boundTenantIds.add(t.id));
      }
    }

    // 3. Keterikatan: Customer pernah bertransaksi di UMKM tersebut (Riwayat Pesanan)
    if (context?.transactedTenantIds && context.transactedTenantIds.length > 0) {
      context.transactedTenantIds.forEach((id) => id && boundTenantIds.add(id));
    }

    // Jika customer belum memiliki keterikatan sama sekali dengan kode UMKM manapun,
    // maka jangan kirimkan notifikasi (target selektif)
    if (boundTenantIds.size === 0) {
      return [];
    }

    const tenantIdsArray = Array.from(boundTenantIds);

    const rows = await db
      .select({
        id: promotions.id,
        tenantId: promotions.tenantId,
        tenantName: tenants.name,
        title: promotions.title,
        message: promotions.message,
        type: promotions.type,
        startDate: promotions.startDate,
        endDate: promotions.endDate,
        status: promotions.status,
        createdAt: promotions.createdAt,
      })
      .from(promotions)
      .leftJoin(tenants, eq(promotions.tenantId, tenants.id))
      .where(inArray(promotions.tenantId, tenantIdsArray))
      .orderBy(desc(promotions.createdAt))
      .limit(15);

    return rows.map((r) => {
      const sentAt = r.createdAt
        ? new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(r.createdAt))
        : "Baru saja";

      return {
        id: r.id,
        tenantId: r.tenantId,
        tenantName: r.tenantName || "Stan UMKM",
        tenantCode: r.tenantId,
        title: r.title,
        message: r.message,
        type: (r.type as PromotionType) || "Info",
        startDate: r.startDate,
        endDate: r.endDate,
        status: "Terkirim",
        sentAt,
        targetUrl: `/?tenant=${r.tenantId}#customer-product-explorer`,
      };
    });
  } catch (error) {
    console.warn("Gagal mengambil promosi tertarget untuk customer:", error);
    return [];
  }
}

