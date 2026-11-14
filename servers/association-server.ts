"use server";

import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import {
  associationProfiles,
  tenants,
  boothSlots,
  zones,
  user,
  products,
  tenantOrders,
} from "@/db/schema";
import { and, eq, inArray, ne, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import type {
  AreaZone,
  AssociationTenant,
  BoothSlot,
} from "@/types/association";
import type {
  AnalyticsRange,
  AssociationAnalytics,
} from "@/types/analytics";
import { buildAssociationAnalytics } from "@/lib/analytics";
import {
  associationSettingsSchema,
  type TAssociationSettings,
} from "@/validations/association-settings";
import {
  createBoothSchema,
  createZoneSchema,
  saveFloorplanSchema,
  updateBoothSchema,
  type TCreateBooth,
  type TCreateZone,
  type TSaveFloorplan,
  type TUpdateBooth,
} from "@/validations/association-layout";
import {
  ASSOCIATION_DATA_TTL,
  cacheKeys,
  cached,
  invalidateTenantData,
} from "@/lib/cache";

export type AssociationData = {
  tenants: AssociationTenant[];
  booths: BoothSlot[];
  zones: AreaZone[];
};

export type AssociationDataResult = AssociationData & { error?: string };

export type LayoutActionResult = {
  success: boolean;
  message: string;
  data?: AssociationData;
};

async function loadAssociationData(): Promise<AssociationData> {
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

  const productCounts = await db
    .select({
      tenantId: products.tenantId,
      count: sql<number>`count(*)::int`,
    })
    .from(products)
    .groupBy(products.tenantId);

  const productCountMap = new Map(
    productCounts.map((p) => [p.tenantId, p.count])
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const revenueRows = await db
    .select({
      tenantId: tenantOrders.tenantId,
      monthlyRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${tenantOrders.createdAt} >= ${startOfMonth} THEN ${tenantOrders.total} ELSE 0 END), 0)::int`,
      totalRevenue: sql<number>`COALESCE(SUM(${tenantOrders.total}), 0)::int`,
    })
    .from(tenantOrders)
    .where(
      and(
        ne(tenantOrders.status, "Dibatalkan"),
        or(
          eq(tenantOrders.status, "Selesai"),
          eq(tenantOrders.isPaid, true),
        ),
      ),
    )
    .groupBy(tenantOrders.tenantId);

  const revenueMap = new Map(
    revenueRows.map((r) => [
      r.tenantId,
      r.monthlyRevenue > 0 ? r.monthlyRevenue : r.totalRevenue,
    ]),
  );

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
      status: (t.status === "active" ? "active" : "inactive") as
        | "active"
        | "inactive",
      joinedAt: formattedDate,
      monthlyRevenue: revenueMap.get(t.id) || 0,
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
}

async function freshAssociationData(): Promise<AssociationData> {
  await invalidateTenantData();
  return loadAssociationData();
}

export async function getAssociationDataAction(): Promise<AssociationDataResult> {
  try {
    return await cached(
      cacheKeys.associationData,
      ASSOCIATION_DATA_TTL,
      loadAssociationData,
    );
  } catch (error) {
    console.error("Gagal mengambil data association dari database:", error);
    return {
      tenants: [],
      booths: [],
      zones: [],
      error: "Gagal memuat data zona dan booth dari database.",
    };
  }
}

export type TopMerchantTurnover = {
  id: string;
  name: string;
  owner: string;
  category: string;
  zone: string;
  boothNumber: string;
  monthlyRevenue: number;
  totalOrders: number;
  avatar: string;
  rating: number;
};

export type HighestMerchantTurnoverResult = {
  highestTenant: TopMerchantTurnover | null;
  highestRevenue: number;
  topTenants: TopMerchantTurnover[];
  totalAreaRevenue: number;
};

export async function getHighestMerchantTurnoverAction(): Promise<HighestMerchantTurnoverResult> {
  try {
    const data = await getAssociationDataAction();
    const activeTenants = data.tenants.filter((t) => t.status === "active");

    const ordersAgg = await db
      .select({
        tenantId: tenantOrders.tenantId,
        totalOrders: sql<number>`count(*)::int`,
      })
      .from(tenantOrders)
      .where(
        and(
          ne(tenantOrders.status, "Dibatalkan"),
          or(
            eq(tenantOrders.status, "Selesai"),
            eq(tenantOrders.isPaid, true),
          ),
        ),
      )
      .groupBy(tenantOrders.tenantId);

    const orderCountMap = new Map(
      ordersAgg.map((o) => [o.tenantId, o.totalOrders]),
    );

    const sorted: TopMerchantTurnover[] = activeTenants
      .map((t) => ({
        id: t.id,
        name: t.name,
        owner: t.owner,
        category: t.category,
        zone: t.zone,
        boothNumber: t.boothNumber,
        monthlyRevenue: t.monthlyRevenue || 0,
        totalOrders: orderCountMap.get(t.id) || 0,
        avatar: t.avatar,
        rating: t.rating,
      }))
      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

    const highestTenant = sorted.length > 0 ? sorted[0] : null;
    const highestRevenue = highestTenant?.monthlyRevenue || 0;
    const totalAreaRevenue = sorted.reduce(
      (sum, t) => sum + t.monthlyRevenue,
      0,
    );

    return {
      highestTenant,
      highestRevenue,
      topTenants: sorted.slice(0, 5),
      totalAreaRevenue,
    };
  } catch (error) {
    console.error("Gagal mengambil omzet pedagang tertinggi:", error);
    return {
      highestTenant: null,
      highestRevenue: 0,
      topTenants: [],
      totalAreaRevenue: 0,
    };
  }
}

export async function getAssociationAnalyticsAction(
  range: AnalyticsRange = 30,
): Promise<AssociationAnalytics> {
  try {
    const data = await getAssociationDataAction();
    const tenantsList = data.tenants;

    const orderRows = await db
      .select({
        id: tenantOrders.id,
        orderId: tenantOrders.orderId,
        tenantId: tenantOrders.tenantId,
        customerName: tenantOrders.customerName,
        subtotal: tenantOrders.subtotal,
        tax: tenantOrders.tax,
        total: tenantOrders.total,
        status: tenantOrders.status,
        paymentMethod: tenantOrders.paymentMethod,
        isPaid: tenantOrders.isPaid,
        createdAt: tenantOrders.createdAt,
        tenantCategory: tenants.category,
        tenantName: tenants.name,
      })
      .from(tenantOrders)
      .leftJoin(tenants, eq(tenantOrders.tenantId, tenants.id))
      .where(
        and(
          ne(tenantOrders.status, "Dibatalkan"),
          or(
            eq(tenantOrders.status, "Selesai"),
            eq(tenantOrders.isPaid, true),
          ),
        ),
      )
      .orderBy(tenantOrders.createdAt);

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayKey = `${now.getFullYear()}-${month}-${day}`;

    return buildAssociationAnalytics(tenantsList, range, todayKey, orderRows);
  } catch (error) {
    console.error("Gagal mengambil analitik asosiasi:", error);
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayKey = `${now.getFullYear()}-${month}-${day}`;
    return buildAssociationAnalytics([], range, todayKey, []);
  }
}

async function hasLayoutAccess() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || (role !== "association" && role !== "developer")) {
    return false;
  }
  return true;
}

const SESSION_MESSAGE = "Sesi tidak valid. Silakan login kembali.";

function messageOf(error: unknown) {
  const err = error as { message?: string };
  return err.message || "Gagal menyimpan data zona dan booth.";
}

function padNumber(value: number) {
  return String(value).padStart(2, "0");
}

function boothPrefix(zoneCode: string) {
  return zoneCode.replace(/^Z/i, "");
}

function duplicateKey(values: string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) return value;
    seen.add(value);
  }
  return null;
}

export async function createZoneAction(
  input: TCreateZone
): Promise<LayoutActionResult> {
  const parsed = createZoneSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data zona tidak valid.",
    };
  }

  if (!(await hasLayoutAccess())) {
    return { success: false, message: SESSION_MESSAGE };
  }

  const data = parsed.data;

  try {
    const existing = await db
      .select({ id: zones.id })
      .from(zones)
      .where(eq(zones.code, data.code))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        message: `Kode zona ${data.code} sudah dipakai.`,
      };
    }

    const zoneId = crypto.randomUUID();
    const prefix = boothPrefix(data.code);
    const boothNumbers = Array.from(
      { length: data.boothCount },
      (_, index) => `${prefix}-${padNumber(data.startNumber + index)}`
    );

    await db.transaction(async (tx) => {
      await tx.insert(zones).values({
        id: zoneId,
        code: data.code,
        name: data.name,
        description: data.description,
        categoryFocus: data.categoryFocus,
      });

      if (boothNumbers.length > 0) {
        await tx.insert(boothSlots).values(
          boothNumbers.map((boothNumber) => ({
            id: crypto.randomUUID(),
            zoneId,
            boothNumber,
            label: `Stan ${boothNumber}`,
            size: data.size,
            priceMonthly: data.priceMonthly,
          }))
        );
      }
    });

    return {
      success: true,
      message:
        boothNumbers.length > 0
          ? `Zona ${data.code} dengan ${boothNumbers.length} booth ditambahkan.`
          : `Zona ${data.code} ditambahkan.`,
      data: await freshAssociationData(),
    };
  } catch (error) {
    return { success: false, message: messageOf(error) };
  }
}

export async function deleteZoneAction(id: string): Promise<LayoutActionResult> {
  if (!id) {
    return { success: false, message: "Zona tidak ditemukan." };
  }

  if (!(await hasLayoutAccess())) {
    return { success: false, message: SESSION_MESSAGE };
  }

  try {
    const zoneBooths = await db
      .select({
        id: boothSlots.id,
        status: boothSlots.status,
        tenantId: boothSlots.tenantId,
      })
      .from(boothSlots)
      .where(eq(boothSlots.zoneId, id));

    if (
      zoneBooths.some(
        (booth) => booth.status === "occupied" || booth.tenantId
      )
    ) {
      return {
        success: false,
        message:
          "Zona masih memiliki booth terisi. Kosongkan booth tersebut sebelum menghapus zona.",
      };
    }

    const deleted = await db
      .delete(zones)
      .where(eq(zones.id, id))
      .returning({ code: zones.code });

    if (deleted.length === 0) {
      return { success: false, message: "Zona tidak ditemukan." };
    }

    return {
      success: true,
      message: `Zona ${deleted[0].code} dan booth kosong di dalamnya dihapus.`,
      data: await freshAssociationData(),
    };
  } catch (error) {
    return { success: false, message: messageOf(error) };
  }
}

export async function createBoothAction(
  input: TCreateBooth
): Promise<LayoutActionResult> {
  const parsed = createBoothSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data booth tidak valid.",
    };
  }

  if (!(await hasLayoutAccess())) {
    return { success: false, message: SESSION_MESSAGE };
  }

  const data = parsed.data;

  try {
    const zone = await db
      .select({ code: zones.code })
      .from(zones)
      .where(eq(zones.id, data.zoneId))
      .limit(1);

    if (zone.length === 0) {
      return { success: false, message: "Zona tujuan tidak ditemukan." };
    }

    const duplicate = await db
      .select({ id: boothSlots.id })
      .from(boothSlots)
      .where(
        and(
          eq(boothSlots.zoneId, data.zoneId),
          eq(boothSlots.boothNumber, data.boothNumber)
        )
      )
      .limit(1);

    if (duplicate.length > 0) {
      return {
        success: false,
        message: `Nomor booth ${data.boothNumber} sudah ada di zona ini.`,
      };
    }

    await db.insert(boothSlots).values({
      id: crypto.randomUUID(),
      zoneId: data.zoneId,
      boothNumber: data.boothNumber,
      label: `Stan ${data.boothNumber}`,
      size: data.size,
      priceMonthly: data.priceMonthly,
    });

    return {
      success: true,
      message: `Booth ${data.boothNumber} ditambahkan ke zona ${zone[0].code}.`,
      data: await freshAssociationData(),
    };
  } catch (error) {
    return { success: false, message: messageOf(error) };
  }
}

export async function updateBoothAction(
  input: TUpdateBooth
): Promise<LayoutActionResult> {
  const parsed = updateBoothSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data booth tidak valid.",
    };
  }

  if (!(await hasLayoutAccess())) {
    return { success: false, message: SESSION_MESSAGE };
  }

  const data = parsed.data;

  try {
    const existing = await db
      .select({
        id: boothSlots.id,
        tenantId: boothSlots.tenantId,
        boothNumber: boothSlots.boothNumber,
        label: boothSlots.label,
      })
      .from(boothSlots)
      .where(eq(boothSlots.id, data.id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, message: "Booth tidak ditemukan." };
    }

    const duplicate = await db
      .select({ id: boothSlots.id })
      .from(boothSlots)
      .where(
        and(
          eq(boothSlots.zoneId, data.zoneId),
          eq(boothSlots.boothNumber, data.boothNumber)
        )
      );

    if (duplicate.some((booth) => booth.id !== data.id)) {
      return {
        success: false,
        message: `Nomor booth ${data.boothNumber} sudah ada di zona tujuan.`,
      };
    }

    const currentLabel = existing[0].label;
    const label =
      !currentLabel || currentLabel.startsWith("Stan ")
        ? `Stan ${data.boothNumber}`
        : currentLabel;

    await db
      .update(boothSlots)
      .set({
        zoneId: data.zoneId,
        boothNumber: data.boothNumber,
        label,
        size: data.size,
        priceMonthly: data.priceMonthly,
        status: existing[0].tenantId ? "occupied" : data.status,
      })
      .where(eq(boothSlots.id, data.id));

    return {
      success: true,
      message: `Booth ${data.boothNumber} diperbarui.`,
      data: await freshAssociationData(),
    };
  } catch (error) {
    return { success: false, message: messageOf(error) };
  }
}

export async function deleteBoothAction(
  id: string
): Promise<LayoutActionResult> {
  if (!id) {
    return { success: false, message: "Booth tidak ditemukan." };
  }

  if (!(await hasLayoutAccess())) {
    return { success: false, message: SESSION_MESSAGE };
  }

  try {
    const existing = await db
      .select({
        boothNumber: boothSlots.boothNumber,
        status: boothSlots.status,
        tenantId: boothSlots.tenantId,
      })
      .from(boothSlots)
      .where(eq(boothSlots.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, message: "Booth tidak ditemukan." };
    }

    if (existing[0].status === "occupied" || existing[0].tenantId) {
      return {
        success: false,
        message:
          "Booth terisi tidak bisa dihapus. Lepaskan tenant terlebih dahulu.",
      };
    }

    await db.delete(boothSlots).where(eq(boothSlots.id, id));

    return {
      success: true,
      message: `Booth ${existing[0].boothNumber} dihapus.`,
      data: await freshAssociationData(),
    };
  } catch (error) {
    return { success: false, message: messageOf(error) };
  }
}

export async function deleteTenantAction(
  id: string
): Promise<LayoutActionResult> {
  if (!id) {
    return { success: false, message: "Tenant tidak ditemukan." };
  }

  if (!(await hasLayoutAccess())) {
    return { success: false, message: SESSION_MESSAGE };
  }

  try {
    const existing = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, message: "Tenant tidak ditemukan." };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(boothSlots)
        .set({ tenantId: null, status: "available" })
        .where(eq(boothSlots.tenantId, id));

      // Produk, pesanan, dan tagihan sewa ikut terhapus lewat cascade.
      await tx.delete(tenants).where(eq(tenants.id, id));
    });

    return {
      success: true,
      message: `Tenant "${existing[0].name}" berhasil dihapus.`,
      data: await freshAssociationData(),
    };
  } catch (error) {
    return { success: false, message: messageOf(error) };
  }
}

export async function saveFloorplanAction(
  input: TSaveFloorplan
): Promise<LayoutActionResult> {
  const parsed = saveFloorplanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data denah tidak valid.",
    };
  }

  if (!(await hasLayoutAccess())) {
    return { success: false, message: SESSION_MESSAGE };
  }

  const data = parsed.data;

  const duplicateZone = duplicateKey(data.zones.map((zone) => zone.code));
  if (duplicateZone) {
    return {
      success: false,
      message: `Kode zona ${duplicateZone} muncul lebih dari sekali di denah.`,
    };
  }

  const duplicateBooth = duplicateKey(
    data.booths.map((booth) => `${booth.zoneCode}|${booth.code}`)
  );
  if (duplicateBooth) {
    const [zoneCode, boothCode] = duplicateBooth.split("|");
    return {
      success: false,
      message: `Booth ${boothCode} muncul lebih dari sekali di zona ${zoneCode}.`,
    };
  }

  try {
    const existingZones = await db.select().from(zones);
    const existingBooths = await db.select().from(boothSlots);

    const incomingZoneCodes = new Set(data.zones.map((zone) => zone.code));
    const incomingBoothKeys = new Set(
      data.booths.map((booth) => `${booth.zoneCode}|${booth.code}`)
    );

    const existingZoneByCode = new Map(
      existingZones.map((zone) => [zone.code, zone])
    );
    const existingBoothByKey = new Map(
      existingBooths.map((booth) => {
        const zone = existingZones.find((item) => item.id === booth.zoneId);
        return [`${zone?.code || ""}|${booth.boothNumber}`, booth];
      })
    );

    for (const zone of existingZones) {
      if (incomingZoneCodes.has(zone.code)) continue;
      const zoneBooths = existingBooths.filter(
        (booth) => booth.zoneId === zone.id
      );
      if (
        zoneBooths.some(
          (booth) => booth.status === "occupied" || booth.tenantId
        )
      ) {
        return {
          success: false,
          message: `Zona ${zone.code} masih memiliki booth terisi. Kosongkan dulu sebelum menghapusnya dari denah.`,
        };
      }
    }

    for (const [key, booth] of existingBoothByKey) {
      if (incomingBoothKeys.has(key)) continue;
      if (booth.status === "occupied" || booth.tenantId) {
        return {
          success: false,
          message: `Booth ${booth.boothNumber} masih terisi. Kosongkan dulu sebelum menghapusnya dari denah.`,
        };
      }
    }

    const tenantIds = Array.from(
      new Set(
        data.booths
          .map((booth) => booth.tenantId)
          .filter((value): value is string => Boolean(value))
      )
    );
    const validTenantIds =
      tenantIds.length > 0
        ? new Set(
            (
              await db
                .select({ id: tenants.id })
                .from(tenants)
                .where(inArray(tenants.id, tenantIds))
            ).map((row) => row.id)
          )
        : new Set<string>();

    await db.transaction(async (tx) => {
      for (const zone of data.zones) {
        const existing = existingZoneByCode.get(zone.code);
        if (existing) {
          await tx
            .update(zones)
            .set({ name: zone.name, layout: zone.layout })
            .where(eq(zones.id, existing.id));
        } else {
          await tx.insert(zones).values({
            id: crypto.randomUUID(),
            code: zone.code,
            name: zone.name,
            description: "",
            categoryFocus: "",
            layout: zone.layout,
          });
        }
      }

      for (const zone of existingZones) {
        if (!incomingZoneCodes.has(zone.code)) {
          await tx.delete(zones).where(eq(zones.id, zone.id));
        }
      }

      const zoneRows = await tx.select().from(zones);
      const zoneIdByCode = new Map(
        zoneRows.map((zone) => [zone.code, zone.id])
      );

      for (const booth of data.booths) {
        const zoneId = zoneIdByCode.get(booth.zoneCode);
        if (!zoneId) continue;

        const tenantId =
          booth.tenantId && validTenantIds.has(booth.tenantId)
            ? booth.tenantId
            : null;
        const status = tenantId ? "occupied" : booth.status;
        const existing = existingBoothByKey.get(
          `${booth.zoneCode}|${booth.code}`
        );

        const values = {
          zoneId,
          boothNumber: booth.code,
          label: booth.label || `Stan ${booth.code}`,
          size: booth.sizeMeters,
          priceMonthly: booth.priceMonthly,
          status,
          tenantId,
          layout: booth.layout,
        };

        if (existing) {
          await tx
            .update(boothSlots)
            .set(values)
            .where(eq(boothSlots.id, existing.id));
        } else {
          await tx.insert(boothSlots).values({
            id: crypto.randomUUID(),
            ...values,
          });
        }
      }

      for (const booth of existingBooths) {
        const zone = existingZones.find((item) => item.id === booth.zoneId);
        const key = `${zone?.code || ""}|${booth.boothNumber}`;
        if (!incomingBoothKeys.has(key)) {
          await tx.delete(boothSlots).where(eq(boothSlots.id, booth.id));
        }
      }
    });

    return {
      success: true,
      message: "Denah berhasil disimpan.",
      data: await freshAssociationData(),
    };
  } catch (error) {
    return { success: false, message: messageOf(error) };
  }
}

export async function updateAssociationSettingsAction(
  input: TAssociationSettings
): Promise<{ success: boolean; message: string }> {
  const parsed = associationSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data pengaturan tidak valid",
    };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session || (role !== "association" && role !== "developer")) {
      return { success: false, message: "Sesi tidak valid. Silakan login kembali." };
    }

    await db
      .insert(associationProfiles)
      .values({ id: session.user.id, ...parsed.data })
      .onConflictDoUpdate({
        target: associationProfiles.id,
        set: { ...parsed.data, updatedAt: new Date() },
      });

    return { success: true, message: "Pengaturan area berhasil disimpan." };
  } catch (error) {
    const err = error as { message?: string };
    return {
      success: false,
      message: err.message || "Gagal menyimpan pengaturan area.",
    };
  }
}
