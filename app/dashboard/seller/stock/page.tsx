"use client";

import { useSeller } from "@/context/seller-context";
import { StockManagement } from "@/components/seller/stock-management";

export default function SellerStockPage() {
  const { products, handleUpdateStock, handleToggleActive, handleAddProduct } =
    useSeller();

  return (
    <StockManagement
      products={products}
      onUpdateStock={handleUpdateStock}
      onToggleActive={handleToggleActive}
      onAddProduct={handleAddProduct}
    />
  );
}
