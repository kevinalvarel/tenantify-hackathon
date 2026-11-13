"use server";

import { db } from "@/drizzle";
import { tenants, boothSlots, products, zones } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CustomerProduct, Tenant } from "@/types/customer";
import type { AreaZone, BoothSlot } from "@/types/association";

export async function getCustomerDataAction(): Promise<{
  products: CustomerProduct[];
  tenants: Tenant[];
}> {
  try {
    // 1. Fetch active tenants
    const tenantRows = await db
      .select({
        tenant: tenants,
        boothNumber: boothSlots.boothNumber,
      })
      .from(tenants)
      .leftJoin(boothSlots, eq(tenants.id, boothSlots.tenantId))
      .where(eq(tenants.status, "active"));

    const mappedTenants: Tenant[] = tenantRows.map((r) => {
      const t = r.tenant;
      const avatarText = t.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

      return {
        id: t.id,
        name: t.name,
        category: t.category,
        zone: t.zone || "Food Court",
        boothNumber: r.boothNumber || "Stan",
        rating: Number(t.rating) || 0,
        totalReviews: t.totalReviews || 0,
        isOpen: t.isOpen,
        avatarText: avatarText || "T",
      };
    });

    const tenantMap = new Map(mappedTenants.map((t) => [t.id, t]));

    // 2. Fetch active products
    const productRows = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true));

    const mappedProducts: CustomerProduct[] = productRows.map((p) => {
      const parentTenant = tenantMap.get(p.tenantId);
      return {
        id: p.id,
        tenantId: p.tenantId,
        tenantName: parentTenant?.name || "Tenant",
        boothNumber: parentTenant?.boothNumber || "Stan",
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description || "",
        image: p.image || undefined,
        rating: Number(p.rating) || 0,
        isPopular: p.isPopular,
      };
    });

    return {
      products: mappedProducts,
      tenants: mappedTenants,
    };
  } catch (error) {
    console.error("Gagal mengambil data customer dari database:", error);
    return {
      products: [],
      tenants: [],
    };
  }
}

export async function getCustomerFloorplanAction(): Promise<{
  zones: AreaZone[];
  booths: BoothSlot[];
}> {
  try {
    const zoneRows = await db.select().from(zones).orderBy(zones.code);

    const boothRows = await db
      .select({
        id: boothSlots.id,
        boothNumber: boothSlots.boothNumber,
        label: boothSlots.label,
        status: boothSlots.status,
        size: boothSlots.size,
        priceMonthly: boothSlots.priceMonthly,
        layout: boothSlots.layout,
        tenantId: boothSlots.tenantId,
        zoneCode: zones.code,
        tenantName: tenants.name,
        category: tenants.category,
      })
      .from(boothSlots)
      .leftJoin(zones, eq(boothSlots.zoneId, zones.id))
      .leftJoin(tenants, eq(boothSlots.tenantId, tenants.id))
      .orderBy(boothSlots.boothNumber);

    const mappedBooths: BoothSlot[] = boothRows.map((b) => ({
      id: b.id,
      zoneCode: b.zoneCode || "",
      boothNumber: b.boothNumber,
      label: b.label || undefined,
      tenantId: b.tenantId || undefined,
      tenantName: b.tenantName || undefined,
      category: b.category || undefined,
      status: (b.status as "occupied" | "available" | "reserved") || "available",
      size: b.size,
      priceMonthly: b.priceMonthly,
      layout: b.layout ?? null,
    }));

    const mappedZones: AreaZone[] = zoneRows.map((z) => {
      const zoneBooths = mappedBooths.filter((b) => b.zoneCode === z.code);
      return {
        id: z.id,
        name: z.name,
        code: z.code,
        description: z.description || "",
        categoryFocus: z.categoryFocus || "",
        totalBooths: zoneBooths.length,
        occupiedBooths: zoneBooths.filter((b) => b.status === "occupied").length,
        layout: z.layout ?? null,
      };
    });

    return {
      zones: mappedZones,
      booths: mappedBooths,
    };
  } catch (error) {
    console.error("Gagal memuat denah customer dari database:", error);
    return {
      zones: [],
      booths: [],
    };
  }
}

