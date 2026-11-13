"use client";

import {
  AssociationProvider,
  useAssociation,
} from "@/context/association-context";
import { TenantDetailDialog } from "@/components/association/tenant-detail-dialog";

function AssociationLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    selectedTenant,
    setSelectedTenant,
    handleToggleStatus,
    handleDeleteTenant,
  } = useAssociation();

  return (
    <div className="flex flex-col gap-6 p-1 md:p-2">
      <main className="w-full">{children}</main>

      <TenantDetailDialog
        tenant={selectedTenant}
        open={!!selectedTenant}
        onOpenChange={(open) => !open && setSelectedTenant(null)}
        onToggleStatus={handleToggleStatus}
        onDeleteTenant={handleDeleteTenant}
      />
    </div>
  );
}

export default function AssociationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AssociationProvider>
      <AssociationLayoutContent>{children}</AssociationLayoutContent>
    </AssociationProvider>
  );
}
