import { relations } from "drizzle-orm/_relations";
import {
  pgTable,
  text,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./users";
import { tenants } from "./tenants";
import { orders } from "./orders";

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    customerId: text("customer_id").references(() => user.id, {
      onDelete: "set null",
    }),
    customerName: text("customer_name").notNull().default("Pelanggan"),
    rating: integer("rating").notNull().default(5),
    comment: text("comment").notNull(),
    replyMessage: text("reply_message"),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("reviews_orderId_idx").on(table.orderId),
    index("reviews_tenantId_idx").on(table.tenantId),
    index("reviews_customerId_idx").on(table.customerId),
    index("reviews_rating_idx").on(table.rating),
  ],
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  tenant: one(tenants, {
    fields: [reviews.tenantId],
    references: [tenants.id],
  }),
  customer: one(user, {
    fields: [reviews.customerId],
    references: [user.id],
  }),
}));
