"use client";

import { useSeller } from "@/context/seller-context";
import { RentPaymentSystem } from "@/components/seller/rent-payment-system";

export default function SellerPaymentsPage() {
  const { rentInvoices, rentPaymentHistory, handlePayRentInvoice } =
    useSeller();

  return (
    <RentPaymentSystem
      invoices={rentInvoices}
      paymentHistory={rentPaymentHistory}
      onPayInvoice={handlePayRentInvoice}
    />
  );
}
