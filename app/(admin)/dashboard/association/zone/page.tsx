"use client";

import { useAssociation } from "@/context/association-context";
import { AreaLayoutManagement } from "@/components/association/layout/area-layout-management";

export default function AssociationLayoutPage() {
  const {
    booths,
    tenants,
    zones,
    isLoading,
    loadError,
    refresh,
    setSelectedTenant,
    handleCreateZone,
    handleDeleteZone,
    handleCreateBooth,
    handleUpdateBooth,
    handleDeleteBooth,
  } = useAssociation();

  return (
    <AreaLayoutManagement
      zones={zones}
      booths={booths}
      tenants={tenants}
      isLoading={isLoading}
      loadError={loadError}
      onRetry={refresh}
      onSelectTenant={setSelectedTenant}
      onCreateZone={handleCreateZone}
      onDeleteZone={handleDeleteZone}
      onCreateBooth={handleCreateBooth}
      onUpdateBooth={handleUpdateBooth}
      onDeleteBooth={handleDeleteBooth}
    />
  );
}
