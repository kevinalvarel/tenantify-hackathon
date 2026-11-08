"use client";

import { MapPin, Navigation, Info } from "lucide-react";
import { Tenant } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TenantMapPreviewProps = {
  tenants: Tenant[];
  onSelectTenant: (tenantId: string) => void;
};

export function TenantMapPreview({
  tenants,
  onSelectTenant,
}: TenantMapPreviewProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Intro info */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Denah Lokasi Tenant
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gunakan denah ini untuk menemukan booth tenant makanan atau minuman favorit Anda secara langsung.
          </p>
        </div>
        <Badge variant="outline" className="gap-1 text-primary border-primary/30">
          <Navigation className="size-3" />
          Lokasi Bazaar
        </Badge>
      </div>

      {/* Visual Zone Blocks Map */}
      <div className="rounded-2xl border bg-muted/20 p-4 sm:p-6 flex flex-col gap-6">
        {/* Entrance Marker */}
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1 text-xs font-bold text-primary flex items-center gap-1.5 shadow-2xs">
            <MapPin className="size-3.5" />
            Pintu Masuk Utama (Main Gate & Kasir Pusat)
          </div>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Zona A: Kopi, Pastry & Dimsum */}
          <div className="rounded-xl border border-dashed border-primary/30 bg-card/60 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-primary">ZONA A — Kopi & Snack Cepat</span>
              <Badge variant="secondary" className="text-[10px]">Pintu Masuk Kiri</Badge>
            </div>

            <div className="flex flex-col gap-2.5">
              {tenants
                .filter((t) => t.zone === "Zona A")
                .map((tenant) => (
                  <Card
                    key={tenant.id}
                    className="p-3 border hover:border-primary/50 transition-all cursor-pointer shadow-2xs bg-card"
                    onClick={() => onSelectTenant(tenant.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            {tenant.boothNumber}
                          </span>
                          <span className="font-bold text-xs text-foreground">{tenant.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{tenant.category}</p>
                      </div>

                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                        Buka
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="xs"
                      className="w-full mt-2 text-[11px] h-6 text-primary hover:bg-primary/5"
                    >
                      Buka Menu Tenant →
                    </Button>
                  </Card>
                ))}
            </div>
          </div>

          {/* Zona B: Makanan Berat & Kuliner Tradisional */}
          <div className="rounded-xl border border-dashed border-primary/30 bg-card/60 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-primary">ZONA B — Makanan Utama</span>
              <Badge variant="secondary" className="text-[10px]">Area Tengah (Dining)</Badge>
            </div>

            <div className="flex flex-col gap-2.5">
              {tenants
                .filter((t) => t.zone === "Zona B")
                .map((tenant) => (
                  <Card
                    key={tenant.id}
                    className="p-3 border hover:border-primary/50 transition-all cursor-pointer shadow-2xs bg-card"
                    onClick={() => onSelectTenant(tenant.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            {tenant.boothNumber}
                          </span>
                          <span className="font-bold text-xs text-foreground">{tenant.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{tenant.category}</p>
                      </div>

                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                        Buka
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="xs"
                      className="w-full mt-2 text-[11px] h-6 text-primary hover:bg-primary/5"
                    >
                      Buka Menu Tenant →
                    </Button>
                  </Card>
                ))}

              <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground bg-muted/20">
                Booth B-03 & B-04 (Area Meja Santap Terpusat)
              </div>
            </div>
          </div>

          {/* Zona C: Minuman Segar & Dessert */}
          <div className="rounded-xl border border-dashed border-primary/30 bg-card/60 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-primary">ZONA C — Minuman & Dessert</span>
              <Badge variant="secondary" className="text-[10px]">Sisi Kanan</Badge>
            </div>

            <div className="flex flex-col gap-2.5">
              {tenants
                .filter((t) => t.zone === "Zona C")
                .map((tenant) => (
                  <Card
                    key={tenant.id}
                    className="p-3 border hover:border-primary/50 transition-all cursor-pointer shadow-2xs bg-card"
                    onClick={() => onSelectTenant(tenant.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            {tenant.boothNumber}
                          </span>
                          <span className="font-bold text-xs text-foreground">{tenant.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{tenant.category}</p>
                      </div>

                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                        Buka
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="xs"
                      className="w-full mt-2 text-[11px] h-6 text-primary hover:bg-primary/5"
                    >
                      Buka Menu Tenant →
                    </Button>
                  </Card>
                ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Info className="size-3.5 text-primary" />
            Klik kartu booth untuk langsung melihat katalog produk tenant tersebut.
          </span>
        </div>
      </div>
    </div>
  );
}
