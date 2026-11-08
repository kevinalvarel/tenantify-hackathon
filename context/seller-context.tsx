"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
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
  handleCompleteTransaction: (
    newOrder: Order,
    itemsSold: { productId: string; qty: number }[]
  ) => void;
  handleUpdateStock: (productId: string, newStock: number) => void;
  handleToggleActive: (productId: string) => void;
  handleAddProduct: (newProduct: Product) => void;
  handleUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  handlePayRentInvoice: (
    invoiceId: string,
    paymentMethod: string
  ) => { success: boolean; receiptNumber: string };
};

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rentInvoices, setRentInvoices] = useState<RentInvoice[]>([]);
  const [rentPaymentHistory, setRentPaymentHistory] = useState<
    RentPaymentHistoryItem[]
  >([]);

  // Live metrics
  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "Selesai")
        .reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  const totalOrders = useMemo(
    () => orders.filter((o) => o.status === "Selesai").length,
    [orders]
  );

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock <= 10).length,
    [products]
  );

  const activeOrdersCount = useMemo(
    () =>
      orders.filter(
        (o) => o.status === "Masuk" || o.status === "Diproses"
      ).length,
    [orders]
  );

  // Handlers for state updates
  const handleCompleteTransaction = (
    newOrder: Order,
    itemsSold: { productId: string; qty: number }[]
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
      })
    );
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const handleToggleActive = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
  };

  const handlePayRentInvoice = (
    invoiceId: string,
    paymentMethod: string
  ): { success: boolean; receiptNumber: string } => {
    const targetInvoice = rentInvoices.find((inv) => inv.id === invoiceId);
    if (!targetInvoice) {
      return { success: false, receiptNumber: "" };
    }

    const now = new Date();
    const dateFormatted = now.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeFormatted = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const paidAt = `${dateFormatted}, ${timeFormatted} WIB`;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `RCP-${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${randomSuffix}`;

    // Update invoice state
    setRentInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: "paid",
              paidAt,
              paymentMethod,
              receiptNumber,
            }
          : inv
      )
    );

    // Add to history
    const historyItem: RentPaymentHistoryItem = {
      id: `pay-${Date.now()}`,
      invoiceId: targetInvoice.id,
      period: targetInvoice.period,
      amount: targetInvoice.totalAmount,
      paymentMethod,
      paidAt,
      status: "Berhasil",
      receiptNumber,
      associationName: targetInvoice.associationName,
      boothNumber: targetInvoice.boothNumber,
    };

    setRentPaymentHistory((prev) => [historyItem, ...prev]);

    return { success: true, receiptNumber };
  };

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
        handleCompleteTransaction,
        handleUpdateStock,
        handleToggleActive,
        handleAddProduct,
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
