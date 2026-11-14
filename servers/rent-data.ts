import { desc, eq } from "drizzle-orm";
import { db } from "@/drizzle";
import { boothSlots, rentInvoices, tenants } from "@/db/schema";
import type { RentInvoice } from "@/types/seller";

export function formatRentPeriod(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function formatRentDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export async function loadRentInvoices(
  tenantId?: string,
): Promise<RentInvoice[]> {
  const rows = await db
    .select({ invoice: rentInvoices, tenantName: tenants.name })
    .from(rentInvoices)
    .innerJoin(tenants, eq(rentInvoices.tenantId, tenants.id))
    .where(tenantId ? eq(rentInvoices.tenantId, tenantId) : undefined)
    .orderBy(desc(rentInvoices.period), desc(rentInvoices.createdAt));

  const boothRows = await db
    .select({
      tenantId: boothSlots.tenantId,
      boothNumber: boothSlots.boothNumber,
      size: boothSlots.size,
    })
    .from(boothSlots);

  const boothByTenant = new Map(
    boothRows
      .filter((booth) => booth.tenantId)
      .map((booth) => [booth.tenantId as string, booth]),
  );

  const today = Date.now();

  return rows.map(({ invoice, tenantName }) => {
    const booth = boothByTenant.get(invoice.tenantId);
    const overdue =
      invoice.status !== "paid" && invoice.dueDate.getTime() < today;

    return {
      id: invoice.id,
      tenantId: invoice.tenantId,
      tenantName,
      invoiceNumber: invoice.invoiceNumber,
      period: formatRentPeriod(invoice.period),
      associationName: invoice.associationName,
      boothNumber: booth?.boothNumber || "-",
      boothSize: booth?.size || "-",
      baseRent: invoice.baseRent,
      maintenanceFee: invoice.maintenanceFee,
      electricityFee: invoice.electricityFee,
      totalAmount: invoice.totalAmount,
      dueDate: formatRentDate(invoice.dueDate),
      status:
        invoice.status === "paid" ? "paid" : overdue ? "overdue" : "unpaid",
      paidAt: invoice.paidAt ? formatRentDate(invoice.paidAt) : undefined,
      paymentMethod: invoice.paymentMethod || undefined,
      receiptNumber: invoice.receiptNumber || undefined,
      bankName: invoice.bankName || undefined,
      bankAccountNumber: invoice.bankAccountNumber || undefined,
      bankAccountHolder: invoice.bankAccountHolder || undefined,
    };
  });
}
