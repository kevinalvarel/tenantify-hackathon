"use client";

import { useCustomer } from "@/context/customer-context";
import { CustomerOrdersHistory } from "@/components/customer/customer-orders-history";

export default function CustomerOrdersPage() {
  const { orders, reorder } = useCustomer();

  return (
    <CustomerOrdersHistory
      orders={orders}
      onReorder={reorder}
    />
  );
}
