"use client";

import { useSeller } from "@/context/seller-context";
import { RentPaymentSystem } from "@/components/seller/rent-payment-system";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerPaymentsPage() {
  const {
    rentInvoices,
    rentPaymentHistory,
    handlePayRentInvoice,
    isRentLoading,
  } = useSeller();

  if (isRentLoading) {
    return (
      <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <RentPaymentSystem
      invoices={rentInvoices}
      paymentHistory={rentPaymentHistory}
      onPayInvoice={handlePayRentInvoice}
    />
  );
}
