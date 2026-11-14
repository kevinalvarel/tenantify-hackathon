import { relations } from "drizzle-orm/_relations";
import {
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const promotions = pgTable(
  "promotions",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull().default("Info"),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    status: text("status").notNull().default("Terkirim"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("promotions_tenant_id_idx").on(table.tenantId),
    index("promotions_created_at_idx").on(table.createdAt),
  ],
);

export const promotionsRelations = relations(promotions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [promotions.tenantId],
    references: [tenants.id],
  }),
}));

