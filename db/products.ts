import { relations } from "drizzle-orm/_relations";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { orderItems } from "./orders";

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sku: text("sku"),
    name: text("name").notNull(),
    category: text("category").notNull(), // 'Makanan' | 'Minuman' | 'Camilan' | 'Paket Hemat'
    price: integer("price").notNull(),
    stock: integer("stock").notNull().default(0),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    isPopular: boolean("is_popular").notNull().default(false),
    rating: text("rating").notNull().default("0.0"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("products_tenantId_idx").on(table.tenantId),
    index("products_category_idx").on(table.category),
    index("products_isActive_idx").on(table.isActive),
  ],
);

export const productRecommendations = pgTable(
  "product_recommendations",
  {
    id: text("id").primaryKey(),
    sourceProductId: text("source_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    targetProductId: text("target_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    pairingReason: text("pairing_reason").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("rec_sourceProductId_idx").on(table.sourceProductId),
    index("rec_targetProductId_idx").on(table.targetProductId),
  ],
);

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  recommendationsGiven: many(productRecommendations, {
    relationName: "sourceProduct",
  }),
  recommendationsReceived: many(productRecommendations, {
    relationName: "targetProduct",
  }),
  orderItems: many(orderItems),
}));

export const productRecommendationsRelations = relations(
  productRecommendations,
  ({ one }) => ({
    sourceProduct: one(products, {
      fields: [productRecommendations.sourceProductId],
      references: [products.id],
      relationName: "sourceProduct",
    }),
    targetProduct: one(products, {
      fields: [productRecommendations.targetProductId],
      references: [products.id],
      relationName: "targetProduct",
    }),
  }),
);
