import { z } from "zod";

const zoneLayoutSchema = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
  width: z.coerce.number().min(40),
  height: z.coerce.number().min(40),
  color: z.string().max(60),
  borderColor: z.string().max(60),
});

const boothLayoutSchema = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
  width: z.coerce.number().min(20),
  height: z.coerce.number().min(20),
  rotation: z.coerce.number(),
});

const priceSchema = z.coerce
  .number()
  .int("Harga harus bilangan bulat")
  .min(0, "Harga tidak boleh negatif")
  .max(1_000_000_000, "Harga terlalu besar");

const sizeSchema = z
  .string()
  .trim()
  .min(1, "Ukuran wajib diisi")
  .max(20, "Ukuran maksimal 20 karakter");

export const createZoneSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Kode zona wajib diisi")
    .max(8, "Kode zona maksimal 8 karakter")
    .regex(/^[A-Za-z0-9]+$/, "Kode zona hanya huruf dan angka")
    .transform((value) => value.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, "Nama zona minimal 2 karakter")
    .max(80, "Nama zona maksimal 80 karakter"),
  description: z
    .string()
    .trim()
    .max(160, "Deskripsi maksimal 160 karakter")
    .optional()
    .default(""),
  categoryFocus: z
    .string()
    .trim()
    .max(40, "Fokus kategori maksimal 40 karakter")
    .optional()
    .default(""),
  boothCount: z.coerce
    .number()
    .int("Jumlah booth harus bilangan bulat")
    .min(0, "Jumlah booth tidak boleh negatif")
    .max(200, "Maksimal 200 booth per zona"),
  startNumber: z.coerce
    .number()
    .int("Nomor awal harus bilangan bulat")
    .min(1, "Nomor awal minimal 1")
    .max(999, "Nomor awal maksimal 999"),
  size: sizeSchema,
  priceMonthly: priceSchema,
});

export const createBoothSchema = z.object({
  zoneId: z.string().min(1, "Zona wajib dipilih"),
  boothNumber: z
    .string()
    .trim()
    .min(1, "Nomor booth wajib diisi")
    .max(20, "Nomor booth maksimal 20 karakter"),
  size: sizeSchema,
  priceMonthly: priceSchema,
});

export const updateBoothSchema = createBoothSchema.extend({
  id: z.string().min(1, "Booth tidak ditemukan"),
  status: z.enum(["available", "reserved", "occupied"]),
});

export const saveFloorplanSchema = z.object({
  zones: z
    .array(
      z.object({
        code: z.string().trim().min(1).max(8),
        name: z.string().trim().min(1).max(80),
        layout: zoneLayoutSchema,
      })
    )
    .max(100),
  booths: z
    .array(
      z.object({
        code: z.string().trim().min(1).max(20),
        zoneCode: z.string().trim().min(1).max(8),
        label: z.string().trim().max(80).optional().default(""),
        sizeMeters: sizeSchema,
        priceMonthly: priceSchema,
        status: z.enum(["available", "reserved", "occupied"]),
        tenantId: z.string().trim().max(64).optional(),
        layout: boothLayoutSchema,
      })
    )
    .max(2000),
});

export type TCreateZone = z.input<typeof createZoneSchema>;
export type TCreateBooth = z.input<typeof createBoothSchema>;
export type TUpdateBooth = z.input<typeof updateBoothSchema>;
export type TSaveFloorplan = z.input<typeof saveFloorplanSchema>;
