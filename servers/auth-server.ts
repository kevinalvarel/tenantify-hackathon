"use server";

import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import { user } from "@/db/schema";
import { assignAssociationCode } from "@/lib/association-code";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  loginSchema,
  registerSchema,
  type TLoginSchema,
  type TRegisterSchema,
} from "@/validations/auth-validation";

export type AuthResponse = {
  success: boolean;
  message: string;
};

export const signIn = async (data: TLoginSchema): Promise<AuthResponse> => {
  try {
    const validated = loginSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message:
          validated.error.issues[0]?.message || "Format data tidak valid",
      };
    }

    const headerList = await headers();

    await auth.api.signInEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
      },
      headers: headerList,
    });

    return {
      success: true,
      message: "Berhasil masuk ke akun Anda",
    };
  } catch (error) {
    const err = error as { message?: string; body?: { message?: string } };
    const errorMessage =
      err.body?.message ||
      err.message ||
      "Gagal masuk. Periksa kembali email dan kata sandi Anda.";

    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const signUp = async (data: TRegisterSchema): Promise<AuthResponse> => {
  try {
    const validated = registerSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message:
          validated.error.issues[0]?.message || "Format data tidak valid",
      };
    }

    const headerList = await headers();

    const { user: createdUser } = await auth.api.signUpEmail({
      body: {
        name: validated.data.name,
        email: validated.data.email,
        password: validated.data.password,
      },
      headers: headerList,
    });

    await db
      .update(user)
      .set({ role: "association" })
      .where(eq(user.id, createdUser.id));

    const associationCode = await assignAssociationCode(createdUser.id);

    return {
      success: true,
      message: `Pendaftaran akun Association berhasil. Kode pengelola Anda: ${associationCode}`,
    };
  } catch (error) {
    const err = error as { message?: string; body?: { message?: string } };
    const errorMessage =
      err.body?.message ||
      err.message ||
      "Gagal membuat akun baru. Email mungkin sudah terdaftar.";

    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const signUpCustomer = async (
  data: TRegisterSchema,
): Promise<AuthResponse> => {
  try {
    const validated = registerSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message:
          validated.error.issues[0]?.message || "Format data tidak valid",
      };
    }

    const headerList = await headers();

    await auth.api.signUpEmail({
      body: {
        name: validated.data.name,
        email: validated.data.email,
        password: validated.data.password,
      },
      headers: headerList,
    });

    return {
      success: true,
      message: "Pendaftaran akun pembeli berhasil.",
    };
  } catch (error) {
    const err = error as { message?: string; body?: { message?: string } };
    const errorMessage =
      err.body?.message ||
      err.message ||
      "Gagal membuat akun baru. Email mungkin sudah terdaftar.";

    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const logout = async (): Promise<AuthResponse> => {
  try {
    const headerList = await headers();
    await auth.api.signOut({
      headers: headerList,
    });

    return {
      success: true,
      message: "Berhasil keluar dari akun",
    };
  } catch (error) {
    const err = error as { message?: string; body?: { message?: string } };
    const errorMessage =
      err.body?.message || err.message || "Gagal keluar dari akun";

    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const updateCustomerProfile = async (data: {
  name: string;
}): Promise<AuthResponse> => {
  try {
    const cleanName = data.name?.trim();
    if (!cleanName) {
      return {
        success: false,
        message: "Nama tidak boleh kosong.",
      };
    }

    const headerList = await headers();
    const currentSession = await auth.api.getSession({
      headers: headerList,
    });

    if (!currentSession?.user) {
      return {
        success: false,
        message: "Sesi tidak ditemukan. Silakan masuk terlebih dahulu.",
      };
    }

    await db
      .update(user)
      .set({
        name: cleanName,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentSession.user.id));

    return {
      success: true,
      message: "Profil pengguna berhasil diperbarui.",
    };
  } catch (error) {
    const err = error as { message?: string };
    return {
      success: false,
      message: err.message || "Gagal memperbarui profil pengguna.",
    };
  }
};

export const signOut = logout;
