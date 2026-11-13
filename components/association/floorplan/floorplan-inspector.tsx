"use client";

import React from "react";
import {
  FloorplanData,
  FloorplanBooth,
  FloorplanZoneArea,
  FloorplanDoor,
  BoothStatus,
} from "@/types/floorplan";
import { AreaZone, AssociationTenant } from "@/types/association";
import { formatRupiah, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  Layers,
  DoorOpen,
  LogIn,
  LogOut,
  RotateCw,
  Copy,
  Trash2,
  TrendingUp,
  Coins,
  CheckCircle2,
  Clock,
  CircleDot,
  Building2,
} from "lucide-react";

interface FloorplanInspectorProps {
  data: FloorplanData;
  selectedId: string | null;
  selectedType: "booth" | "zone" | "door" | null;
  onSelect: (id: string | null, type: "booth" | "zone" | "door" | null) => void;
  onUpdateBooth: (id: string, updates: Partial<FloorplanBooth>) => void;
  onUpdateZone: (id: string, updates: Partial<FloorplanZoneArea>) => void;
  onUpdateDoor: (id: string, updates: Partial<FloorplanDoor>) => void;
  onDeleteBooth: (id: string) => void;
  onDeleteZone: (id: string) => void;
  onDeleteDoor: (id: string) => void;
  onDuplicateBooth: (id: string) => void;
  onRotateBooth: (id: string) => void;
  onUpdateCanvasSettings: (settings: {
    title?: string;
    areaName?: string;
    width?: number;
    height?: number;
    gridSize?: number;
  }) => void;
  associationTenants?: AssociationTenant[];
  associationZones?: AreaZone[];
}

