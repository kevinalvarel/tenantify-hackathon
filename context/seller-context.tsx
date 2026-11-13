"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { getSellerDataAction, updateOrderStatusAction } from "@/servers/seller-server";
import {
  Product,
  Order,
  OrderStatus,
  RentInvoice,
  RentPaymentHistoryItem,
} from "@/types/seller";
import { toast } from "sonner";

function playOrderAlertSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Play two-tone bell chime: D5 (587Hz) then A5 (880Hz)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {
    // Audio context may be restricted before first interaction
  }
}

type SellerContextType = {
  products: Product[];
  orders: Order[];
  totalRevenue: number;
  totalOrders: number;
  lowStockCount: number;
  activeOrdersCount: number;
  pendingOrdersCount: number;
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
  handleUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
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
  const [rentPaymentHistory, setRentPaymentHistory] = useState<
    RentPaymentHistoryItem[]
  >([]);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  // Polling data seller & pesanan masuk secara real-time setiap 3.5 detik
  useEffect(() => {
    let isMounted = true;

    const syncSellerData = async (isInitial = false) => {
      try {
        const data = await getSellerDataAction();
        if (!isMounted) return;

        if (data.products.length > 0) {
          setProducts(data.products);
        }

        if (data.orders.length > 0) {
          // Deteksi pesanan baru yang berstatus 'Masuk'
          if (!isInitial) {
            const newlyArrived = data.orders.filter(
              (o) => !knownOrderIdsRef.current.has(o.id) && o.status === "Masuk"
            );

            if (newlyArrived.length > 0) {
              playOrderAlertSound();
              newlyArrived.forEach((o) => {
                toast.info(`🔔 Pesanan Baru Masuk! #${o.id} dari ${o.customerName}`, {
                  duration: 6000,
                });
              });
            }
          }

          // Perbarui daftar order ID yang telah diketahui
          data.orders.forEach((o) => knownOrderIdsRef.current.add(o.id));
          setOrders(data.orders);
        }
      } catch (err) {
        console.warn("Sinkronisasi pesanan seller error:", err);
      }
    };

    // Muat data awal
    syncSellerData(true);

    const intervalId = setInterval(() => {
      syncSellerData(false);
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
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

  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "Masuk").length,
    [orders]
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

  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: OrderStatus
  ) => {
    // 1. Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
    );

    // 2. Simpan status baru ke database
    try {
      const res = await updateOrderStatusAction(orderId, nextStatus);
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
      }
    } catch {
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
        pendingOrdersCount,
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
