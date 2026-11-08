"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { AreaZone, BoothSlot, AssociationTenant } from "@/types/association";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AreaLayoutManagementProps = {
  zones: AreaZone[];
  booths: BoothSlot[];
  tenants: AssociationTenant[];
  onSelectTenant: (tenant: AssociationTenant) => void;
};

export function AreaLayoutManagement({
  zones,
  booths,
  tenants,
  onSelectTenant,
}: AreaLayoutManagementProps) {
  const [selectedZoneCode, setSelectedZoneCode] = useState<string>("all");
  const [selectedBooth, setSelectedBooth] = useState<BoothSlot | null>(null);

  const filteredZones =
    selectedZoneCode === "all"
      ? zones
      : zones.filter((z) => z.code === selectedZoneCode);

  const occupiedCount = booths.filter((b) => b.status === "occupied").length;
  const availableCount = booths.filter((b) => b.status === "available").length;
  const reservedCount = booths.filter((b) => b.status === "reserved").length;

  return (
    <div className="flex flex-col gap-5">
      {/* Overview Card */}
      <Card className="p-4 shadow-xs">
        <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-foreground text-base">
              Tata Letak Denah Stan Komersial
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Peta interaktif pembagian zona bazaar dan ketersediaan stan operasional.
            </p>
          </div>

          {/* Status Legends */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-foreground">
                Terisi ({occupiedCount})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" />
              <span className="font-medium text-foreground">
                Tersedia ({availableCount})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-amber-500" />
              <span className="font-medium text-foreground">
                Dipesan ({reservedCount})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Filter Pill */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedZoneCode === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedZoneCode("all")}
          className="text-xs h-7"
        >
          Semua Zona ({zones.length})
        </Button>
        {zones.map((zone) => (
          <Button
            key={zone.id}
            variant={selectedZoneCode === zone.code ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedZoneCode(zone.code)}
            className="text-xs h-7"
          >
                {zone.name.split("-")[0]} ({zone.occupiedBooths}/{zone.totalBooths})
          </Button>
        ))}
      </div>

      {/* Grid of Zones and Booths */}
      <div className="flex flex-col gap-6">
        {filteredZones.length === 0 ? (
          <Card className="p-8 border-dashed text-center text-xs text-muted-foreground">
            Belum ada zona atau stan yang terdaftar.
          </Card>
        ) : (
          filteredZones.map((zone) => {
          const zoneBooths = booths.filter((b) => b.zoneCode === zone.code);

          return (
            <Card key={zone.id} className="p-4 overflow-hidden border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <h4 className="font-bold text-sm text-foreground">
                      {zone.name}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {zone.description} • Fokus: {zone.categoryFocus}
                  </p>
                </div>
                <Badge variant="outline" className="w-fit text-xs">
                  {zoneBooths.filter((b) => b.status === "occupied").length} dari{" "}
                  {zoneBooths.length} Stan Aktif
                </Badge>
              </div>

              {/* Booth Floor Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                {zoneBooths.map((booth) => {
                  const tenantData = booth.tenantId
                    ? tenants.find((t) => t.id === booth.tenantId)
                    : null;

                  let borderClass = "border-border";
                  let bgClass = "bg-card";

                  if (booth.status === "occupied") {
                    borderClass = "border-emerald-500/50";
                    bgClass = "bg-emerald-500/5 hover:bg-emerald-500/10";
                  } else if (booth.status === "reserved") {
                    borderClass = "border-amber-500/50";
                    bgClass = "bg-amber-500/5 hover:bg-amber-500/10";
                  } else {
                    borderClass = "border-primary/40";
                    bgClass = "bg-primary/5 hover:bg-primary/10";
                  }

                  return (
                    <div
                      key={booth.id}
                      onClick={() => {
                        setSelectedBooth(booth);
                        if (tenantData) {
                          onSelectTenant(tenantData);
                        }
                      }}
                      className={`relative flex flex-col justify-between p-3 rounded-xl border text-left cursor-pointer transition-all hover:shadow-xs min-h-[110px] ${borderClass} ${bgClass}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-bold text-foreground">
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
                          className="text-[9px] h-4 px-1"
                        >
                          {booth.status === "occupied"
                            ? "Terisi"
                            : booth.status === "reserved"
                            ? "Dipesan"
                            : "Kosong"}
                        </Badge>
                      </div>

                      <div className="my-1">
                        {booth.tenantName ? (
                          <div>
                            <p className="text-xs font-semibold text-foreground line-clamp-1">
                              {booth.tenantName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {booth.category || "UMKM"}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-muted-foreground italic">
                              Stan Tersedia
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {booth.size}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-1 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{booth.size}</span>
                        <span className="font-medium text-foreground">
                          {formatRupiah(booth.priceMonthly).split(",")[0]}/bln
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
          })
        )}
      </div>

      {/* Selected Booth Info Bottom Sheet / Alert */}
      {selectedBooth && !selectedBooth.tenantName && (
        <Card className="p-3 border-primary/30 bg-primary/5">
          <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-foreground">
                Stan Terpilih: {selectedBooth.boothNumber} ({selectedBooth.zoneCode})
              </p>
              <p className="text-[11px] text-muted-foreground">
                Ukuran: {selectedBooth.size} • Harga Sewa:{" "}
                {formatRupiah(selectedBooth.priceMonthly)} / bulan • Status: Tersedia
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => setSelectedBooth(null)}
            >
              Tutup Info
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
