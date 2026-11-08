import { relations } from "drizzle-orm/_relations";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./users";
import { tenants } from "./tenants";
import { products } from "./products";

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id").references(() => user.id, {
      onDelete: "set null",
    }),
    pickupCode: text("pickup_code").notNull(),
    orderType: text("order_type").notNull(), // 'Dine-in (Makan di Tempat)' | 'Takeaway (Bawa Pulang)' | 'POS Kasir'
    tableNumber: text("table_number"),
    subtotal: integer("subtotal").notNull().default(0),
    platformFee: integer("platform_fee").notNull().default(1000),
    total: integer("total").notNull().default(0),
    paymentMethod: text("payment_method").notNull(), // 'QRIS' | 'GoPay / OVO' | 'Virtual Account' | 'Tunai' | 'Debit / Transfer' | 'Bayar di Tenant'
    paymentStatus: text("payment_status").notNull().default("pending"), // 'pending' | 'paid' | 'failed'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("orders_customerId_idx").on(table.customerId),
    index("orders_pickupCode_idx").on(table.pickupCode),
    index("orders_paymentStatus_idx").on(table.paymentStatus),
  ],
);

export const tenantOrders = pgTable(
  "tenant_orders",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    customerName: text("customer_name"),
    tableNumber: text("table_number"),
    type: text("type").notNull(), // 'Online Order' | 'POS Kasir'
    subtotal: integer("subtotal").notNull().default(0),
    tax: integer("tax").notNull().default(0),
    total: integer("total").notNull().default(0),
    status: text("status").notNull().default("Masuk"), // 'Masuk' | 'Diproses' | 'Siap Diambil' | 'Selesai' | 'Dibatalkan'
    paymentMethod: text("payment_method").notNull(),
    isPaid: boolean("is_paid").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("tenant_orders_orderId_idx").on(table.orderId),
    index("tenant_orders_tenantId_idx").on(table.tenantId),
    index("tenant_orders_status_idx").on(table.status),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    tenantOrderId: text("tenant_order_id")
      .notNull()
      .references(() => tenantOrders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productName: text("product_name").notNull(),
    price: integer("price").notNull(),
    quantity: integer("quantity").notNull().default(1),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("order_items_tenantOrderId_idx").on(table.tenantOrderId),
    index("order_items_productId_idx").on(table.productId),
  ],
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(user, {
    fields: [orders.customerId],
    references: [user.id],
  }),
  tenantOrders: many(tenantOrders),
}));

export const tenantOrdersRelations = relations(
  tenantOrders,
  ({ one, many }) => ({
    order: one(orders, {
      fields: [tenantOrders.orderId],
      references: [orders.id],
    }),
    tenant: one(tenants, {
      fields: [tenantOrders.tenantId],
      references: [tenants.id],
    }),
    items: many(orderItems),
  }),
);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  tenantOrder: one(tenantOrders, {
    fields: [orderItems.tenantOrderId],
    references: [tenantOrders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
