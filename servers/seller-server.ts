"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import { tenants, products, tenantOrders, orderItems } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import type {
  Order,
  Product,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from "@/types/seller";

export async function getSellerDataAction(): Promise<{
  products: Product[];
  orders: Order[];
  rentInvoices: RentInvoice[];
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { products: [], orders: [], rentInvoices: [] };
    }

    // Find all tenants belonging to this seller
    let sellerTenants = await db
      .select()
      .from(tenants)
      .where(eq(tenants.sellerId, session.user.id));

    // Fallback: If seller user has no tenants directly assigned, link to active tenants
    if (sellerTenants.length === 0) {
      sellerTenants = await db.select().from(tenants).limit(5);
    }

    if (sellerTenants.length === 0) {
      return { products: [], orders: [] };
    }

    const tenantIds = sellerTenants.map((t) => t.id);

    // 1. Fetch products for this seller's tenants
    const productRows = await db
      .select()
      .from(products)
      .where(inArray(products.tenantId, tenantIds));

    const mappedProducts: Product[] = productRows.map((p) => ({
      id: p.id,
      sku: p.sku || `SKU-${p.id.slice(-4)}`,
      name: p.name,
      category: (p.category as Product["category"]) || "Makanan",
      price: p.price,
      stock: p.stock,
      description: p.description || undefined,
      image: p.image || undefined,
      isActive: p.isActive,
    }));

    // 2. Fetch tenant orders for this seller's tenants, ordered by newest first
    const orderRows = await db
      .select()
      .from(tenantOrders)
      .where(inArray(tenantOrders.tenantId, tenantIds))
      .orderBy(desc(tenantOrders.createdAt));

    const mappedOrders: Order[] = [];
    for (const ord of orderRows) {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.tenantOrderId, ord.id));

      const createdAtFormatted = ord.createdAt
        ? new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(ord.createdAt))
        : "Baru saja";

      mappedOrders.push({
        id: ord.id,
        customerName: ord.customerName || "Pelanggan",
        tableNumber: ord.tableNumber || undefined,
        type: (ord.type as OrderType) || "Online Order",
        items: items.map((it) => ({
          productName: it.productName,
          price: it.price,
          quantity: it.quantity,
          notes: it.notes || undefined,
        })),
        subtotal: ord.subtotal,
        tax: ord.tax,
        total: ord.total,
        status: (ord.status as OrderStatus) || "Masuk",
        paymentMethod: (ord.paymentMethod as PaymentMethod) || "QRIS",
        isPaid: ord.isPaid,
        createdAt: createdAtFormatted,
      });
    }

    return {
      products: mappedProducts,
      orders: mappedOrders,
      rentInvoices: await loadRentInvoices(sellerTenant.id),
    };
  } catch (error) {
    console.error("Gagal mengambil data seller dari database:", error);
    return {
      products: [],
      orders: [],
      rentInvoices: [],
    };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "Sesi tidak valid. Silakan login." };
    }

    // Update in tenantOrders
    await db
      .update(tenantOrders)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(tenantOrders.id, orderId));

    return {
      success: true,
      message:
        newStatus === "Diproses"
          ? `Pesanan #${orderId} berhasil dikonfirmasi dan mulai diproses!`
          : newStatus === "Dibatalkan"
            ? `Pesanan #${orderId} telah ditolak.`
            : `Status pesanan #${orderId} berhasil diubah menjadi ${newStatus}.`,
    };
  } catch (error) {
    console.error("Gagal mengupdate status pesanan:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengupdate status pesanan di database.",
    };
  }
}

