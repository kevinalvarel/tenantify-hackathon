"use client";

import { useSeller } from "@/context/seller-context";
import { PosSystem } from "@/components/seller/pos-system";

export default function SellerPosPage() {
  const { products, handleCompleteTransaction } = useSeller();

  return (
    <PosSystem
      products={products.filter((p) => p.isActive)}
      onCompleteTransaction={handleCompleteTransaction}
    />
  );
}
