import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi harus diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type TLoginSchema = z.infer<typeof loginSchema>;
export type TRegisterSchema = z.infer<typeof registerSchema>;

export const joinAssociationSchema = z.object({
  code: z
    .string()
    .transform((value) => value.trim().toUpperCase())
    .pipe(
      z
        .string()
        .regex(/^[A-Z0-9]{6}$/, "Kode pengelola harus 6 karakter"),
    ),
});

export type TJoinAssociationSchema = z.infer<typeof joinAssociationSchema>;

export const createSellerSchema = z.object({
  name: z.string().min(3, "Nama lengkap pemilik minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  tenantName: z.string().min(3, "Nama usaha/tenant minimal 3 karakter"),
  category: z.string().min(2, "Kategori wajib dipilih"),
  zone: z.string().optional(),
  boothNumber: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
});

export const registerSellerSchema = createSellerSchema
  .extend({
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi harus diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export const createAssociationSchema = z.object({
  name: z.string().min(3, "Nama lengkap association minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export type TCreateSellerSchema = z.infer<typeof createSellerSchema>;
export type TRegisterSellerSchema = z.infer<typeof registerSellerSchema>;
export type TCreateAssociationSchema = z.infer<typeof createAssociationSchema>;

// Alias untuk kompatibilitas ke belakang
export const createProviderSchema = createAssociationSchema;
export type TCreateProviderSchema = TCreateAssociationSchema;