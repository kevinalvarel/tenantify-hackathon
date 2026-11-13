"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Pencil,
  Plus,
  RefreshCw,
  Store,
  Trash2,
} from "lucide-react";
import { AreaZone, BoothSlot, AssociationTenant } from "@/types/association";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { ZoneFormDialog } from "./zone-form-dialog";
import { BoothFormDialog } from "./booth-form-dialog";
import type { LayoutActionResult } from "@/servers/association-server";
import type {
  TCreateBooth,
  TCreateZone,
  TUpdateBooth,
} from "@/validations/association-layout";

type AreaLayoutManagementProps = {
  zones: AreaZone[];
  booths: BoothSlot[];
  tenants: AssociationTenant[];
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => Promise<void>;
  onSelectTenant: (tenant: AssociationTenant) => void;
  onCreateZone: (input: TCreateZone) => Promise<LayoutActionResult>;
  onDeleteZone: (zoneId: string) => Promise<LayoutActionResult>;
  onCreateBooth: (input: TCreateBooth) => Promise<LayoutActionResult>;
  onUpdateBooth: (input: TUpdateBooth) => Promise<LayoutActionResult>;
  onDeleteBooth: (boothId: string) => Promise<LayoutActionResult>;
};

type DeleteTarget =
  | { type: "zone"; zone: AreaZone }
  | { type: "booth"; booth: BoothSlot };

const STATUS_LABEL: Record<BoothSlot["status"], string> = {
  occupied: "Terisi",
  available: "Tersedia",
  reserved: "Dipesan",
};

function boothTone(status: BoothSlot["status"]) {
  if (status === "occupied") {
    return "border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10";
  }
  if (status === "reserved") {
    return "border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10";
  }
  return "border-primary/40 bg-primary/5 hover:bg-primary/10";
}

