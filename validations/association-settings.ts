import { z } from "zod";

export const associationSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama area minimal 3 karakter")
    .max(80, "Nama area maksimal 80 karakter"),
  description: z
    .string()
    .trim()
    .max(240, "Deskripsi maksimal 240 karakter")
    .optional()
    .default(""),
  address: z
    .string()
    .trim()
    .max(160, "Alamat maksimal 160 karakter")
    .optional()
    .default(""),
  phone: z
    .string()
    .trim()
    .max(20, "Nomor telepon maksimal 20 karakter")
    .optional()
    .default(""),
  email: z
    .union([z.literal(""), z.string().email("Format email tidak valid")])
    .optional()
    .default(""),
  notifyNewTenant: z.boolean(),
  notifyNewReview: z.boolean(),
  notifyPaymentDue: z.boolean(),
  bankName: z
    .string()
    .trim()
    .max(60, "Nama bank maksimal 60 karakter")
    .optional()
    .default(""),
  bankAccountNumber: z
    .string()
    .trim()
    .max(40, "Nomor rekening maksimal 40 karakter")
    .optional()
    .default(""),
  bankAccountHolder: z
    .string()
    .trim()
    .max(80, "Nama pemilik rekening maksimal 80 karakter")
    .optional()
    .default(""),
});

export type TAssociationSettings = z.input<typeof associationSettingsSchema>;
