import { z } from "zod";

const rupiah = z
  .number()
  .int("Nominal harus bilangan bulat")
  .min(0, "Nominal tidak boleh negatif")
  .max(1_000_000_000, "Nominal terlalu besar");

export const createRentInvoiceSchema = z.object({
  tenantId: z.string().min(1, "Pilih pedagang terlebih dahulu"),
  period: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Periode harus dalam format YYYY-MM"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal jatuh tempo tidak valid"),
  baseRent: rupiah,
  maintenanceFee: rupiah,
  electricityFee: rupiah,
});

export type TCreateRentInvoice = z.input<typeof createRentInvoiceSchema>;