export function AreaLayoutManagement({
  zones,
  booths,
  tenants,
  isLoading,
  loadError,
  onRetry,
  onSelectTenant,
  onCreateZone,
  onDeleteZone,
  onCreateBooth,
  onUpdateBooth,
  onDeleteBooth,
}: AreaLayoutManagementProps) {
  const [selectedZoneCode, setSelectedZoneCode] = useState<string>("all");
  const [selectedBooth, setSelectedBooth] = useState<BoothSlot | null>(null);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [boothDialog, setBoothDialog] = useState<{
    open: boolean;
    booth: BoothSlot | null;
    zoneId?: string;
  }>({ open: false, booth: null });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const activeZoneCode =
    selectedZoneCode === "all" ||
    zones.some((zone) => zone.code === selectedZoneCode)
      ? selectedZoneCode
      : "all";

  const filteredZones = useMemo(
    () =>
      activeZoneCode === "all"
        ? zones
        : zones.filter((zone) => zone.code === activeZoneCode),
    [zones, activeZoneCode]
  );

  const statusCounts = useMemo(() => {
    return booths.reduce(
      (acc, booth) => {
        acc[booth.status] += 1;
        return acc;
      },
      { occupied: 0, available: 0, reserved: 0 }
    );
  }, [booths]);

  const boothsByZone = useMemo(() => {
    const map = new Map<string, BoothSlot[]>();
    for (const booth of booths) {
      const list = map.get(booth.zoneCode) || [];
      list.push(booth);
      map.set(booth.zoneCode, list);
    }
    return map;
  }, [booths]);

  const occupiedByZone = (zoneCode: string) =>
    (boothsByZone.get(zoneCode) || []).filter(
      (booth) => booth.status === "occupied"
    ).length;

  const existingCodes = useMemo(
    () => zones.map((zone) => zone.code),
    [zones]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return false;

    const result =
      deleteTarget.type === "zone"
        ? await onDeleteZone(deleteTarget.zone.id)
        : await onDeleteBooth(deleteTarget.booth.id);

    if (!result.success) {
      toast.error(result.message);
      return false;
    }

    toast.success(result.message);
    if (
      deleteTarget.type === "booth" &&
      selectedBooth?.id === deleteTarget.booth.id
    ) {
      setSelectedBooth(null);
    }
    setDeleteTarget(null);
    return true;
  };

  const handleCreateZone = async (input: TCreateZone) => {
    const result = await onCreateZone(input);
    if (result.success) toast.success(result.message);
    return result;
  };

  const handleBoothCreate = async (input: TCreateBooth) => {
    const result = await onCreateBooth(input);
    if (result.success) toast.success(result.message);
    return result;
  };

  const handleBoothUpdate = async (input: TUpdateBooth) => {
    const result = await onUpdateBooth(input);
    if (result.success) {
      toast.success(result.message);
      if (selectedBooth?.id === input.id) setSelectedBooth(null);
    }
    return result;
  };

  if (loadError) {
    return (
      <Card className="border-destructive/40 bg-destructive/5 p-6">
        <div className="flex flex-col items-start gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Data zona belum bisa dimuat
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{loadError}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onRetry()}
            className="min-h-11 gap-1.5 sm:min-h-7"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Coba lagi
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-4 shadow-xs">
        <CardContent className="flex flex-col justify-between gap-4 p-0 md:flex-row md:items-center">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Kelola Zona &amp; Stan
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tambah zona, atur booth, dan rapikan area yang sudah digambar di
              denah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-foreground">
                Terisi ({statusCounts.occupied})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" />
              <span className="font-medium text-foreground">
                Tersedia ({statusCounts.available})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-amber-500" />
              <span className="font-medium text-foreground">
                Dipesan ({statusCounts.reserved})
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => setZoneDialogOpen(true)}
              className="min-h-11 gap-1.5 sm:min-h-7"
            >
              <Plus className="size-4" aria-hidden="true" />
              Tambah zona
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeZoneCode === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedZoneCode("all")}
          className="h-8 text-xs min-h-11 sm:min-h-8"
        >
          Semua zona ({zones.length})
        </Button>
        {zones.map((zone) => {
          const zoneBooths = boothsByZone.get(zone.code) || [];
          return (
            <Button
              key={zone.id}
              variant={activeZoneCode === zone.code ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedZoneCode(zone.code)}
              className="h-8 text-xs min-h-11 sm:min-h-8"
            >
              {zone.code} ({zoneBooths.length})
            </Button>
          );
        })}
      </div>

      {isLoading && zones.length === 0 ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : zones.length === 0 ? (
        <Card className="border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Building2 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Belum ada zona
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Buat zona pertama, lalu tambahkan booth atau gambar area di
                halaman denah.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setZoneDialogOpen(true)}
              className="min-h-11 gap-1.5 sm:min-h-7"
            >
              <Plus className="size-4" aria-hidden="true" />
              Tambah zona pertama
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredZones.map((zone) => {
            const zoneBooths = boothsByZone.get(zone.code) || [];
            const zoneOccupied = occupiedByZone(zone.code);
            const canDeleteZone = zoneOccupied === 0;

            return (
              <Card key={zone.id} className="overflow-hidden border p-4">
                <div className="flex flex-col justify-between gap-3 border-b pb-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Building2
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-foreground">
                        {zone.name}
                      </h4>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {zone.code}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {zone.description || "Belum ada deskripsi"}
                      {zone.categoryFocus
                        ? ` • Fokus: ${zone.categoryFocus}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="w-fit text-xs">
                      {zoneOccupied} dari {zoneBooths.length} stan aktif
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteTarget({ type: "zone", zone })}
                      disabled={!canDeleteZone}
                      title={
                        canDeleteZone
                          ? `Hapus zona ${zone.code}`
                          : "Zona masih memiliki booth terisi"
                      }
                      aria-label={
                        canDeleteZone
                          ? `Hapus zona ${zone.code}`
                          : `Zona ${zone.code} tidak bisa dihapus karena masih ada booth terisi`
                      }
                      className="min-h-11 gap-1.5 text-destructive hover:bg-destructive/10 sm:min-h-7"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Hapus zona
                    </Button>
                  </div>
                </div>

                {zoneBooths.length === 0 ? (
                  <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
                    <Store
                      className="size-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <p className="text-xs text-muted-foreground">
                      Zona ini belum punya booth.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setBoothDialog({ open: true, booth: null, zoneId: zone.id })
                      }
                      className="min-h-11 gap-1.5 sm:min-h-7"
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                      Tambah booth
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {zoneBooths.map((booth) => {
                      const tenantData = booth.tenantId
                        ? tenants.find((tenant) => tenant.id === booth.tenantId)
                        : null;
                      const isOccupied =
                        booth.status === "occupied" || Boolean(booth.tenantId);

                      return (
                        <div
                          key={booth.id}
                          className={`flex min-h-[120px] flex-col rounded-xl border transition-colors ${boothTone(
                            booth.status
                          )}`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBooth(booth);
                              if (tenantData) onSelectTenant(tenantData);
                            }}
                            aria-label={`Buka detail booth ${booth.boothNumber}`}
                            className="flex flex-1 flex-col justify-between rounded-t-xl p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-mono text-xs font-bold text-foreground">
                                {booth.boothNumber}
                              </span>
                              <Badge
                                variant={
                                  booth.status === "occupied"
                                    ? "default"
                                    : booth.status === "reserved"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="h-4 px-1 text-[9px]"
                              >
                                {STATUS_LABEL[booth.status]}
                              </Badge>
                            </div>

                            <div className="my-1">
                              {booth.tenantName ? (
                                <>
                                  <p className="line-clamp-1 text-xs font-semibold text-foreground">
                                    {booth.tenantName}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {booth.category || "UMKM"}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-xs italic text-muted-foreground">
                                    {booth.label || "Stan tersedia"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {booth.size}
                                  </p>
                                </>
                              )}
                            </div>
                          </button>

                          <div className="flex items-center justify-between gap-1 border-t border-border/50 px-2 py-1">
                            <span className="text-[10px] text-muted-foreground">
                              {booth.priceMonthly > 0
                                ? `${formatRupiah(booth.priceMonthly)}/bln`
                                : "Harga belum diisi"}
                            </span>
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setBoothDialog({ open: true, booth })
                                }
                                aria-label={`Ubah booth ${booth.boothNumber}`}
                                title="Ubah booth"
                                className="min-h-11 min-w-11 text-muted-foreground hover:text-foreground sm:min-h-8 sm:min-w-8"
                              >
                                <Pencil className="size-3.5" aria-hidden="true" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setDeleteTarget({ type: "booth", booth })
                                }
                                disabled={isOccupied}
                                aria-label={
                                  isOccupied
                                    ? `Booth ${booth.boothNumber} tidak bisa dihapus karena terisi`
                                    : `Hapus booth ${booth.boothNumber}`
                                }
                                title={
                                  isOccupied
                                    ? "Booth terisi tidak bisa dihapus"
                                    : "Hapus booth"
                                }
                                className="min-h-11 min-w-11 text-muted-foreground hover:text-destructive sm:min-h-8 sm:min-w-8"
                              >
                                <Trash2 className="size-3.5" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {zoneBooths.length > 0 && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setBoothDialog({ open: true, booth: null, zoneId: zone.id })
                      }
                      className="min-h-11 gap-1.5 sm:min-h-7"
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                      Tambah booth
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {selectedBooth && !selectedBooth.tenantName && (
        <Card className="border-primary/30 bg-primary/5 p-3">
          <CardContent className="flex flex-col justify-between gap-2 p-0 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold text-foreground">
                Stan terpilih: {selectedBooth.boothNumber} (
                {selectedBooth.zoneCode})
              </p>
              <p className="text-[11px] text-muted-foreground">
                Ukuran: {selectedBooth.size} • Harga sewa:{" "}
                {selectedBooth.priceMonthly > 0
                  ? `${formatRupiah(selectedBooth.priceMonthly)} / bulan`
                  : "belum diisi"}{" "}
                • Status: {STATUS_LABEL[selectedBooth.status]}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedBooth(null)}
            >
              Tutup info
            </Button>
          </CardContent>
        </Card>
      )}

      {zoneDialogOpen && (
        <ZoneFormDialog
          open
          onOpenChange={setZoneDialogOpen}
          existingCodes={existingCodes}
          onSubmit={handleCreateZone}
        />
      )}

      {boothDialog.open && (
        <BoothFormDialog
          open
          onOpenChange={(open) =>
            setBoothDialog((prev) => ({ ...prev, open }))
          }
          zones={zones}
          booth={boothDialog.booth}
          defaultZoneId={boothDialog.zoneId}
          onCreate={handleBoothCreate}
          onUpdate={handleBoothUpdate}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={deleteTarget.type === "zone" ? "Hapus zona?" : "Hapus booth?"}
          description={
            deleteTarget.type === "zone"
              ? `Zona ${deleteTarget.zone.code} dan ${
                  (boothsByZone.get(deleteTarget.zone.code) || []).length
                } booth kosong di dalamnya akan dihapus permanen.`
              : `Booth ${deleteTarget.booth.boothNumber} akan dihapus permanen.`
          }
          confirmLabel={
            deleteTarget.type === "zone" ? "Hapus zona" : "Hapus booth"
          }
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
