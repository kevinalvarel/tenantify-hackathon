"use server";

import { db } from "@/drizzle";
import { tenants, boothSlots, products, user, associationProfiles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { CustomerProduct, Tenant, ActiveUmkm } from "@/types/customer";
import { findPresetUmkmByCode } from "@/data/umkm-registry";

export async function resolveUmkmByCodeAction(rawCode: string): Promise<{
  success: boolean;
  message: string;
  umkm?: ActiveUmkm;
}> {
  try {
    if (!rawCode || typeof rawCode !== "string") {
      return { success: false, message: "Kode unik wajib diisi." };
    }

    const normalizedCode = rawCode.trim().toUpperCase();

    // 1. First check in Preset / Configured Registry (fastest & robust)
    const preset = findPresetUmkmByCode(normalizedCode);
    if (preset) {
      return {
        success: true,
        message: `Berhasil mendeteksi ${preset.name}`,
        umkm: {
          code: preset.code,
          name: preset.name,
          type: preset.type,
          description: preset.description,
          location: preset.location,
          category: preset.category,
          tenantIds: preset.tenantIds,
        },
      };
    }

    // 2. Check Database for association user
    try {
      const [assocUser] = await db
        .select({
          id: user.id,
          name: user.name,
          role: user.role,
          associationCode: user.associationCode,
        })
        .from(user)
        .where(
          and(
            eq(user.associationCode, normalizedCode),
            eq(user.role, "association"),
          ),
        )
        .limit(1);

      if (assocUser) {
        // Fetch association profile if available
        const [profile] = await db
          .select()
          .from(associationProfiles)
          .where(eq(associationProfiles.id, assocUser.id))
          .limit(1);

        return {
          success: true,
          message: `Berhasil mendeteksi Paguyuban ${assocUser.name}`,
          umkm: {
            code: normalizedCode,
            name: profile?.name || assocUser.name,
            type: "paguyuban",
            description:
              profile?.description ||
              "Paguyuban Multi-UMKM & Pusat Kuliner Terpadu",
            location: profile?.address || "Area Bazaar & Sentra UMKM",
            tenantIds: [], // All tenants
          },
        };
      }
    } catch (dbErr) {
      console.warn("Database lookup warning for association code:", dbErr);
    }

    return {
      success: false,
      message:
        "Kode unik UMKM tidak ditemukan. Coba kode sample seperti 5S5CTP (Paguyuban Cilegon Juare), KEB001, atau BBK001.",
    };
  } catch (error) {
    console.error("Error resolving UMKM by code:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memeriksa kode. Silakan coba lagi.",
    };
  }
}

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

