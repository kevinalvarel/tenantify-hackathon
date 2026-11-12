"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import { tenants, products, tenantOrders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Order, Product, OrderStatus, OrderType, PaymentMethod } from "@/types/seller";

export async function getSellerDataAction(): Promise<{
  products: Product[];
  orders: Order[];
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { products: [], orders: [] };
    }

    // Find the tenant belonging to this seller
    const [sellerTenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.sellerId, session.user.id))
      .limit(1);

    if (!sellerTenant) {
      return { products: [], orders: [] };
    }

    // 1. Fetch products for this tenant
    const productRows = await db
      .select()
      .from(products)
      .where(eq(products.tenantId, sellerTenant.id));

    const mappedProducts: Product[] = productRows.map((p) => ({
      id: p.id,
      sku: p.sku || `SKU-${p.id.slice(-4)}`,
      name: p.name,
      category: (p.category as Product["category"]) || "Makanan",
      price: p.price,
      stock: p.stock,
      description: p.description || undefined,
      isActive: p.isActive,
    }));

    // 2. Fetch tenant orders
    const orderRows = await db
      .select()
      .from(tenantOrders)
      .where(eq(tenantOrders.tenantId, sellerTenant.id));

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
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(ord.createdAt))
        : "";

      mappedOrders.push({
        id: ord.id,
        customerName: ord.customerName || "Pelanggan",
        tableNumber: ord.tableNumber || undefined,
        type: (ord.type as OrderType) || "POS Kasir",
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
    };
  } catch (error) {
    console.error("Gagal mengambil data seller dari database:", error);
    return {
      products: [],
      orders: [],
    };
  }
}

