"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AreaZone, AssociationTenant, BoothSlot } from "@/types/association";
import {
  createBoothAction,
  createZoneAction,
  deleteBoothAction,
  deleteZoneAction,
  getAssociationDataAction,
  saveFloorplanAction,
  updateBoothAction,
  type AssociationData,
  type LayoutActionResult,
} from "@/servers/association-server";
import type {
  TCreateBooth,
  TCreateZone,
  TSaveFloorplan,
  TUpdateBooth,
} from "@/validations/association-layout";
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
  isLoading: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;
  handleAddTenant: (newTenant: AssociationTenant) => void;
  handleToggleStatus: (tenantId: string) => void;
  handleDeleteTenant: (tenantId: string) => void;
  handleCreateZone: (input: TCreateZone) => Promise<LayoutActionResult>;
  handleDeleteZone: (zoneId: string) => Promise<LayoutActionResult>;
  handleCreateBooth: (input: TCreateBooth) => Promise<LayoutActionResult>;
  handleUpdateBooth: (input: TUpdateBooth) => Promise<LayoutActionResult>;
  handleDeleteBooth: (boothId: string) => Promise<LayoutActionResult>;
  handleSaveFloorplan: (input: TSaveFloorplan) => Promise<LayoutActionResult>;
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const applyData = useCallback((data: AssociationData) => {
    setTenants(data.tenants);
    setBooths(data.booths);
    setZones(data.zones);
    setLoadError(null);
  }, []);

  useEffect(() => {
    let isActive = true;
    getAssociationDataAction().then((data) => {
      if (!isActive) return;
      if (data.error) {
        setLoadError(data.error);
      } else {
        applyData(data);
      }
      setIsLoading(false);
    });
    return () => {
      isActive = false;
    };
  }, [applyData]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await getAssociationDataAction();
    if (data.error) {
      setLoadError(data.error);
    } else {
      applyData(data);
    }
    setIsLoading(false);
  }, [applyData]);

  const runAction = useCallback(
    async (action: () => Promise<LayoutActionResult>) => {
      const result = await action();
      if (result.success && result.data) {
        applyData(result.data);
      }
      return result;
    },
    [applyData]
  );

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

  const handleCreateZone = (input: TCreateZone) =>
    runAction(() => createZoneAction(input));
  const handleDeleteZone = (zoneId: string) =>
    runAction(() => deleteZoneAction(zoneId));
  const handleCreateBooth = (input: TCreateBooth) =>
    runAction(() => createBoothAction(input));
  const handleUpdateBooth = (input: TUpdateBooth) =>
    runAction(() => updateBoothAction(input));
  const handleDeleteBooth = (boothId: string) =>
    runAction(() => deleteBoothAction(boothId));
  const handleSaveFloorplan = (input: TSaveFloorplan) =>
    runAction(() => saveFloorplanAction(input));

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
        isLoading,
        loadError,
        refresh,
        handleAddTenant,
        handleToggleStatus,
        handleDeleteTenant,
        handleCreateZone,
        handleDeleteZone,
        handleCreateBooth,
        handleUpdateBooth,
        handleDeleteBooth,
        handleSaveFloorplan,
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