export function FloorplanInspector({
  data,
  selectedId,
  selectedType,
  onSelect,
  onUpdateBooth,
  onUpdateZone,
  onUpdateDoor,
  onDeleteBooth,
  onDeleteZone,
  onDeleteDoor,
  onDuplicateBooth,
  onRotateBooth,
  onUpdateCanvasSettings,
  associationTenants = [],
  associationZones = [],
}: FloorplanInspectorProps) {
  const selectedBooth =
    selectedType === "booth"
      ? data.booths.find((b) => b.id === selectedId) || null
      : null;

  const selectedZone =
    selectedType === "zone"
      ? data.zones.find((z) => z.id === selectedId) || null
      : null;

  const selectedDoor =
    selectedType === "door"
      ? (data.doors || []).find((d) => d.id === selectedId) || null
      : null;

  // Global metrics when nothing is selected
  const totalBooths = data.booths.length;
  const occupiedCount = data.booths.filter((b) => b.status === "occupied").length;
  const availableCount = data.booths.filter((b) => b.status === "available").length;
  const reservedCount = data.booths.filter((b) => b.status === "reserved").length;
  const occupancyRate =
    totalBooths > 0 ? Math.round((occupiedCount / totalBooths) * 100) : 0;
  const totalPotentialRevenue = data.booths.reduce(
    (sum, b) => sum + (b.priceMonthly || 0),
    0
  );

  // 1. Panel when a Booth is selected
  if (selectedBooth) {
    return (
      <Card className="h-full border bg-card shadow-xs flex flex-col overflow-hidden">
        <CardHeader className="p-4 border-b pb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Store className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 font-mono">
                  Stan {selectedBooth.code}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                  {selectedBooth.label}
                </p>
              </div>
            </div>

            <Badge
              variant={
                selectedBooth.status === "occupied"
                  ? "default"
                  : selectedBooth.status === "reserved"
                  ? "secondary"
                  : "outline"
              }
              className="text-[10px] font-medium capitalize"
            >
              {selectedBooth.status === "occupied"
                ? "Terisi"
                : selectedBooth.status === "reserved"
                ? "Dipesan"
                : "Tersedia"}
            </Badge>
          </div>

          {/* Quick Transform Actions */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRotateBooth(selectedBooth.id)}
              className="h-7 text-xs gap-1 px-2"
              title="Putar 90 Derajat"
            >
              <RotateCw className="size-3" />
              <span>Putar</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDuplicateBooth(selectedBooth.id)}
              className="h-7 text-xs gap-1 px-2"
              title="Gandakan Stan"
            >
              <Copy className="size-3" />
              <span>Duplikat</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDeleteBooth(selectedBooth.id)}
              className="h-7 text-xs gap-1 px-2 text-destructive hover:bg-destructive/10"
              title="Hapus Stan"
            >
              <Trash2 className="size-3" />
              <span>Hapus</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs overflow-y-auto max-h-[500px]">
          {/* Booth Code & Name */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px]">Kode Stan</Label>
              <Input
                value={selectedBooth.code}
                onChange={(e) =>
                  onUpdateBooth(selectedBooth.id, { code: e.target.value.toUpperCase() })
                }
                className="h-8 text-xs font-mono"
                placeholder="A-01"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Ukuran Standar</Label>
              <Input
                value={selectedBooth.sizeMeters}
                onChange={(e) =>
                  onUpdateBooth(selectedBooth.id, { sizeMeters: e.target.value })
                }
                className="h-8 text-xs"
                placeholder="3x3 m"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px]">Nama Stan / Usaha</Label>
            <Input
              value={selectedBooth.label}
              onChange={(e) =>
                onUpdateBooth(selectedBooth.id, { label: e.target.value })
              }
              className="h-8 text-xs"
              placeholder="Contoh: Kopi Kenangan Senja"
            />
          </div>

          {/* Status Selection */}
          <div className="space-y-1">
            <Label className="text-[11px]">Status Ketersediaan</Label>
            <Select
              value={selectedBooth.status}
              onValueChange={(val) => {
                if (val) {
                  onUpdateBooth(selectedBooth.id, { status: val as BoothStatus });
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Tersedia (Bisa Disewa)</SelectItem>
                <SelectItem value="occupied">Terisi (Aktif Berjualan)</SelectItem>
                <SelectItem value="reserved">Dipesan (Dalam Proses Sewa)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Zone Assignment */}
          <div className="space-y-1">
            <Label className="text-[11px]">Penetapan Zona</Label>
            <Select
              value={selectedBooth.zoneCode}
              onValueChange={(val) => {
                if (val) {
                  const targetZone = data.zones.find((z) => z.code === val);
                  onUpdateBooth(selectedBooth.id, {
                    zoneCode: val,
                    zoneName: targetZone ? targetZone.name : val,
                  });
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Pilih Zona..." />
              </SelectTrigger>
              <SelectContent>
                {data.zones.map((z) => (
                  <SelectItem key={z.id} value={z.code}>
                    {z.name} ({z.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tenant Assignment (If occupied or reserved) */}
          <div className="space-y-1">
            <Label className="text-[11px]">Nama Tenant / Pedagang Terhubung</Label>
            <Input
              value={selectedBooth.tenantName || ""}
              onChange={(e) =>
                onUpdateBooth(selectedBooth.id, {
                  tenantName: e.target.value,
                  tenantId: e.target.value ? `t-${Date.now()}` : undefined,
                })
              }
              className="h-8 text-xs"
              placeholder="Nama pedagang atau UMKM"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label className="text-[11px]">Kategori Produk</Label>
            <Input
              value={selectedBooth.category || ""}
              onChange={(e) =>
                onUpdateBooth(selectedBooth.id, { category: e.target.value })
              }
              className="h-8 text-xs"
              placeholder="Contoh: Kuliner, Minuman, Fashion"
            />
          </div>

          {/* Monthly Price */}
          <div className="space-y-1">
            <Label className="text-[11px]">Harga Sewa Bulanan (Rp)</Label>
            <Input
              type="number"
              value={selectedBooth.priceMonthly || 0}
              onChange={(e) =>
                onUpdateBooth(selectedBooth.id, {
                  priceMonthly: Number(e.target.value) || 0,
                })
              }
              className="h-8 text-xs"
              placeholder="3500000"
            />
            <p className="text-[10px] text-muted-foreground font-medium">
              {formatRupiah(selectedBooth.priceMonthly || 0)} / bulan
            </p>
          </div>

          {/* Coordinate & Dimensions */}
          <div className="pt-2 border-t space-y-2">
            <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              Dimensi & Posisi Kanvas
            </Label>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Lebar (px)</span>
                <Input
                  type="number"
                  value={selectedBooth.width}
                  onChange={(e) =>
                    onUpdateBooth(selectedBooth.id, {
                      width: Math.max(40, Number(e.target.value) || 40),
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Tinggi (px)</span>
                <Input
                  type="number"
                  value={selectedBooth.height}
                  onChange={(e) =>
                    onUpdateBooth(selectedBooth.id, {
                      height: Math.max(40, Number(e.target.value) || 40),
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Posisi X</span>
                <Input
                  type="number"
                  value={selectedBooth.x}
                  onChange={(e) =>
                    onUpdateBooth(selectedBooth.id, {
                      x: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Posisi Y</span>
                <Input
                  type="number"
                  value={selectedBooth.y}
                  onChange={(e) =>
                    onUpdateBooth(selectedBooth.id, {
                      y: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. Panel when a Zone Boundary Area is selected
  if (selectedZone) {
    return (
      <Card className="h-full border bg-card shadow-xs flex flex-col overflow-hidden">
        <CardHeader className="p-4 border-b pb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
                <Layers className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold truncate max-w-[170px]">
                  {selectedZone.name}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Kode: {selectedZone.code}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDeleteZone(selectedZone.id)}
              className="h-7 text-xs gap-1 px-2 text-destructive hover:bg-destructive/10"
              title="Hapus Zona"
            >
              <Trash2 className="size-3" />
              <span>Hapus</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs overflow-y-auto max-h-[500px]">
          <div className="space-y-1">
            <Label className="text-[11px]">Nama Zona</Label>
            <Input
              value={selectedZone.name}
              onChange={(e) =>
                onUpdateZone(selectedZone.id, { name: e.target.value })
              }
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px]">Kode Zona</Label>
            <Input
              value={selectedZone.code}
              onChange={(e) =>
                onUpdateZone(selectedZone.id, { code: e.target.value.toUpperCase() })
              }
              className="h-8 text-xs font-mono"
            />
          </div>

          {/* Zone Dimensions */}
          <div className="pt-2 border-t space-y-2">
            <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              Dimensi Zona
            </Label>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Lebar (px)</span>
                <Input
                  type="number"
                  value={selectedZone.width}
                  onChange={(e) =>
                    onUpdateZone(selectedZone.id, {
                      width: Math.max(100, Number(e.target.value) || 100),
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Tinggi (px)</span>
                <Input
                  type="number"
                  value={selectedZone.height}
                  onChange={(e) =>
                    onUpdateZone(selectedZone.id, {
                      height: Math.max(100, Number(e.target.value) || 100),
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. Panel when a Door / Gate is selected
  if (selectedDoor) {
    const isExit = selectedDoor.type === "exit";
    const isBoth = selectedDoor.type === "both";

    return (
      <Card className="h-full border bg-card shadow-xs flex flex-col overflow-hidden">
        <CardHeader className="p-4 border-b pb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0",
                  isExit
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : isBoth
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "bg-[#c85a32]/10 text-[#c85a32]"
                )}
              >
                {isExit ? (
                  <LogOut className="size-4" />
                ) : isBoth ? (
                  <DoorOpen className="size-4" />
                ) : (
                  <LogIn className="size-4" />
                )}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold truncate max-w-[160px]">
                  {selectedDoor.label}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 mt-0.5",
                    isExit
                      ? "text-emerald-600 border-emerald-500/30"
                      : isBoth
                      ? "text-indigo-600 border-indigo-500/30"
                      : "text-[#c85a32] border-[#c85a32]/30"
                  )}
                >
                  {isExit
                    ? "Pintu Keluar"
                    : isBoth
                    ? "Masuk & Keluar"
                    : "Pintu Masuk"}
                </Badge>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDeleteDoor(selectedDoor.id)}
              className="h-7 text-xs gap-1 px-2 text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Hapus Pintu"
            >
              <Trash2 className="size-3" />
              <span>Hapus</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs overflow-y-auto max-h-[500px]">
          {/* Label Name */}
          <div className="space-y-1">
            <Label className="text-[11px]">Nama / Label Pintu</Label>
            <Input
              value={selectedDoor.label}
              onChange={(e) =>
                onUpdateDoor(selectedDoor.id, { label: e.target.value })
              }
              className="h-8 text-xs"
              placeholder="Contoh: Pintu Masuk Utama dan Kasir Bazaar"
            />
          </div>

          {/* Type Selector */}
          <div className="space-y-1">
            <Label className="text-[11px]">Tipe Akses Gerbang</Label>
            <Select
              value={selectedDoor.type}
              onValueChange={(val) => {
                if (val) {
                  onUpdateDoor(selectedDoor.id, {
                    type: val as "entrance" | "exit" | "both",
                  });
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Pilih Tipe Pintu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrance">Pintu Masuk (Entrance)</SelectItem>
                <SelectItem value="exit">Pintu Keluar (Exit)</SelectItem>
                <SelectItem value="both">Pintu Masuk & Keluar (Dua Arah)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position & Dimensions */}
          <div className="space-y-1 pt-1 border-t">
            <Label className="text-[11px] font-semibold text-muted-foreground">
              Posisi & Dimensi Kanvas
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <span className="text-[10px] text-muted-foreground">Posisi X (px)</span>
                <Input
                  type="number"
                  value={selectedDoor.x}
                  onChange={(e) =>
                    onUpdateDoor(selectedDoor.id, { x: Number(e.target.value) || 0 })
                  }
                  className="h-7 text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Posisi Y (px)</span>
                <Input
                  type="number"
                  value={selectedDoor.y}
                  onChange={(e) =>
                    onUpdateDoor(selectedDoor.id, { y: Number(e.target.value) || 0 })
                  }
                  className="h-7 text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Lebar (px)</span>
                <Input
                  type="number"
                  value={selectedDoor.width}
                  onChange={(e) =>
                    onUpdateDoor(selectedDoor.id, {
                      width: Math.max(60, Number(e.target.value) || 60),
                    })
                  }
                  className="h-7 text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Tinggi (px)</span>
                <Input
                  type="number"
                  value={selectedDoor.height}
                  onChange={(e) =>
                    onUpdateDoor(selectedDoor.id, {
                      height: Math.max(20, Number(e.target.value) || 20),
                    })
                  }
                  className="h-7 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 4. Panel when nothing is selected (Overview & Quick Layers Jump)
  return (
    <div className="flex flex-col gap-4">
      {/* Metric Summary Card */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Ringkasan Denah Stan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg border bg-muted/40">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Store className="size-3.5 text-primary" />
                <span>Total Stan</span>
              </div>
              <p className="text-lg font-bold text-foreground mt-0.5">{totalBooths}</p>
            </div>

            <div className="p-2.5 rounded-lg border bg-muted/40">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <TrendingUp className="size-3.5 text-emerald-500" />
                <span>Okupansi</span>
              </div>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {occupancyRate}%
              </p>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] pt-1">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              <span>Terisi: {occupiedCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary">
              <CircleDot className="size-3.5" />
              <span>Tersedia: {availableCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" />
              <span>Dipesan: {reservedCount}</span>
            </div>
          </div>

          {totalPotentialRevenue > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Potensi Omzet Sewa:</span>
                <span className="font-semibold text-foreground font-mono">
                  {formatRupiah(totalPotentialRevenue)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Layer List / Quick Element Selection */}
      <Card className="border bg-card shadow-xs flex flex-col flex-1 max-h-[380px]">
        <CardHeader className="p-3.5 border-b pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Daftar Stan di Denah ({data.booths.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-2 overflow-y-auto space-y-1">
          {data.booths.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Belum ada stan di denah.
            </p>
          ) : (
            data.booths.map((booth) => (
              <button
                key={booth.id}
                type="button"
                onClick={() => onSelect(booth.id, "booth")}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted/80 text-left transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-2 rounded-full shrink-0 bg-primary" />
                  <span className="text-xs font-mono font-bold text-foreground">
                    {booth.code}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[110px]">
                    {booth.label}
                  </span>
                </div>
                <Badge
                  variant={
                    booth.status === "occupied"
                      ? "default"
                      : booth.status === "reserved"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-[9px] px-1.5 h-4 shrink-0 font-normal"
                >
                  {booth.status === "occupied"
                    ? "Terisi"
                    : booth.status === "reserved"
                    ? "Dipesan"
                    : "Tersedia"}
                </Badge>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Door Layers */}
      {data.doors && data.doors.length > 0 && (
        <Card className="border bg-card shadow-xs flex flex-col">
          <CardHeader className="p-3.5 border-b pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Akses Pintu Masuk / Keluar ({data.doors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {data.doors.map((door) => (
              <button
                key={door.id}
                type="button"
                onClick={() => onSelect(door.id, "door")}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted/80 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "size-2 rounded-full shrink-0",
                      door.type === "exit"
                        ? "bg-emerald-500"
                        : door.type === "both"
                        ? "bg-indigo-500"
                        : "bg-[#c85a32]"
                    )}
                  />
                  <span className="text-xs text-foreground truncate max-w-[140px] font-medium">
                    {door.label}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] px-1.5 h-4 shrink-0 font-normal",
                    door.type === "exit"
                      ? "text-emerald-600 border-emerald-500/30"
                      : door.type === "both"
                      ? "text-indigo-600 border-indigo-500/30"
                      : "text-[#c85a32] border-[#c85a32]/30"
                  )}
                >
                  {door.type === "exit"
                    ? "Keluar"
                    : door.type === "both"
                    ? "Dua Arah"
                    : "Masuk"}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
