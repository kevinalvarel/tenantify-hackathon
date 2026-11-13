"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import {
  associationProfiles,
  boothSlots,
  rentInvoices,
  tenants,
} from "@/db/schema";
import { formatRentPeriod, loadRentInvoices } from "@/servers/rent-data";
import type { RentInvoice } from "@/types/seller";
import {
  createRentInvoiceSchema,
  type TCreateRentInvoice,
} from "@/validations/rent-invoice";

export type AssociationRentTenant = {
  id: string;
  name: string;
  boothNumber: string;
  boothSize: string;
  priceMonthly: number;
};

export type AssociationRentData = {
  invoices: RentInvoice[];
  tenants: AssociationRentTenant[];
  error?: string;
};

type RentActionResult = {
  success: boolean;
  message: string;
  invoice?: RentInvoice;
};

const SESSION_MESSAGE = "Sesi tidak valid. Silakan login kembali.";

async function currentRole() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role =
    (session?.user as { role?: string } | undefined)?.role || "customer";
  return { session, role };
}

function shortCode(length: number) {
  return crypto.randomUUID().replace(/-/g, "").slice(0, length).toUpperCase();
}

export async function getAssociationRentDataAction(): Promise<AssociationRentData> {
  const { session, role } = await currentRole();
  if (!session || (role !== "association" && role !== "developer")) {
    return { invoices: [], tenants: [], error: SESSION_MESSAGE };
  }

  try {
    const invoices = await loadRentInvoices();

    const rows = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        boothNumber: boothSlots.boothNumber,
        boothSize: boothSlots.size,
        priceMonthly: boothSlots.priceMonthly,
      })
      .from(tenants)
      .leftJoin(boothSlots, eq(boothSlots.tenantId, tenants.id))
      .where(eq(tenants.status, "active"))
      .orderBy(tenants.name);

    const tenantById = new Map<string, AssociationRentTenant>();
    for (const row of rows) {
      if (!tenantById.has(row.id)) {
        tenantById.set(row.id, {
          id: row.id,
          name: row.name,
          boothNumber: row.boothNumber || "-",
          boothSize: row.boothSize || "-",
          priceMonthly: row.priceMonthly ?? 0,
        });
      }
    }

    return { invoices, tenants: Array.from(tenantById.values()) };
  } catch (error) {
    console.error("Gagal memuat tagihan sewa:", error);
    return {
      invoices: [],
      tenants: [],
      error: "Gagal memuat data pembayaran dari database.",
    };
  }
}

export async function createRentInvoiceAction(
  input: TCreateRentInvoice
): Promise<RentActionResult> {
  const parsed = createRentInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data tagihan tidak valid.",
    };
  }

  const { session, role } = await currentRole();
  if (!session || (role !== "association" && role !== "developer")) {
    return { success: false, message: SESSION_MESSAGE };
  }

  const data = parsed.data;
  const totalAmount = data.baseRent + data.maintenanceFee + data.electricityFee;
  if (totalAmount <= 0) {
    return { success: false, message: "Total tagihan harus lebih dari nol." };
  }

  try {
    const [tenant] = await db
      .select({ id: tenants.id, name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, data.tenantId))
      .limit(1);

    if (!tenant) {
      return { success: false, message: "Pedagang tidak ditemukan." };
    }

    const [duplicate] = await db
      .select({ id: rentInvoices.id })
      .from(rentInvoices)
      .where(
        and(
          eq(rentInvoices.tenantId, tenant.id),
          eq(rentInvoices.period, data.period)
        )
      )
      .limit(1);

    if (duplicate) {
      return {
        success: false,
        message: `Tagihan periode ini untuk ${tenant.name} sudah diterbitkan.`,
      };
    }

    const [profile] = await db
      .select({
        name: associationProfiles.name,
        bankName: associationProfiles.bankName,
        bankAccountNumber: associationProfiles.bankAccountNumber,
        bankAccountHolder: associationProfiles.bankAccountHolder,
      })
      .from(associationProfiles)
      .where(eq(associationProfiles.id, session.user.id))
      .limit(1);

    const invoiceId = crypto.randomUUID();

    await db.insert(rentInvoices).values({
      id: invoiceId,
      tenantId: tenant.id,
      invoiceNumber: `INV-${data.period.replace("-", "")}-${shortCode(6)}`,
      period: data.period,
      associationName: profile?.name || "Pengelola Area",
      bankName: profile?.bankName || null,
      bankAccountNumber: profile?.bankAccountNumber || null,
      bankAccountHolder: profile?.bankAccountHolder || null,
      baseRent: data.baseRent,
      maintenanceFee: data.maintenanceFee,
      electricityFee: data.electricityFee,
      totalAmount,
      dueDate: new Date(`${data.dueDate}T23:59:59`),
      status: "unpaid",
    });

    revalidatePath("/dashboard/association/payments");
    revalidatePath("/dashboard/seller/payments");

    const created = (await loadRentInvoices(tenant.id)).find(
      (invoice) => invoice.id === invoiceId
    );

    return {
      success: true,
      message: `Tagihan ${formatRentPeriod(data.period)} untuk ${tenant.name} diterbitkan.`,
      invoice: created,
    };
  } catch (error) {
    console.error("Gagal menerbitkan tagihan sewa:", error);
    return { success: false, message: "Gagal menerbitkan tagihan sewa." };
  }
}

export async function settleRentInvoiceAction(
  invoiceId: string,
  paymentMethod: string
): Promise<RentActionResult> {
  const { session, role } = await currentRole();
  if (!session) {
    return { success: false, message: SESSION_MESSAGE };
  }

  try {
    const [invoice] = await db
      .select()
      .from(rentInvoices)
      .where(eq(rentInvoices.id, invoiceId))
      .limit(1);

    if (!invoice) {
      return { success: false, message: "Tagihan tidak ditemukan." };
    }

    if (role === "seller") {
      const [tenant] = await db
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.sellerId, session.user.id))
        .limit(1);

      if (!tenant || tenant.id !== invoice.tenantId) {
        return { success: false, message: "Tagihan ini bukan milik tenant Anda." };
      }
    } else if (role !== "association" && role !== "developer") {
      return { success: false, message: SESSION_MESSAGE };
    }

    if (invoice.status === "paid") {
      return { success: false, message: "Tagihan ini sudah lunas." };
    }

    const now = new Date();
    const receiptNumber = `RCP-${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${shortCode(6)}`;

    await db
      .update(rentInvoices)
      .set({
        status: "paid",
        paidAt: now,
        paymentMethod: paymentMethod.trim().slice(0, 40) || "Transfer Bank",
        receiptNumber,
      })
      .where(eq(rentInvoices.id, invoice.id));

    revalidatePath("/dashboard/association/payments");
    revalidatePath("/dashboard/seller/payments");

    const updated = (await loadRentInvoices(invoice.tenantId)).find(
      (item) => item.id === invoice.id
    );

    return {
      success: true,
      message: "Pembayaran sewa tercatat sebagai lunas.",
      invoice: updated,
    };
  } catch (error) {
    console.error("Gagal mencatat pembayaran sewa:", error);
    return { success: false, message: "Gagal mencatat pembayaran sewa." };
  }
}
