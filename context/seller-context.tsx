"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import {
  getSellerDataAction,
  updateProductStockAction,
  toggleProductActiveAction,
  deleteProductAction,
  updateOrderStatusAction,
} from "@/servers/seller-server";
import { settleRentInvoiceAction } from "@/servers/rent-server";
import { toast } from "sonner";
import {
  Product,
  Order,
  OrderStatus,
  RentInvoice,
  RentPaymentHistoryItem,
} from "@/types/seller";

type SellerContextType = {
  products: Product[];
  orders: Order[];
  totalRevenue: number;
  totalOrders: number;
  lowStockCount: number;
  activeOrdersCount: number;
  rentInvoices: RentInvoice[];
  rentPaymentHistory: RentPaymentHistoryItem[];
  isRentLoading: boolean;
  handleCompleteTransaction: (
    newOrder: Order,
    itemsSold: { productId: string; qty: number }[],
  ) => void;
  handleUpdateStock: (productId: string, newStock: number) => void;
  handleUpdatePrice: (productId: string, newPrice: number) => void;
  handleToggleActive: (productId: string) => void;
  handleAddProduct: (newProduct: Product) => void;
  handleDeleteProduct: (
    productId: string,
  ) => Promise<{ success: boolean; message: string }>;
  handleUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  handlePayRentInvoice: (
    invoiceId: string,
    paymentMethod: string,
  ) => Promise<{ success: boolean; receiptNumber: string; message: string }>;
};

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rentInvoices, setRentInvoices] = useState<RentInvoice[]>([]);
  const [isRentLoading, setIsRentLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSellerData = async () => {
      try {
        const data = await getSellerDataAction();
        if (!isMounted) return;
        if (data.products.length > 0) setProducts(data.products);
        setOrders(data.orders);
        setRentInvoices(data.rentInvoices);
        setIsRentLoading(false);
      } catch (err) {
        console.warn("Sinkronisasi data seller error:", err);
      }
    };

    fetchSellerData();

    // Auto-sync berkala setiap 3.5 detik untuk pesanan masuk & status
    const interval = setInterval(fetchSellerData, 3500);
    const handleFocus = () => fetchSellerData();
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Live metrics
  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "Selesai")
        .reduce((sum, o) => sum + o.total, 0),
    [orders],
  );

  const totalOrders = useMemo(
    () => orders.filter((o) => o.status === "Selesai").length,
    [orders],
  );

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock <= 10).length,
    [products],
  );

  const activeOrdersCount = useMemo(
    () =>
      orders.filter((o) => o.status === "Masuk" || o.status === "Diproses")
        .length,
    [orders],
  );

  // Handlers for state updates
  const handleCompleteTransaction = (
    newOrder: Order,
    itemsSold: { productId: string; qty: number }[],
  ) => {
    // 1. Add to orders
    setOrders((prev) => [newOrder, ...prev]);

    // 2. Decrement stock
    setProducts((prev) =>
      prev.map((prod) => {
        const sold = itemsSold.find((item) => item.productId === prod.id);
        if (sold) {
          const newStock = Math.max(0, prod.stock - sold.qty);
          return {
            ...prod,
            stock: newStock,
            isActive: newStock > 0 ? prod.isActive : false,
          };
        }
        return prod;
      }),
    );
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)),
    );
    updateProductStockAction(productId, newStock).catch(console.error);
  };

  const handleUpdatePrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p)),
    );
  };

  const handleToggleActive = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isActive: !p.isActive } : p,
      ),
    );
    toggleProductActiveAction(productId).catch(console.error);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProduct = async (
    productId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const previousProducts = products;
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      const res = await deleteProductAction(productId);
      if (!res.success) {
        setProducts(previousProducts);
      }
      return res;
    } catch (err) {
      setProducts(previousProducts);
      return {
        success: false,
        message: "Terjadi kesalahan saat menghapus produk dari database.",
      };
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
  ) => {
    // 1. Optimistic update di sisi seller
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
    );

    // 2. Persist perubahan status ke database PostgreSQL
    try {
      const res = await updateOrderStatusAction(orderId, nextStatus);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error("Gagal mengupdate status pesanan:", err);
      toast.error("Gagal memperbarui status pesanan di database.");
    }
  };

  const handlePayRentInvoice = async (
    invoiceId: string,
    paymentMethod: string,
  ): Promise<{ success: boolean; receiptNumber: string; message: string }> => {
    const result = await settleRentInvoiceAction(invoiceId, paymentMethod);

    if (result.success && result.invoice) {
      const updated = result.invoice;
      setRentInvoices((prev) =>
        prev.map((invoice) => (invoice.id === updated.id ? updated : invoice)),
      );
    }

    return {
      success: result.success,
      receiptNumber: result.invoice?.receiptNumber || "",
      message: result.message,
    };
  };

  const rentPaymentHistory = useMemo<RentPaymentHistoryItem[]>(
    () =>
      rentInvoices
        .filter((invoice) => invoice.status === "paid")
        .map((invoice) => ({
          id: invoice.id,
          invoiceId: invoice.id,
          period: invoice.period,
          amount: invoice.totalAmount,
          paymentMethod: invoice.paymentMethod || "-",
          paidAt: invoice.paidAt || "-",
          status: "Berhasil",
          receiptNumber: invoice.receiptNumber || "-",
          associationName: invoice.associationName,
          boothNumber: invoice.boothNumber,
        })),
    [rentInvoices],
  );

  return (
    <SellerContext.Provider
      value={{
        products,
        orders,
        totalRevenue,
        totalOrders,
        lowStockCount,
        activeOrdersCount,
        rentInvoices,
        rentPaymentHistory,
        isRentLoading,
        handleCompleteTransaction,
        handleUpdateStock,
        handleUpdatePrice,
        handleToggleActive,
        handleAddProduct,
        handleDeleteProduct,
        handleUpdateOrderStatus,
        handlePayRentInvoice,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error("useSeller must be used within a SellerProvider");
  }
  return context;
}
