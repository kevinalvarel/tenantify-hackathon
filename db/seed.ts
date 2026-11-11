import "dotenv/config";
import { eq, or } from "drizzle-orm";
import { db } from "@/drizzle";
import {
  user,
  zones,
  tenants,
  boothSlots,
  products,
  productRecommendations,
  orderItems,
  tenantOrders,
  orders,
} from "@/db/schema";
import {
  demoZones,
  demoTenants as associationTenants,
  demoBooths,
} from "@/data/association-demo";
import {
  demoTenants as customerTenants,
  demoProducts,
} from "@/data/customer-demo";

const SEED_SELLER_ID = "seed-seller";
const SEED_SELLER_EMAIL = "seed-seller@tenantify.id";
const CUSTOMER_JOINED_AT = new Date(Date.UTC(2026, 0, 12));

function parseJoinedAt(value: string): Date {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function mapProductCategory(raw: string): string {
  if (/minuman|kopi|teh|matcha/i.test(raw)) return "Minuman";
  if (/camilan|roti|toast/i.test(raw)) return "Camilan";
  if (/paket/i.test(raw)) return "Paket Hemat";
  return "Makanan";
}

async function ensureSeedSeller(): Promise<string> {
  await db
    .insert(user)
    .values({
      id: SEED_SELLER_ID,
      name: "Seed Seller",
      email: SEED_SELLER_EMAIL,
      emailVerified: true,
      role: "seller",
    })
    .onConflictDoNothing();

  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(or(eq(user.id, SEED_SELLER_ID), eq(user.email, SEED_SELLER_EMAIL)))
    .limit(1);

  if (!row) throw new Error("Seed seller gagal dibuat.");
  return row.id;
}

async function clearSeedTables() {
  await db.delete(orderItems);
  await db.delete(tenantOrders);
  await db.delete(orders);
  await db.delete(productRecommendations);
  await db.delete(products);
  await db.delete(boothSlots);
  await db.delete(tenants);
  await db.delete(zones);
}

function checkSeedData(
  tenantRows: { id: string }[],
  productRows: { id: string; tenantId: string }[],
  boothRows: { id: string; zoneId: string; tenantId: string | null }[],
) {
  const tenantIds = new Set(tenantRows.map((tenant) => tenant.id));
  const zoneIds = new Set(demoZones.map((zone) => zone.id));

  if (tenantRows.length !== associationTenants.length + customerTenants.length) {
    throw new Error("Jumlah tenant tidak sesuai data demo.");
  }
  if (productRows.length !== demoProducts.length) {
    throw new Error("Jumlah produk tidak sesuai data demo.");
  }
  if (boothRows.length !== demoBooths.length + customerTenants.length) {
    throw new Error("Jumlah booth tidak sesuai data demo.");
  }
  if (new Set(boothRows.map((booth) => booth.id)).size !== boothRows.length) {
    throw new Error("Ada ID booth ganda.");
  }
  for (const product of productRows) {
    if (!tenantIds.has(product.tenantId)) {
      throw new Error(`Produk ${product.id} menunjuk tenant yang tidak ada.`);
    }
  }
  for (const booth of boothRows) {
    if (!zoneIds.has(booth.zoneId)) {
      throw new Error(`Booth ${booth.id} menunjuk zona yang tidak ada.`);
    }
    if (booth.tenantId && !tenantIds.has(booth.tenantId)) {
      throw new Error(`Booth ${booth.id} menunjuk tenant yang tidak ada.`);
    }
  }
}

async function main() {
  const sellerId = await ensureSeedSeller();

  const zoneRows = demoZones.map((zone) => ({
    id: zone.id,
    code: zone.code,
    name: zone.name,
    description: zone.description,
    categoryFocus: zone.categoryFocus,
    totalBooths: zone.totalBooths,
    occupiedBooths: zone.occupiedBooths,
  }));

  const tenantRows = [
    ...associationTenants.map((tenant) => ({
      id: tenant.id,
      sellerId,
      name: tenant.name,
      category: tenant.category,
      description: tenant.description ?? null,
      phone: tenant.phone,
      zone: tenant.zone,
      status: tenant.status,
      rating: String(tenant.rating),
      totalReviews: 0,
      isOpen: tenant.status === "active",
      avatar: tenant.avatar,
      joinedAt: parseJoinedAt(tenant.joinedAt),
    })),
    ...customerTenants.map((tenant) => ({
      id: tenant.id,
      sellerId,
      name: tenant.name,
      category: tenant.category,
      description: null,
      phone: null,
      zone: tenant.zone,
      status: "active",
      rating: String(tenant.rating),
      totalReviews: tenant.totalReviews,
      isOpen: tenant.isOpen,
      avatar: tenant.avatarText,
      joinedAt: CUSTOMER_JOINED_AT,
    })),
  ];

  const productRows = demoProducts.map((product) => ({
    id: product.id,
    tenantId: product.tenantId,
    name: product.name,
    category: mapProductCategory(product.category),
    price: product.price,
    stock: 0,
    description: product.description,
    isActive: true,
    isPopular: product.isPopular ?? false,
    rating: String(product.rating),
  }));

  const zoneIdByCode = new Map(demoZones.map((zone) => [zone.code, zone.id]));
  const zoneIdByName = new Map(
    demoZones.map((zone) => [zone.name.split(" - ")[0], zone.id]),
  );

  const boothRows = [
    ...demoBooths.map((booth) => {
      const zoneId = zoneIdByCode.get(booth.zoneCode);
      if (!zoneId) throw new Error(`Zona tidak dikenal: ${booth.zoneCode}`);
      return {
        id: booth.id,
        zoneId,
        boothNumber: booth.boothNumber,
        tenantId: booth.tenantId ?? null,
        status: booth.status,
        size: booth.size,
        priceMonthly: booth.priceMonthly,
      };
    }),
    ...customerTenants.map((tenant) => {
      const zoneId = zoneIdByName.get(tenant.zone);
      if (!zoneId) throw new Error(`Zona tidak dikenal: ${tenant.zone}`);
      return {
        id: `booth-customer-${tenant.id}`,
        zoneId,
        boothNumber: tenant.boothNumber,
        tenantId: tenant.id,
        status: "occupied",
        size: "3x3 m",
        priceMonthly: 0,
      };
    }),
  ];

  checkSeedData(tenantRows, productRows, boothRows);

  const tenantIdByProduct = new Map(
    productRows.map((product) => [product.id, product.tenantId]),
  );
  const complementary: Record<string, string> = {
    Makanan: "Minuman",
    Minuman: "Camilan",
    Camilan: "Minuman",
    "Paket Hemat": "Minuman",
  };

  const recommendationRows: (typeof productRecommendations.$inferInsert)[] = [];
  for (const source of productRows.filter((product) => product.isPopular)) {
    const wanted = complementary[source.category];
    const target = productRows
      .filter(
        (product) =>
          product.category === wanted &&
          tenantIdByProduct.get(product.id) !== source.tenantId,
      )
      .sort((a, b) => b.price - a.price || a.id.localeCompare(b.id))[0];

    if (!target) continue;

    recommendationRows.push({
      id: `rec-${source.id}-${target.id}`,
      sourceProductId: source.id,
      targetProductId: target.id,
      pairingReason: `Cocok dipadukan dengan ${target.name} dari tenant lain.`,
      isActive: true,
    });
  }

  await clearSeedTables();

  await db.insert(zones).values(zoneRows);
  await db.insert(tenants).values(tenantRows);
  await db.insert(products).values(productRows);
  await db.insert(boothSlots).values(boothRows);

  for (const zone of demoZones) {
    const zoneBooths = boothRows.filter((booth) => booth.zoneId === zone.id);
    await db
      .update(zones)
      .set({
        totalBooths: zoneBooths.length,
        occupiedBooths: zoneBooths.filter((booth) => booth.status === "occupied")
          .length,
      })
      .where(eq(zones.id, zone.id));
  }

  if (recommendationRows.length > 0) {
    await db.insert(productRecommendations).values(recommendationRows);
  }

  console.log(
    `Seed selesai: ${zoneRows.length} zona, ${tenantRows.length} tenant, ${boothRows.length} booth, ${productRows.length} produk, ${recommendationRows.length} rekomendasi.`,
  );
}

main().catch((error) => {
  console.error("Seed gagal:", error);
  process.exitCode = 1;
});
