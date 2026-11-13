import { z } from "zod";

export const productCategoryEnum = z.enum([
  "Makanan",
  "Minuman",
  "Camilan",
  "Paket Hemat",
]);

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama produk minimal 2 karakter")
    .max(100, "Nama produk maksimal 100 karakter"),
  sku: z
    .string()
    .trim()
    .max(40, "Kode SKU maksimal 40 karakter")
    .optional()
    .or(z.literal("")),
  category: productCategoryEnum,
  price: z
    .number({ message: "Harga harus berupa angka" })
    .min(0, "Harga tidak boleh negatif")
    .max(1_000_000_000, "Harga terlalu besar"),
  stock: z
    .number({ message: "Stok harus berupa angka" })
    .min(0, "Stok awal tidak boleh negatif")
    .max(100_000, "Stok awal maksimal 100.000"),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
});

export type TProductInput = z.infer<typeof productSchema>;
