'use server';

import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import { user, tenants, boothSlots } from "@/db/schema";
import { assignAssociationCode } from "@/lib/association-code";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import {
  createSellerSchema,
  createAssociationSchema,
  type TCreateSellerSchema,
  type TCreateAssociationSchema,
} from "@/validations/auth-validation";

export type AccountResponse = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
  };
  tenantId?: string;
};

/**
 * Server action untuk Association atau Developer membuat akun Seller sekaligus data Tenant.
 */
export async function createSellerWithTenantAction(
  data: TCreateSellerSchema
): Promise<AccountResponse> {
  try {
    const validated = createSellerSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Format data seller tidak valid",
      };
    }

    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    if (!session) {
      return {
        success: false,
        message: "Sesi tidak valid. Silakan login kembali.",
      };
    }

    const callerRole = (session.user as { role?: string }).role;
    if (callerRole !== "association" && callerRole !== "developer") {
      return {
        success: false,
        message: "Hanya Association atau Developer yang berwenang menambahkan akun Seller.",
      };
    }

    // 1. Buat akun Seller via Better Auth Admin API
    const response = await auth.api.createUser({
      body: {
        name: validated.data.name,
        email: validated.data.email,
        password: validated.data.password,
        role: "seller",
      },
      headers: headerList,
    });

    if (!response || !response.user) {
      return {
        success: false,
        message: "Gagal membuat akun Seller.",
      };
    }

    const sellerUser = response.user;
    const newTenantId = `t_${Date.now()}`;

    // 2. Simpan entitas Tenant baru yang terhubung ke sellerId
    await db.insert(tenants).values({
      id: newTenantId,
      sellerId: sellerUser.id,
      name: validated.data.tenantName,
      category: validated.data.category,
      description: validated.data.description || "",
      phone: validated.data.phone || null,
      zone: validated.data.zone || null,
      status: "active",
      rating: "5.0",
      totalReviews: 0,
      isOpen: true,
      avatar: "/icons/logo-lightmode.png",
    });

    // 3. Jika nomor booth dipilih, perbarui status booth
    if (validated.data.boothNumber) {
      await db
        .update(boothSlots)
        .set({
          status: "occupied",
          tenantId: newTenantId,
        })
        .where(eq(boothSlots.boothNumber, validated.data.boothNumber));
    }

    return {
      success: true,
      message: `Akun Seller (${sellerUser.email}) dan Tenant "${validated.data.tenantName}" berhasil dibuat!`,
      user: {
        id: sellerUser.id,
        name: sellerUser.name,
        email: sellerUser.email,
        role: sellerUser.role,
      },
      tenantId: newTenantId,
    };
  } catch (error) {
    const err = error as { message?: string; body?: { message?: string } };
    const errorMessage =
      err.body?.message ||
      err.message ||
      "Gagal membuat akun Seller dan Tenant. Periksa apakah email sudah terdaftar.";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Server action khusus Developer untuk membuat akun Association baru.
 */
export async function createAssociationAccountAction(
  data: TCreateAssociationSchema
): Promise<AccountResponse> {
  try {
    const validated = createAssociationSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Format data association tidak valid",
      };
    }

    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    if (!session) {
      return {
        success: false,
        message: "Sesi tidak valid. Silakan login kembali.",
      };
    }

    const callerRole = (session.user as { role?: string }).role;
    if (callerRole !== "developer") {
      return {
        success: false,
        message: "Hanya Developer yang berwenang menambahkan akun Association baru.",
      };
    }

    // Buat akun Association via Better Auth Admin API
    const response = await auth.api.createUser({
      body: {
        name: validated.data.name,
        email: validated.data.email,
        password: validated.data.password,
        role: "association",
      },
      headers: headerList,
    });

    if (!response || !response.user) {
      return {
        success: false,
        message: "Gagal membuat akun Association.",
      };
    }

    const associationUser = response.user;
    const associationCode = await assignAssociationCode(associationUser.id);

    return {
      success: true,
      message: `Akun Association (${associationUser.email}) berhasil dibuat! Kode pengelola: ${associationCode}`,
      user: {
        id: associationUser.id,
        name: associationUser.name,
        email: associationUser.email,
        role: associationUser.role,
      },
    };
  } catch (error) {
    const err = error as { message?: string; body?: { message?: string } };
    const errorMessage =
      err.body?.message ||
      err.message ||
      "Gagal membuat akun Association. Periksa apakah email sudah terdaftar.";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Alias untuk kompatibilitas ke belakang
export const createProviderAccountAction = createAssociationAccountAction;

/**
 * Membuat kode unik untuk Association yang belum memilikinya.
 */
export async function ensureAssociationCodeAction(): Promise<{
  success: boolean;
  message: string;
  code?: string;
}> {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    if (!session) {
      return { success: false, message: "Sesi tidak valid. Silakan login kembali." };
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "association" && role !== "developer") {
      return { success: false, message: "Hanya Association yang dapat membuat kode pengelola." };
    }

    const [row] = await db
      .select({ code: user.associationCode })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (row?.code) {
      return { success: true, message: "Kode pengelola sudah tersedia", code: row.code };
    }

    const code = await assignAssociationCode(session.user.id);
    return { success: true, message: "Kode pengelola berhasil dibuat", code };
  } catch (error) {
    const err = error as { message?: string; body?: { message?: string } };
    return {
      success: false,
      message: err.body?.message || err.message || "Gagal membuat kode pengelola.",
    };
  }
}
