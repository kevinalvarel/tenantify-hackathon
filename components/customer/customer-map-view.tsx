"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Navigation,
  Search,
  Store,
  Star,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  Layers,
  ShoppingBag,
  X,
} from "lucide-react";
import { useCustomer } from "@/context/customer-context";
import { getCustomerFloorplanAction } from "@/servers/customer-server";
import { floorplanFromAssociation } from "@/components/association/floorplan/floorplan-sync";
import {
  DEFAULT_FLOORPLAN_DATA,
  DEFAULT_DOORS,
} from "@/components/association/floorplan/floorplan-data";
import type {
  FloorplanData,
  FloorplanBooth,
  FloorplanZoneArea,
  FloorplanDoor,
} from "@/types/floorplan";
import type { AreaZone, BoothSlot } from "@/types/association";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function CustomerMapView() {
  const router = useRouter();
  const { tenants, setSelectedCategory } = useCustomer();

  const [floorplan, setFloorplan] = useState<FloorplanData>(
    DEFAULT_FLOORPLAN_DATA,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("all");

  // Active Booth for Detail Dialog
  const [activeBooth, setActiveBooth] = useState<FloorplanBooth | null>(null);

  // Pan & Zoom Canvas State
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Fetch live floorplan data from database and sync with Association
  useEffect(() => {
    let isMounted = true;

    async function loadFloorplan() {
      try {
        const { zones, booths } = await getCustomerFloorplanAction();
        if (!isMounted) return;

        let customDoors: FloorplanDoor[] | undefined;
        try {
          const raw = localStorage.getItem("tenantify_floorplan_doors");
          if (raw) customDoors = JSON.parse(raw);
        } catch {}

        if (zones.length > 0 && booths.length > 0) {
          const mapped = floorplanFromAssociation(zones, booths, customDoors);
          setFloorplan({
            ...DEFAULT_FLOORPLAN_DATA,
            zones: mapped.zones,
            booths: mapped.booths,
            doors: mapped.doors,
          });
        } else {
          // Fallback to default association template
          setFloorplan({
            ...DEFAULT_FLOORPLAN_DATA,
            doors:
              customDoors && customDoors.length > 0
                ? customDoors
                : DEFAULT_FLOORPLAN_DATA.doors,
          });
        }
      } catch (err) {
        console.error("Gagal memuat denah bazaar:", err);
        if (isMounted) setFloorplan(DEFAULT_FLOORPLAN_DATA);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadFloorplan();
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge live tenant data into booths (rating, isOpen, category)
  const enrichedBooths = useMemo(() => {
    const tenantMap = new Map(tenants.map((t) => [t.id, t]));
    const nameMap = new Map(tenants.map((t) => [t.name.toLowerCase(), t]));

    return floorplan.booths.map((booth) => {
      const match =
        (booth.tenantId && tenantMap.get(booth.tenantId)) ||
        (booth.tenantName && nameMap.get(booth.tenantName.toLowerCase()));

      if (!match) return booth;

      return {
        ...booth,
        tenantId: match.id,
        tenantName: match.name,
        category: match.category || booth.category,
        rating: match.rating || booth.rating || 4.8,
        status: match.isOpen ? ("occupied" as const) : booth.status,
      };
    });
  }, [floorplan.booths, tenants]);

  // Filter booths based on search query and zone
  const filteredBooths = useMemo(() => {
    return enrichedBooths.filter((b) => {
      const matchZone = selectedZone === "all" || b.zoneCode === selectedZone;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.code.toLowerCase().includes(q) ||
        b.label.toLowerCase().includes(q) ||
        (b.tenantName && b.tenantName.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q));

      return matchZone && matchSearch;
    });
  }, [enrichedBooths, selectedZone, searchQuery]);

  // Pan / Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary pointer button
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () =>
    setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)));
  const handleZoomOut = () =>
    setZoom((z) => Math.max(0.45, +(z - 0.15).toFixed(2)));
  const handleResetView = () => {
    setZoom(0.85);
    setPan({ x: 0, y: 0 });
  };

  const handleNavigateToMenu = (tenantId?: string) => {
    if (tenantId) {
      router.push(`/?tenant=${tenantId}#customer-product-explorer`);
    } else {
      router.push("/#customer-product-explorer");
    }
    setActiveBooth(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-24 md:pb-12 min-w-0">
      {/* 1. Header Information Banner */}
      <section
        aria-label="Informasi Denah Lokasi"
        className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-5 sm:p-6 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-[#c85a32]/10 text-[#c85a32] flex items-center justify-center font-bold">
                <Navigation className="size-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                Denah Interaktif Bazaar
              </h1>
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold"
              >
                Sinkron Asosiasi
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
              Tata letak stan real-time yang disinkronkan langsung dengan
              pengelola bazaar. Ketuk stan untuk melihat menu hidangan dan
              melakukan pemesanan.
            </p>
          </div>

          {/* Quick Legend */}
          <div className="flex items-center gap-3 text-xs bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 self-start sm:self-auto shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium text-[11px]">
                Stan Buka (
                {enrichedBooths.filter((b) => b.status === "occupied").length})
              </span>
            </div>
            <span className="text-neutral-300 dark:text-neutral-600">•</span>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#c85a32] ring-2 ring-[#c85a32]/20" />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium text-[11px]">
                Stan Tersedia
              </span>
            </div>
          </div>
        </div>

        {/* 2. Search & Zone Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari stan (contoh: A-01), nama tenant, atau menu..."
              className="pl-9 h-10 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 focus-visible:ring-[#c85a32]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                aria-label="Hapus pencarian"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Zone Filter Chips */}
          <div className="md:col-span-7 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedZone("all")}
              className={cn(
                "min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer border",
                selectedZone === "all"
                  ? "bg-[#c85a32] border-[#c85a32] text-white shadow-xs"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700",
              )}
            >
              Semua Zona
            </button>
            {floorplan.zones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => setSelectedZone(zone.code)}
                className={cn(
                  "min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer border flex items-center gap-1.5",
                  selectedZone === zone.code
                    ? "bg-[#c85a32] border-[#c85a32] text-white shadow-xs"
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700",
                )}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: zone.borderColor || "#c85a32" }}
                />
                <span className="truncate">{zone.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Interactive SVG Map Canvas Viewport */}
      <section
        aria-label="Peta Denah Interaktif"
        className="relative w-full rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/80 overflow-hidden shadow-xs select-none touch-none"
        style={{ height: "calc(100vh - 280px)", minHeight: "520px" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Floating Canvas Navigation Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-lg">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="size-9 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Perbesar Denah"
          >
            <ZoomIn className="size-4 text-neutral-700 dark:text-neutral-300" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="size-9 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Perkecil Denah"
          >
            <ZoomOut className="size-4 text-neutral-700 dark:text-neutral-300" />
          </Button>
          <div className="text-[10px] font-mono text-center text-neutral-500 dark:text-neutral-400 py-0.5 border-y border-neutral-200/60 dark:border-neutral-800">
            {Math.round(zoom * 100)}%
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleResetView}
            className="size-9 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Reset Tampilan Peta"
          >
            <RotateCcw className="size-4 text-neutral-700 dark:text-neutral-300" />
          </Button>
        </div>

        {/* Floating Pan Hint for Mobile */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-200/70 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 shadow-xs">
          <Info className="size-3.5 text-[#c85a32]" />
          <span>Geser kanvas untuk menjelajahi seluruh area denah</span>
        </div>

        {/* Main Canvas SVG */}
        <div
          className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <svg
            width={floorplan.dimensions.width}
            height={floorplan.dimensions.height}
            viewBox={`0 0 ${floorplan.dimensions.width} ${floorplan.dimensions.height}`}
            className="block"
          >
            {/* Background Floorplate */}
            <rect
              x={0}
              y={0}
              width={floorplan.dimensions.width}
              height={floorplan.dimensions.height}
              className="fill-white dark:fill-neutral-900"
              rx="16"
            />

            {/* Subtle Grid dots */}
            <defs>
              <pattern
                id="customer-map-grid"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="15"
                  cy="15"
                  r="1.2"
                  className="fill-neutral-200 dark:fill-neutral-800"
                />
              </pattern>
            </defs>
            <rect
              x={0}
              y={0}
              width={floorplan.dimensions.width}
              height={floorplan.dimensions.height}
              fill="url(#customer-map-grid)"
              rx="16"
            />

            {/* Dynamic Entrance & Exit Markers */}
            {(floorplan.doors && floorplan.doors.length > 0
              ? floorplan.doors
              : DEFAULT_DOORS
            ).map((door) => {
              const isExit = door.type === "exit";
              const isBoth = door.type === "both";
              const themeColor = isExit ? "#10b981" : isBoth ? "#6366f1" : "#c85a32";
              const strokeColor = isExit
                ? "rgba(16, 185, 129, 0.35)"
                : isBoth
                ? "rgba(99, 102, 241, 0.35)"
                : "rgba(200, 90, 50, 0.35)";
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
                    stroke={strokeColor}
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

            {/* 1. Zone Boundaries */}
            {floorplan.zones.map((zone) => (
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
                  rx="12"
                />
                {/* Zone Label Capsule */}
                <g transform={`translate(${zone.x + 14}, ${zone.y + 14})`}>
                  <rect
                    x="0"
                    y="0"
                    width={zone.name.length * 8 + 36}
                    height="26"
                    rx="8"
                    className="fill-white dark:fill-neutral-900 shadow-xs"
                    stroke={zone.borderColor}
                    strokeWidth="1.2"
                  />
                  <circle cx="13" cy="13" r="4.5" fill={zone.borderColor} />
                  <text
                    x="25"
                    y="17"
                    fontSize="11"
                    fontWeight="700"
                    className="fill-neutral-900 dark:fill-neutral-100 font-sans select-none"
                  >
                    {zone.name}
                  </text>
                </g>
              </g>
            ))}

            {/* 2. Interactive Booths */}
            {enrichedBooths.map((booth) => {
              const isMatch = filteredBooths.some((b) => b.id === booth.id);
              const isOccupied = booth.status === "occupied";
              const isSelected = activeBooth?.id === booth.id;

              const statusStroke = isSelected
                ? "#c85a32"
                : isOccupied
                  ? "#10b981"
                  : "#3b82f6";

              const statusStrokeWidth = isSelected ? "3" : "1.8";

              return (
                <g
                  key={booth.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveBooth(booth);
                  }}
                  transform={`rotate(${booth.rotation || 0}, ${
                    booth.x + booth.width / 2
                  }, ${booth.y + booth.height / 2})`}
                  className="cursor-pointer transition-all duration-150"
                  opacity={isMatch ? 1 : 0.25}
                >
                  {/* Booth Container Card */}
                  <rect
                    x={booth.x}
                    y={booth.y}
                    width={booth.width}
                    height={booth.height}
                    rx="10"
                    className="fill-white dark:fill-neutral-900 shadow-xs"
                  />
                  <rect
                    x={booth.x}
                    y={booth.y}
                    width={booth.width}
                    height={booth.height}
                    rx="10"
                    fill="none"
                    stroke={statusStroke}
                    strokeWidth={statusStrokeWidth}
                  />

                  {/* Booth Header Badge */}
                  <g transform={`translate(${booth.x + 8}, ${booth.y + 10})`}>
                    <rect
                      x="0"
                      y="0"
                      width="42"
                      height="18"
                      rx="4"
                      className="fill-neutral-100 dark:fill-neutral-800"
                    />
                    <text
                      x="21"
                      y="13"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="800"
                      className="fill-neutral-700 dark:fill-neutral-300 font-mono"
                    >
                      {booth.code}
                    </text>
                  </g>

                  {/* Status Indicator Dot */}
                  <circle
                    cx={booth.x + booth.width - 14}
                    cy={booth.y + 18}
                    r="4.5"
                    fill={isOccupied ? "#10b981" : "#3b82f6"}
                  />

                  {/* Tenant Name */}
                  <text
                    x={booth.x + 10}
                    y={booth.y + 44}
                    fontSize="11"
                    fontWeight="700"
                    className="fill-neutral-900 dark:fill-neutral-50 font-sans"
                  >
                    {booth.tenantName
                      ? booth.tenantName.length > 15
                        ? booth.tenantName.slice(0, 14) + "..."
                        : booth.tenantName
                      : booth.label}
                  </text>

                  {/* Category / Status Subtext */}
                  <text
                    x={booth.x + 10}
                    y={booth.y + 60}
                    fontSize="9.5"
                    fontWeight="500"
                    className="fill-neutral-500 dark:text-neutral-400 font-sans"
                  >
                    {booth.category
                      ? booth.category.length > 18
                        ? booth.category.slice(0, 17) + "..."
                        : booth.category
                      : isOccupied
                        ? "Buka Sekarang"
                        : "Stan Tersedia"}
                  </text>

                  {/* Rating / Action Pill */}
                  {booth.rating ? (
                    <g
                      transform={`translate(${booth.x + 10}, ${booth.y + 70})`}
                    >
                      <rect
                        x="0"
                        y="0"
                        width="46"
                        height="16"
                        rx="4"
                        className="fill-amber-500/10"
                      />
                      <text
                        x="18"
                        y="12"
                        fontSize="9"
                        fontWeight="700"
                        className="fill-amber-600 dark:fill-amber-400 font-sans"
                      >
                        ★ {booth.rating}
                      </text>
                    </g>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* 4. Active Booth Details Dialog */}
      <Dialog
        open={!!activeBooth}
        onOpenChange={(open) => {
          if (!open) setActiveBooth(null);
        }}
      >
        <DialogContent className="max-w-md p-6 rounded-2xl bg-white dark:bg-neutral-900">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-[#c85a32]/10 text-[#c85a32] px-2 py-0.5 rounded-md">
                Stan {activeBooth?.code}
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {activeBooth?.zoneName || "Area Bazaar"}
              </span>
            </div>
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {activeBooth?.tenantName || activeBooth?.label || "Stan Bazaar"}
            </DialogTitle>
          </DialogHeader>

          {activeBooth && (
            <div className="space-y-4 pt-1">
              {/* Category and Status Card */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Kategori Hidangan
                  </span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {activeBooth.category || "Makanan dan Minuman"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Status Stan
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold gap-1",
                      activeBooth.status === "occupied"
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                        : "border-primary/30 text-primary bg-primary/10",
                    )}
                  >
                    <CheckCircle2 className="size-3" />
                    {activeBooth.status === "occupied"
                      ? "Buka dan Melayani Pesanan"
                      : "Tersedia"}
                  </Badge>
                </div>

                {activeBooth.sizeMeters && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Dimensi Booth
                    </span>
                    <span className="font-mono text-neutral-700 dark:text-neutral-300">
                      {activeBooth.sizeMeters}
                    </span>
                  </div>
                )}

                {activeBooth.rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Rating Pengunjung
                    </span>
                    <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      <span>{activeBooth.rating} / 5.0</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {activeBooth.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {activeBooth.description}
                </p>
              )}

              {/* Action Buttons */}
              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveBooth(null)}
                  className="min-h-[44px] h-10 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Tutup
                </Button>

                <Button
                  type="button"
                  onClick={() => handleNavigateToMenu(activeBooth.tenantId)}
                  className="min-h-[44px] h-10 rounded-xl bg-[#c85a32] hover:bg-[#b04f2c] text-white text-xs font-semibold cursor-pointer shadow-xs gap-1.5"
                >
                  <ShoppingBag className="size-3.5" />
                  <span>Lihat Menu dan Pesan</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
