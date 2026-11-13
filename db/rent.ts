import { pgTable, text, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const rentInvoices = pgTable(
  "rent_invoices",
  {
    id: text("id").primaryKey(),
    // shortcut: single-association deployment, add associationId when multi-tenant associations ship.
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invoiceNumber: text("invoice_number").notNull(),
    period: text("period").notNull(), // YYYY-MM
    associationName: text("association_name").notNull(),
    bankName: text("bank_name"),
    bankAccountNumber: text("bank_account_number"),
    bankAccountHolder: text("bank_account_holder"),
    baseRent: integer("base_rent").notNull().default(0),
    maintenanceFee: integer("maintenance_fee").notNull().default(0),
    electricityFee: integer("electricity_fee").notNull().default(0),
    totalAmount: integer("total_amount").notNull().default(0),
    dueDate: timestamp("due_date").notNull(),
    status: text("status").notNull().default("unpaid"), // unpaid | paid
    paidAt: timestamp("paid_at"),
    paymentMethod: text("payment_method"),
    receiptNumber: text("receipt_number"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("rent_invoices_tenantId_idx").on(table.tenantId),
    index("rent_invoices_status_idx").on(table.status),
    uniqueIndex("rent_invoices_number_idx").on(table.invoiceNumber),
  ]
);
