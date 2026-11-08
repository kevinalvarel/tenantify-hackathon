"use client";

import { useRouter } from "next/navigation";
import { useCustomer } from "@/context/customer-context";
import { TenantMapPreview } from "@/components/customer/tenant-map-preview";

export default function CustomerMapPage() {
  const router = useRouter();
  const { tenants } = useCustomer();

  const handleSelectTenant = () => {
    router.push("/dashboard/customer");
  };

  return (
    <TenantMapPreview
      tenants={tenants}
      onSelectTenant={handleSelectTenant}
    />
  );
}
