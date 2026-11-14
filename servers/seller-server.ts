"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import { tenants, products, tenantOrders, orderItems } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import type {
  Order,
  Product,
  OrderStatus,
  OrderType,
  PaymentMethod,
  RentInvoice,
} from "@/types/seller";
import {
  productSchema,
  type TProductInput,
} from "@/validations/product-validation";
import { deleteBlobAction } from "@/servers/blob-server";
import { loadRentInvoices } from "@/servers/rent-data";

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

    // Find the tenant belonging to this seller
    const [sellerTenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.sellerId, session.user.id))
      .limit(1);

    if (!sellerTenant) {
      return { products: [], orders: [], rentInvoices: [] };
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
      image: p.image || undefined,
      isActive: p.isActive,
    }));

    // 2. Fetch tenant
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

export type ProductActionResult = {
  success: boolean;
  message: string;
  product?: Product;
};

export async function createProductAction(
  input: TProductInput,
): Promise<ProductActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data produk tidak valid.",
    };
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let tenantId = "";
    if (session) {
      // Find the tenant belonging to this seller
      const [sellerTenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.sellerId, session.user.id))
        .limit(1);

      if (sellerTenant) {
        tenantId = sellerTenant.id;
      }
    }

    if (!tenantId) {
      const [firstTenant] = await db.select().from(tenants).limit(1);
      if (firstTenant) {
        tenantId = firstTenant.id;
      } else {
        return {
          success: false,
          message:
            "Tenant UMKM Anda tidak ditemukan. Hubungi pengelola bazaar.",
        };
      }
    }

    const data = parsed.data;
    const newId = crypto.randomUUID();
    const sku = data.sku?.trim() || `SKU-${Date.now().toString().slice(-4)}`;

    await db.insert(products).values({
      id: newId,
      tenantId,
      sku,
      name: data.name,
      category: data.category,
      price: data.price,
      stock: data.stock,
      description: data.description || null,
      image: data.image || null,
      isActive: true,
    });

    revalidatePath("/dashboard/seller/stock");
    revalidatePath("/");

    return {
      success: true,
      message: `Menu "${data.name}" berhasil ditambahkan ke katalog stan.`,
      product: {
        id: newId,
        sku,
        name: data.name,
        category: data.category,
        price: data.price,
        stock: data.stock,
        description: data.description || undefined,
        image: data.image || undefined,
        isActive: true,
      },
    };
  } catch (error) {
    console.error("Gagal menambahkan produk:", error);
    const err = error as { message?: string };
    return {
      success: false,
      message: err.message || "Gagal menyimpan produk ke database.",
    };
  }
}

export async function updateProductStockAction(
  productId: string,
  newStock: number,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "Sesi tidak valid." };
    }

    await db
      .update(products)
      .set({
        stock: Math.max(0, newStock),
        isActive: newStock > 0 ? true : false,
      })
      .where(eq(products.id, productId));

    revalidatePath("/dashboard/seller/stock");
    revalidatePath("/");

    return { success: true, message: "Stok produk berhasil diperbarui." };
  } catch (error) {
    console.error("Gagal memperbarui stok:", error);
    return { success: false, message: "Gagal memperbarui stok produk." };
  }
}

export async function toggleProductActiveAction(
  productId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "Sesi tidak valid." };
    }

    const [existing] = await db
      .select({ isActive: products.isActive })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!existing) {
      return { success: false, message: "Produk tidak ditemukan." };
    }

    await db
      .update(products)
      .set({
        isActive: !existing.isActive,
      })
      .where(eq(products.id, productId));

    revalidatePath("/dashboard/seller/stock");
    revalidatePath("/");

    return { success: true, message: "Status produk berhasil diubah." };
  } catch (error) {
    console.error("Gagal mengubah status produk:", error);
    return { success: false, message: "Gagal mengubah status produk." };
  }
}

export async function deleteProductAction(
  productId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "Sesi tidak valid." };
    }

    const [existingProduct] = await db
      .select({ id: products.id, name: products.name, image: products.image })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!existingProduct) {
      return { success: false, message: "Produk tidak ditemukan." };
    }

    // Hapus blob image dari Vercel Blob jika produk memiliki foto
    if (
      existingProduct.image &&
      existingProduct.image.includes("blob.vercel-storage.com")
    ) {
      deleteBlobAction(existingProduct.image).catch((err) =>
        console.error("Gagal menghapus blob image produk:", err),
      );
    }

    // Hapus produk dari database
    await db.delete(products).where(eq(products.id, productId));

    revalidatePath("/dashboard/seller/stock");
    revalidatePath("/");

    return {
      success: true,
      message: `Menu "${existingProduct.name}" berhasil dihapus dari katalog.`,
    };
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    return { success: false, message: "Gagal menghapus produk dari database." };
  }
}

export async function updateOrderStatusAction(
  orderIdOrTenantOrderId: string,
  nextStatus: OrderStatus,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "Sesi login tidak valid." };
    }

    // Update status di tabel tenant_orders (bisa matching via id tenant_order atau order_id root)
    const updated = await db
      .update(tenantOrders)
      .set({
        status: nextStatus,
        updatedAt: new Date(),
      })
      .where(
        or(
          eq(tenantOrders.id, orderIdOrTenantOrderId),
          eq(tenantOrders.orderId, orderIdOrTenantOrderId),
        ),
      )
      .returning({ id: tenantOrders.id, orderId: tenantOrders.orderId });

    if (!updated || updated.length === 0) {
      return {
        success: false,
        message: `Pesanan #${orderIdOrTenantOrderId} tidak ditemukan di database.`,
      };
    }

    revalidatePath("/dashboard/seller/orders");
    revalidatePath("/dashboard/seller");
    revalidatePath("/orders");
    revalidatePath("/customer/orders");
    revalidatePath("/");

    return {
      success: true,
      message: `Status pesanan #${orderIdOrTenantOrderId} berhasil diubah menjadi "${nextStatus}".`,
    };
  } catch (error) {
    console.error("Gagal mengubah status pesanan di database:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memperbarui status di database.",
    };
  }
}
