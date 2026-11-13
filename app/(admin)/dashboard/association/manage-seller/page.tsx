"use client";

import { useAssociation } from "@/context/association-context";
import { TenantManagement } from "@/components/association/manage-seller/tenant-management";

export default function AssociationTenantsPage() {
  const { tenants, handleToggleStatus, handleDeleteTenant, setSelectedTenant } =
    useAssociation();

  return (
    <TenantManagement
      tenants={tenants}
      onToggleStatus={handleToggleStatus}
      onDeleteTenant={handleDeleteTenant}
      onSelectTenant={setSelectedTenant}
    />
  );
}
