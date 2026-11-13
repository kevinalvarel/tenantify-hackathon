"use client";

import { SellerProvider, useSeller } from "@/context/seller-context";
import { SellerHeader } from "@/components/seller/seller-header";

function SellerLayoutContent({ children }: { children: React.ReactNode }) {
  const { totalRevenue, totalOrders, lowStockCount, activeOrdersCount } =
    useSeller();

  return (
    <div className="flex flex-col gap-6 p-1 md:p-2">
      {/* Seller Identity & Metrics Banner */}
      <SellerHeader
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        lowStockCount={lowStockCount}
        activeOrdersCount={activeOrdersCount}
      />

      {/* Page Content from sub-routes */}
      <main className="w-full">{children}</main>
    </div>
  );
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerProvider>
      <SellerLayoutContent>{children}</SellerLayoutContent>
    </SellerProvider>
  );
}
