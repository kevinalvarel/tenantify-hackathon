"use client";

import React, { useState, useMemo } from "react";
import {
  FloorplanData,
  FloorplanBooth,
} from "@/types/floorplan";
import { formatRupiah } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Store,
  Star,
  MapPin,
  Pencil,
  CheckCircle2,
  Clock,
  CircleDot,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

interface FloorplanPreviewProps {
  data: FloorplanData;
  onExitPreview: () => void;
}

export function FloorplanPreview({
  data,
  onExitPreview,
}: FloorplanPreviewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>("all");
  const [activeBooth, setActiveBooth] = useState<FloorplanBooth | null>(null);

  // Filter booths based on search query and zone
  const filteredBooths = useMemo(() => {
    return data.booths.filter((b) => {
      const matchZone =
        selectedZoneFilter === "all" || b.zoneCode === selectedZoneFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.code.toLowerCase().includes(q) ||
        b.label.toLowerCase().includes(q) ||
        (b.tenantName && b.tenantName.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q));

      return matchZone && matchSearch;
    });
  }, [data.booths, selectedZoneFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner indicating Consumer Preview simulation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-card-foreground">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Store className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Simulasi Pratinjau Pengunjung (Consumer View)
            </h4>
            <p className="text-xs text-muted-foreground">
              Tampilan peta interaktif yang dilihat oleh pengunjung bazaar untuk menemukan lokasi stan.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExitPreview}
          className="gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <Pencil className="size-3.5" />
          <span>Kembali ke Mode Desain</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl border bg-card shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari stan, nama tenant, atau menu..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Zone Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant={selectedZoneFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedZoneFilter("all")}
            className="h-8 text-xs px-3"
          >
            Semua Zona
          </Button>
          {data.zones.map((zone) => (
            <Button
              key={zone.id}
              type="button"
              variant={selectedZoneFilter === zone.code ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedZoneFilter(zone.code)}
              className="h-8 text-xs px-3"
            >
              {zone.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Interactive Map Canvas (View-Only with Clickable Booths) */}
      <div className="relative w-full h-[580px] lg:h-[640px] rounded-xl border bg-card overflow-hidden shadow-xs">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${data.dimensions.width} ${data.dimensions.height}`}
          className="w-full h-full block"
        >
          {/* Canvas Background Plate */}
          <rect
            x={0}
            y={0}
            width={data.dimensions.width}
            height={data.dimensions.height}
            className="fill-background"
          />

          {/* Zones */}
          {data.zones.map((zone) => (
            <g key={zone.id}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                fill={zone.color}
                stroke={zone.borderColor}
                strokeWidth="1.5"
                strokeDasharray="6 4"
                rx="10"
              />
              <g transform={`translate(${zone.x + 12}, ${zone.y + 12})`}>
                <rect
                  x="0"
                  y="0"
                  width={zone.name.length * 7.5 + 36}
                  height="24"
                  rx="6"
                  className="fill-card shadow-xs"
                  stroke={zone.borderColor}
                  strokeWidth="1"
                />
                <circle cx="12" cy="12" r="4" fill={zone.borderColor} />
                <text
                  x="22"
                  y="16"
                  fontSize="11"
                  fontWeight="600"
                  className="fill-foreground font-sans select-none"
                >
                  {zone.name}
                </text>
              </g>
            </g>
          ))}

          {/* Entrance & Exit Doors */}
          {(data.doors || []).map((door) => {
            const isExit = door.type === "exit";
            const isBoth = door.type === "both";
            const themeColor = isExit ? "#10b981" : isBoth ? "#6366f1" : "#c85a32";
            const bgFill = isExit
              ? "rgba(16, 185, 129, 0.10)"
              : isBoth
              ? "rgba(99, 102, 241, 0.10)"
              : "rgba(200, 90, 50, 0.10)";

            return (
              <g
                key={door.id}
                transform={`translate(${door.x}, ${door.y}) rotate(${
                  door.rotation || 0
                }, ${door.width / 2}, ${door.height / 2})`}
              >
                <rect
                  x="0"
                  y="0"
                  width={door.width}
                  height={door.height}
                  rx="8"
                  fill={bgFill}
                  stroke={themeColor}
                  strokeWidth="1.5"
                />
                <circle
                  cx="18"
                  cy={door.height / 2}
                  r="5"
                  fill={themeColor}
                />
                <text
                  x="32"
                  y={door.height / 2 + 4}
                  fontSize="11"
                  fontWeight="700"
                  fill={themeColor}
                  className="font-sans select-none"
                >
                  {door.label}
                </text>
              </g>
            );
          })}

          {/* Booths */}
          {data.booths.map((booth) => {
            const isMatch = filteredBooths.some((b) => b.id === booth.id);
            const isOccupied = booth.status === "occupied";
            const isReserved = booth.status === "reserved";

            const statusBg = isOccupied
              ? "fill-card"
              : isReserved
              ? "fill-amber-500/10"
              : "fill-primary/10";

            const statusStroke = isOccupied
              ? "stroke-emerald-600 dark:stroke-emerald-500"
              : isReserved
              ? "stroke-amber-500"
              : "stroke-primary/70";

            const statusDotColor = isOccupied
              ? "#10b981"
              : isReserved
              ? "#f59e0b"
              : "#3b82f6";

            return (
              <g
                key={booth.id}
                onClick={() => setActiveBooth(booth)}
                transform={`rotate(${booth.rotation}, ${booth.x + booth.width / 2}, ${
                  booth.y + booth.height / 2
                })`}
                className="cursor-pointer transition-transform hover:opacity-90"
                opacity={isMatch ? 1 : 0.25}
              >
                <rect
                  x={booth.x}
                  y={booth.y}
                  width={booth.width}
                  height={booth.height}
                  className={`${statusBg} shadow-xs`}
                  rx="8"
                />
                <rect
                  x={booth.x}
                  y={booth.y}
                  width={booth.width}
                  height={booth.height}
                  fill="none"
                  className={statusStroke}
                  strokeWidth="2"
                  rx="8"
                />

                {/* Booth Code Header */}
                <g transform={`translate(${booth.x + 10}, ${booth.y + 12})`}>
                  <rect
                    x="0"
                    y="0"
                    width="44"
                    height="20"
                    rx="4"
                    className="fill-muted/70"
                  />
                  <text
                    x="22"
                    y="14"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    className="fill-foreground font-mono select-none"
                  >
                    {booth.code}
                  </text>
                </g>

                {/* Status Dot */}
                <g transform={`translate(${booth.x + booth.width - 12}, ${booth.y + 18})`}>
                  <circle cx="0" cy="0" r="4.5" fill={statusDotColor} />
                </g>

                {/* Booth Label / Tenant Name */}
                <text
                  x={booth.x + 10}
                  y={booth.y + 50}
                  fontSize="12"
                  fontWeight="600"
                  className="fill-foreground select-none"
                >
                  {booth.label.length > 16
                    ? `${booth.label.slice(0, 15)}...`
                    : booth.label}
                </text>

                {/* Category Subtitle */}
                <text
                  x={booth.x + 10}
                  y={booth.y + 68}
                  fontSize="10"
                  className="fill-muted-foreground select-none"
                >
                  {booth.category || booth.sizeMeters}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay at Bottom-Left */}
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg border bg-card/95 backdrop-blur-xs text-xs shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground font-medium">Terisi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground font-medium">Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span className="text-muted-foreground font-medium">Dipesan</span>
          </div>
        </div>
      </div>

      {/* Tenant / Booth Interactive Dialog Detail Modal */}
      <Dialog
        open={!!activeBooth}
        onOpenChange={(open) => !open && setActiveBooth(null)}
      >
        <DialogContent className="sm:max-w-md">
          {activeBooth && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted">
                      Stan {activeBooth.code}
                    </span>
                    <Badge
                      variant={
                        activeBooth.status === "occupied"
                          ? "default"
                          : activeBooth.status === "reserved"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {activeBooth.status === "occupied"
                        ? "Terisi"
                        : activeBooth.status === "reserved"
                        ? "Dipesan"
                        : "Tersedia"}
                    </Badge>
                  </div>
                </div>

                <DialogTitle className="text-lg font-bold mt-2">
                  {activeBooth.label}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {activeBooth.zoneName} - Ukuran {activeBooth.sizeMeters}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-xs">
                {activeBooth.status === "occupied" ? (
                  <>
                    {/* Occupied tenant details */}
                    <div className="p-3 rounded-lg border bg-muted/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Kategori Produk:</span>
                        <span className="font-medium text-foreground">
                          {activeBooth.category || "Kuliner & Jajanan"}
                        </span>
                      </div>
                      {activeBooth.rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Rating Tenant:</span>
                          <span className="font-semibold text-amber-500 flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            {activeBooth.rating} / 5.0
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status Operasional:</span>
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" />
                          Buka & Siap Melayani
                        </span>
                      </div>
                    </div>

                    {activeBooth.description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {activeBooth.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        type="button"
                        className="w-full gap-1.5 text-xs font-semibold"
                        onClick={() => setActiveBooth(null)}
                      >
                        <ShoppingBag className="size-3.5" />
                        <span>Lihat Menu & Pesan Produk</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Available / Reserved booth details */}
                    <div className="p-3 rounded-lg border bg-muted/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status Stan:</span>
                        <span className="font-medium text-primary">
                          {activeBooth.status === "reserved"
                            ? "Sudah dipesan (Menunggu pelunasan)"
                            : "Tersedia untuk disewa pedagang UMKM"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Harga Sewa:</span>
                        <span className="font-bold text-foreground font-mono text-sm">
                          {activeBooth.priceMonthly > 0
                            ? `${formatRupiah(activeBooth.priceMonthly)} / bulan`
                            : "Harga belum diisi"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Dimensi Fisik:</span>
                        <span className="font-medium text-foreground">
                          {activeBooth.sizeMeters}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Stan ini siap disewakan kepada penjual bazaar. Asosiasi dapat menghubungkan pedagang baru melalui menu Registrasi Pedagang.
                    </p>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        type="button"
                        variant="default"
                        className="w-full text-xs font-semibold"
                        onClick={() => setActiveBooth(null)}
                      >
                        Tutup Informasi Stan
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

