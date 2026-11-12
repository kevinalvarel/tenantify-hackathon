"use server";

import { db } from "@/drizzle";
import { tenants, boothSlots, zones, user, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { AreaZone, AssociationTenant, BoothSlot } from "@/types/association";

export async function getAssociationDataAction(): Promise<{
  tenants: AssociationTenant[];
  booths: BoothSlot[];
  zones: AreaZone[];
}> {
  try {
    // 1. Fetch zones
    const zoneRows = await db.select().from(zones);
    const mappedZones: AreaZone[] = zoneRows.map((z) => ({
      id: z.id,
      name: z.name,
      code: z.code,
      description: z.description || "",
      categoryFocus: z.categoryFocus || "",
      totalBooths: z.totalBooths,
      occupiedBooths: z.occupiedBooths,
    }));

    // 2. Fetch booths
    const boothRows = await db
      .select({
        id: boothSlots.id,
        boothNumber: boothSlots.boothNumber,
        status: boothSlots.status,
        size: boothSlots.size,
        priceMonthly: boothSlots.priceMonthly,
        tenantId: boothSlots.tenantId,
        zoneCode: zones.code,
        tenantName: tenants.name,
        category: tenants.category,
      })
      .from(boothSlots)
      .leftJoin(zones, eq(boothSlots.zoneId, zones.id))
      .leftJoin(tenants, eq(boothSlots.tenantId, tenants.id));

    const mappedBooths: BoothSlot[] = boothRows.map((b) => ({
      id: b.id,
      zoneCode: b.zoneCode || "",
      boothNumber: b.boothNumber,
      tenantId: b.tenantId || undefined,
      tenantName: b.tenantName || undefined,
      category: b.category || undefined,
      status: (b.status as "occupied" | "available" | "reserved") || "available",
      size: b.size,
      priceMonthly: b.priceMonthly,
    }));

    // 3. Fetch tenants with seller info & booth info
    const tenantRows = await db
      .select({
        tenant: tenants,
        seller: {
          name: user.name,
          email: user.email,
        },
        boothNumber: boothSlots.boothNumber,
      })
      .from(tenants)
      .leftJoin(user, eq(tenants.sellerId, user.id))
      .leftJoin(boothSlots, eq(tenants.id, boothSlots.tenantId));

    // Get product count per tenant
    const productCounts = await db
      .select({
        tenantId: products.tenantId,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .groupBy(products.tenantId);

    const productCountMap = new Map(productCounts.map((p) => [p.tenantId, p.count]));

    const mappedTenants: AssociationTenant[] = tenantRows.map((r) => {
      const t = r.tenant;
      const joinedDate = t.joinedAt ? new Date(t.joinedAt) : new Date();
      const formattedDate = `${String(joinedDate.getDate()).padStart(2, "0")}/${String(
        joinedDate.getMonth() + 1
      ).padStart(2, "0")}/${joinedDate.getFullYear()}`;

      const avatar = t.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

      return {
        id: t.id,
        name: t.name,
        owner: r.seller?.name || "Pengelola",
        email: r.seller?.email || "",
        phone: t.phone || "",
        category: t.category,
        zone: t.zone || "",
        boothNumber: r.boothNumber || "",
        status: (t.status === "active" ? "active" : "inactive") as "active" | "inactive",
        joinedAt: formattedDate,
        monthlyRevenue: 0,
        rating: Number(t.rating) || 0,
        totalProducts: productCountMap.get(t.id) || 0,
        avatar: avatar || "T",
        description: t.description || undefined,
      };
    });

    return {
      tenants: mappedTenants,
      booths: mappedBooths,
      zones: mappedZones,
    };
  } catch (error) {
    console.error("Gagal mengambil data association dari database:", error);
    return {
      tenants: [],
      booths: [],
      zones: [],
    };
  }
}

