"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import {
  tenants,
  boothSlots,
  products,
  user,
  associationProfiles,
  orders,
  tenantOrders,
  orderItems,
  zones,
} from "@/db/schema";
import { and, eq, inArray, desc, or, ilike, ne } from "drizzle-orm";
import type {
  CustomerProduct,
  Tenant,
  ActiveUmkm,
  CustomerOrder,
  CustomerOrderStatus,
} from "@/types/customer";
import { findPresetUmkmByCode } from "@/data/umkm-registry";
import { AreaZone, BoothSlot } from "@/types/association";
import { slugify } from "@/lib/slug";

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

    // 3. Check Database for direct Tenant (by tenant ID, booth number, or tenant name)
    try {
      const [matchedTenant] = await db
        .select({
          tenant: tenants,
          boothNumber: boothSlots.boothNumber,
        })
        .from(tenants)
        .leftJoin(boothSlots, eq(tenants.id, boothSlots.tenantId))
        .where(
          or(
            eq(tenants.id, normalizedCode),
            eq(tenants.id, rawCode.trim()),
            ilike(tenants.name, normalizedCode),
            ilike(tenants.name, `%${rawCode.trim()}%`),
          ),
        )
        .limit(1);

      if (matchedTenant) {
        return {
          success: true,
          message: `Berhasil mendeteksi ${matchedTenant.tenant.name}`,
          umkm: {
            code: matchedTenant.tenant.id,
            name: matchedTenant.tenant.name,
            type: "umkm",
            description:
              matchedTenant.tenant.description ||
              `Stan kuliner ${matchedTenant.tenant.name}`,
            location: matchedTenant.boothNumber
              ? `Stan ${matchedTenant.boothNumber}`
              : matchedTenant.tenant.zone || "Area Bazaar & Sentra UMKM",
            category: matchedTenant.tenant.category,
            tenantIds: [matchedTenant.tenant.id],
          },
        };
      }
    } catch (dbTenantErr) {
      console.warn("Database lookup warning for tenant:", dbTenantErr);
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

export async function getCustomerDataAction(filterTenantIds?: string[]): Promise<{
  products: CustomerProduct[];
  tenants: Tenant[];
}> {
  try {
    // 1. Fetch tenants (excluding inactive ones)
    const tenantRows = await db
      .select({
        tenant: tenants,
        boothNumber: boothSlots.boothNumber,
      })
      .from(tenants)
      .leftJoin(boothSlots, eq(tenants.id, boothSlots.tenantId))
      .where(ne(tenants.status, "inactive"));

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
        rating: Number(t.rating) || 5.0,
        totalReviews: t.totalReviews || 0,
        isOpen: t.isOpen,
        avatarText: avatarText || "T",
      };
    });

    const tenantMap = new Map(mappedTenants.map((t) => [t.id, t]));

    // 2. Fetch active products from database
    const productRows = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true));

    // If specific tenantIds are requested, filter products strictly for those tenants
    const filteredRows =
      filterTenantIds && filterTenantIds.length > 0
        ? productRows.filter((p) => filterTenantIds.includes(p.tenantId))
        : productRows;

    const mappedProducts: CustomerProduct[] = filteredRows.map((p) => {
      const parentTenant = tenantMap.get(p.tenantId);
      const safeSlug = slugify(p.name) + "-" + p.id.slice(-6);
      return {
        id: p.id,
        slug: safeSlug,
        tenantId: p.tenantId,
        tenantName: parentTenant?.name || "Stan UMKM",
        boothNumber: parentTenant?.boothNumber || "Stan",
        name: p.name,
        category: (p.category as CustomerProduct["category"]) || "Makanan",
        price: p.price,
        stock: p.stock ?? 0,
        description: p.description || "",
        image: p.image || undefined,
        rating: Number(p.rating) || 5.0,
        isPopular: p.isPopular ?? false,
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

export async function getProductByIdOrSlugAction(
  slugOrId: string,
): Promise<CustomerProduct | null> {
  try {
    if (!slugOrId) return null;
    const clean = decodeURIComponent(slugOrId).trim().toLowerCase();

    const productRows = await db
      .select({
        product: products,
        tenantName: tenants.name,
        boothNumber: boothSlots.boothNumber,
      })
      .from(products)
      .leftJoin(tenants, eq(products.tenantId, tenants.id))
      .leftJoin(boothSlots, eq(tenants.id, boothSlots.tenantId))
      .where(eq(products.isActive, true));

    const match = productRows.find((r) => {
      const p = r.product;
      const genSlug = slugify(p.name) + "-" + p.id.slice(-6);
      return (
        p.id.toLowerCase() === clean ||
        genSlug.toLowerCase() === clean ||
        slugify(p.name).toLowerCase() === clean ||
        p.name.toLowerCase() === clean
      );
    });

    if (!match) return null;

    const p = match.product;
    return {
      id: p.id,
      slug: slugify(p.name) + "-" + p.id.slice(-6),
      tenantId: p.tenantId,
      tenantName: match.tenantName || "Stan UMKM",
      boothNumber: match.boothNumber || "Stan",
      name: p.name,
      category: (p.category as CustomerProduct["category"]) || "Makanan",
      price: p.price,
      stock: p.stock ?? 0,
      description: p.description || "",
      image: p.image || undefined,
      rating: Number(p.rating) || 5.0,
      isPopular: p.isPopular ?? false,
    };
  } catch (error) {
    console.error("Gagal mengambil detail produk:", error);
    return null;
  }
}

export type CreateCustomerOrderInput = {
  orderType: "Dine-in (Makan di Tempat)" | "Takeaway (Bawa Pulang)";
  tableNumber?: string;
  paymentMethod: CustomerOrder["paymentMethod"];
  items: {
    productId?: string;
    productName: string;
    tenantId: string;
    tenantName: string;
    price: number;
    quantity: number;
    notes?: string;
  }[];
  subtotal: number;
  platformFee: number;
  total: number;
};

export async function createCustomerOrderAction(
  input: CreateCustomerOrderInput,
): Promise<{
  success: boolean;
  message: string;
  order?: CustomerOrder;
}> {
  try {
    if (!input.items || input.items.length === 0) {
      return { success: false, message: "Keranjang belanja kosong." };
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || role !== "customer") {
      return {
        success: false,
        message: "Silakan masuk sebagai pembeli untuk memesan.",
      };
    }

    const customerId = session.user.id;
    const customerName = session.user.name;

    const orderId = `ORD-${Date.now().toString().slice(-4)}`;
    const pickupCode = `TNT-${Date.now().toString().slice(-3)}`;

    // 1. Simpan ke tabel orders
    await db.insert(orders).values({
      id: orderId,
      customerId,
      pickupCode,
      orderType: input.orderType,
      tableNumber: input.tableNumber || null,
      subtotal: input.subtotal,
      platformFee: input.platformFee,
      total: input.total,
      paymentMethod: input.paymentMethod,
      paymentStatus:
        input.paymentMethod === "Bayar di Tenant" ? "pending" : "paid",
    });

    // 2. Kelompokkan item berdasarkan tenant
    const tenantGroups = new Map<string, typeof input.items>();
    for (const item of input.items) {
      const list = tenantGroups.get(item.tenantId) || [];
      list.push(item);
      tenantGroups.set(item.tenantId, list);
    }

    // 3. Masukkan ke tenantOrders untuk masing-masing UMKM tempat customer memesan
    for (const [tenantId, groupItems] of tenantGroups.entries()) {
      const [existingTenant] = await db
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      const validTenantId = existingTenant ? tenantId : "t_1794582095176";
      const tenantOrderId = `TO-${orderId.replace("ORD-", "")}${
        tenantGroups.size > 1 ? `-${validTenantId.slice(-4)}` : ""
      }`;

      const groupSubtotal = groupItems.reduce(
        (sum, it) => sum + it.price * it.quantity,
        0,
      );

      await db.insert(tenantOrders).values({
        id: tenantOrderId,
        orderId,
        tenantId: validTenantId,
        customerName,
        tableNumber: input.tableNumber || null,
        type: "Online Order",
        subtotal: groupSubtotal,
        tax: 0,
        total: groupSubtotal,
        status: "Masuk", // Status awal di sisi UMKM: Masuk (Pending/Menunggu Konfirmasi)
        paymentMethod:
          input.paymentMethod === "Bayar di Tenant" ? "Tunai" : "QRIS",
        isPaid: input.paymentMethod !== "Bayar di Tenant",
      });

      // 4. Masukkan item pesanan ke orderItems
      for (const it of groupItems) {
        let validProductId: string | null = null;
        if (it.productId) {
          const [prodExists] = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.id, it.productId))
            .limit(1);
          if (prodExists) {
            validProductId = it.productId;
          }
        }

        await db.insert(orderItems).values({
          id: `OI-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          tenantOrderId,
          productId: validProductId,
          productName: it.productName,
          price: it.price,
          quantity: it.quantity,
          notes: it.notes || null,
        });
      }
    }

    const createdOrder: CustomerOrder = {
      id: orderId,
      pickupCode,
      orderType: input.orderType,
      tableNumber: input.tableNumber,
      tenantNames: Array.from(new Set(input.items.map((i) => i.tenantName))),
      items: input.items.map((it) => ({
        productName: it.productName,
        tenantName: it.tenantName,
        price: it.price,
        quantity: it.quantity,
        notes: it.notes,
      })),
      subtotal: input.subtotal,
      platformFee: input.platformFee,
      total: input.total,
      status: "Diterima", // Status awal di sisi customer: Diterima (Menunggu Konfirmasi)
      paymentMethod: input.paymentMethod,
      createdAt: "Baru saja",
    };

    return {
      success: true,
      message: `Pesanan #${orderId} berhasil dikirim ke UMKM!`,
      order: createdOrder,
    };
  } catch (error) {
    console.error("Gagal membuat pesanan customer di database:", error);
    return {
      success: false,
      message: "Gagal menyimpan pesanan ke database. Silakan coba lagi.",
    };
  }
}

export async function getCustomerOrdersAction(
  orderIds?: string[],
): Promise<CustomerOrder[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const customerId = session?.user?.id;

    const conditions = [];
    if (orderIds && orderIds.length > 0) {
      conditions.push(inArray(orders.id, orderIds));
    }
    if (customerId) {
      conditions.push(eq(orders.customerId, customerId));
    }

    if (conditions.length === 0) return [];

    const orderRows = await db
      .select()
      .from(orders)
      .where(conditions.length > 1 ? or(...conditions) : conditions[0])
      .orderBy(desc(orders.createdAt));

    const result: CustomerOrder[] = [];

    for (const ord of orderRows) {
      const tOrders = await db
        .select({
          tenantOrder: tenantOrders,
          tenantName: tenants.name,
        })
        .from(tenantOrders)
        .leftJoin(tenants, eq(tenantOrders.tenantId, tenants.id))
        .where(eq(tenantOrders.orderId, ord.id));

      const allItems: CustomerOrder["items"] = [];
      for (const to of tOrders) {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.tenantOrderId, to.tenantOrder.id));

        for (const it of items) {
          allItems.push({
            productName: it.productName,
            tenantName: to.tenantName || "UMKM",
            price: it.price,
            quantity: it.quantity,
            notes: it.notes || undefined,
          });
        }
      }

      // Tentukan status customer berdasarkan status tenantOrders di database
      let customerStatus: CustomerOrderStatus = "Diterima";
      const statuses = tOrders.map((t) => t.tenantOrder.status);

      if (statuses.length > 0) {
        if (statuses.every((s) => s === "Dibatalkan")) {
          customerStatus = "Dibatalkan";
        } else if (statuses.every((s) => s === "Selesai")) {
          customerStatus = "Selesai";
        } else if (statuses.some((s) => s === "Siap Diambil")) {
          customerStatus = "Siap Diambil";
        } else if (statuses.some((s) => s === "Diproses")) {
          customerStatus = "Disiapkan"; // Diproses oleh UMKM -> Sedang Dimasak
        } else {
          customerStatus = "Diterima"; // Menunggu Konfirmasi
        }
      }

      const createdAtFormatted = ord.createdAt
        ? new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(ord.createdAt))
        : "Baru saja";

      result.push({
        id: ord.id,
        pickupCode: ord.pickupCode,
        orderType:
          (ord.orderType as CustomerOrder["orderType"]) ||
          "Dine-in (Makan di Tempat)",
        tableNumber: ord.tableNumber || undefined,
        tenantNames: Array.from(
          new Set(tOrders.map((t) => t.tenantName || "UMKM")),
        ),
        items: allItems,
        subtotal: ord.subtotal,
        platformFee: ord.platformFee,
        total: ord.total,
        status: customerStatus,
        paymentMethod:
          (ord.paymentMethod as CustomerOrder["paymentMethod"]) || "QRIS",
        createdAt: createdAtFormatted,
      });
    }

    return result;
  } catch (error) {
    console.error(
      "Gagal mengambil status pesanan customer dari database:",
      error,
    );
    return [];
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
      status:
        (b.status as "occupied" | "available" | "reserved") || "available",
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
        occupiedBooths: zoneBooths.filter((b) => b.status === "occupied")
          .length,
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
