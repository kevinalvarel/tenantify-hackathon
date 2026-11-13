"use client";

import { useAssociation } from "@/context/association-context";
import { AreaLayoutManagement } from "@/components/association/layout/area-layout-management";

export default function AssociationLayoutPage() {
  const { booths, tenants, zones, setSelectedTenant } = useAssociation();

  return (
    <AreaLayoutManagement
      zones={zones}
      booths={booths}
      tenants={tenants}
      onSelectTenant={setSelectedTenant}
    />
  );
}
