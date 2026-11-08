"use client";

import { useSeller } from "@/context/seller-context";
import { OrdersManagement } from "@/components/seller/orders-management";

export default function SellerOrdersPage() {
  const { orders, handleUpdateOrderStatus } = useSeller();

  return (
    <OrdersManagement
      orders={orders}
      onUpdateOrderStatus={handleUpdateOrderStatus}
    />
  );
}
