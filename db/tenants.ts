import { relations } from "drizzle-orm/_relations";
import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { user } from "./users";

export const zones = pgTable("zones", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryFocus: text("category_focus"),
  totalBooths: integer("total_booths").default(0).notNull(),
  occupiedBooths: integer("occupied_booths").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const tenants = pgTable(
  "tenants",
  {
    id: text("id").primaryKey(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    phone: text("phone"),
    zone: text("zone"),
    status: text("status").notNull().default("active"), // active | inactive
    rating: text("rating").notNull().default("0.0"),
    totalReviews: integer("total_reviews").notNull().default(0),
    isOpen: boolean("is_open").notNull().default(false),
    avatar: text("avatar"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("tenants_sellerId_idx").on(table.sellerId),
    index("tenants_status_idx").on(table.status),
  ]
);

export const boothSlots = pgTable(
  "booth_slots",
  {
    id: text("id").primaryKey(),
    zoneId: text("zone_id")
      .notNull()
      .references(() => zones.id, { onDelete: "cascade" }),
    boothNumber: text("booth_number").notNull(),
    tenantId: text("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
    status: text("status").notNull().default("available"), // available | occupied | reserved
    size: text("size").notNull().default("3x3 m"),
    priceMonthly: integer("price_monthly").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("booth_slots_zoneId_idx").on(table.zoneId),
    index("booth_slots_tenantId_idx").on(table.tenantId),
  ]
);

export const zonesRelations = relations(zones, ({ many }) => ({
  boothSlots: many(boothSlots),
}));

export const boothSlotsRelations = relations(boothSlots, ({ one }) => ({
  zone: one(zones, {
    fields: [boothSlots.zoneId],
    references: [zones.id],
  }),
  tenant: one(tenants, {
    fields: [boothSlots.tenantId],
    references: [tenants.id],
  }),
}));

export const tenantsRelations = relations(tenants, ({ one }) => ({
  seller: one(user, {
    fields: [tenants.sellerId],
    references: [user.id],
  }),
  boothSlot: one(boothSlots, {
    fields: [tenants.id],
    references: [boothSlots.tenantId],
  }),
}));
