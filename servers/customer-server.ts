"use server";

import { db } from "@/drizzle";
import { tenants, boothSlots, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CustomerProduct, Tenant } from "@/types/customer";

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

