"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { AreaZone, AssociationTenant, BoothSlot } from "@/types/association";
import { getAssociationDataAction } from "@/servers/association-server";
import { toast } from "sonner";

type AssociationContextType = {
  tenants: AssociationTenant[];
  booths: BoothSlot[];
  zones: AreaZone[];
  selectedTenant: AssociationTenant | null;
  setSelectedTenant: (tenant: AssociationTenant | null) => void;
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalRevenue: number;
  totalBooths: number;
  occupiedBooths: number;
  occupancyRate: number;
  handleAddTenant: (newTenant: AssociationTenant) => void;
  handleToggleStatus: (tenantId: string) => void;
  handleDeleteTenant: (tenantId: string) => void;
};

const AssociationContext = createContext<AssociationContextType | undefined>(
  undefined
);

export function AssociationProvider({
  children,
  initialTenants = [],
  initialBooths = [],
  initialZones = [],
}: {
  children: React.ReactNode;
  initialTenants?: AssociationTenant[];
  initialBooths?: BoothSlot[];
  initialZones?: AreaZone[];
}) {
  const [tenants, setTenants] = useState<AssociationTenant[]>(initialTenants);
  const [booths, setBooths] = useState<BoothSlot[]>(initialBooths);
  const [zones, setZones] = useState<AreaZone[]>(initialZones);
  const [selectedTenant, setSelectedTenant] =
    useState<AssociationTenant | null>(null);

  useEffect(() => {
    let isMounted = true;
    getAssociationDataAction().then((data) => {
      if (isMounted) {
        if (data.tenants.length > 0) setTenants(data.tenants);
        if (data.booths.length > 0) setBooths(data.booths);
        if (data.zones.length > 0) setZones(data.zones);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Live metrics calculations
  const totalTenants = tenants.length;
  const activeTenants = useMemo(
    () => tenants.filter((t) => t.status === "active").length,
    [tenants]
  );
  const inactiveTenants = useMemo(
    () => tenants.filter((t) => t.status === "inactive").length,
    [tenants]
  );
  const totalRevenue = useMemo(
    () =>
      tenants
        .filter((t) => t.status === "active")
        .reduce((sum, t) => sum + t.monthlyRevenue, 0),
    [tenants]
  );

  const totalBooths = booths.length;
  const occupiedBooths = useMemo(
    () => booths.filter((b) => b.status === "occupied").length,
    [booths]
  );
  const occupancyRate = useMemo(
    () =>
      totalBooths > 0 ? Math.round((occupiedBooths / totalBooths) * 100) : 0,
    [occupiedBooths, totalBooths]
  );

  // Handlers for state updates
  const handleAddTenant = (newTenant: AssociationTenant) => {
    setTenants((prev) => [newTenant, ...prev]);
    setBooths((prev) =>
      prev.map((b) =>
        b.boothNumber === newTenant.boothNumber
          ? {
              ...b,
              status: "occupied",
              tenantId: newTenant.id,
              tenantName: newTenant.name,
              category: newTenant.category,
            }
          : b
      )
    );
  };

  const handleToggleStatus = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const nextStatus = t.status === "active" ? "inactive" : "active";
          toast.info(
            `Status tenant "${t.name}" diubah menjadi ${
              nextStatus === "active" ? "Aktif" : "Nonaktif"
            }.`
          );
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleDeleteTenant = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    setBooths((prev) =>
      prev.map((b) =>
        b.tenantId === tenantId
          ? {
              ...b,
              status: "available",
              tenantId: undefined,
              tenantName: undefined,
              category: undefined,
            }
          : b
      )
    );
    toast.success(`Tenant "${target?.name || ""}" berhasil dihapus.`);
  };

  return (
    <AssociationContext.Provider
      value={{
        tenants,
        booths,
        zones,
        selectedTenant,
        setSelectedTenant,
        totalTenants,
        activeTenants,
        inactiveTenants,
        totalRevenue,
        totalBooths,
        occupiedBooths,
        occupancyRate,
        handleAddTenant,
        handleToggleStatus,
        handleDeleteTenant,
      }}
    >
      {children}
    </AssociationContext.Provider>
  );
}

export function useAssociation() {
  const context = useContext(AssociationContext);
  if (!context) {
    throw new Error(
      "useAssociation must be used within an AssociationProvider"
    );
  }
  return context;
}
