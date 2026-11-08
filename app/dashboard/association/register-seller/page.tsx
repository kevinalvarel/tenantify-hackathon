"use client";

import { useAssociation } from "@/context/association-context";
import { SellerRegistration } from "@/components/association/register-seller/seller-registration";

export default function SellerRegistrationPage() {
  const { tenants, booths, handleAddTenant, setSelectedTenant } =
    useAssociation();

  return (
    <SellerRegistration
      tenants={tenants}
      booths={booths}
      onAddTenant={handleAddTenant}
      onSelectTenant={setSelectedTenant}
    />
  );
}
