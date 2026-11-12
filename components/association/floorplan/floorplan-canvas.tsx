"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  FloorplanData,
  FloorplanBooth,
  FloorplanZoneArea,
  EditorTool,
  EditorMode,
} from "@/types/floorplan";
import { snapCoord } from "./floorplan-data";
import { Store, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloorplanCanvasProps {
  data: FloorplanData;
  mode: EditorMode;
  activeTool: EditorTool;
  selectedId: string | null;
  selectedType: "booth" | "zone" | null;
  onSelect: (id: string | null, type: "booth" | "zone" | null) => void;
  onUpdateBooth: (id: string, updates: Partial<FloorplanBooth>) => void;
  onUpdateZone: (id: string, updates: Partial<FloorplanZoneArea>) => void;
  onAddBooth: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  pan: { x: number; y: number };
  onPanChange: (newPan: { x: number; y: number }) => void;
  showGrid: boolean;
  onCommitHistory: () => void;
}

type DragState =
  | {
      type: "drag-booth";
      id: string;
      startX: number;
      startY: number;
      elemStartX: number;
      elemStartY: number;
    }
  | {
      type: "resize-booth";
      id: string;
      handle: "nw" | "ne" | "sw" | "se";
      startX: number;
      startY: number;
      elemStartX: number;
      elemStartY: number;
      elemStartWidth: number;
      elemStartHeight: number;
    }
  | {
      type: "drag-zone";
      id: string;
      startX: number;
      startY: number;
      elemStartX: number;
      elemStartY: number;
    }
  | {
      type: "pan";
      startX: number;
      startY: number;
      panStartX: number;
      panStartY: number;
    }
  | null;

export function FloorplanCanvas({
  data,
  mode,
  activeTool,
  selectedId,
  selectedType,
  onSelect,
  onUpdateBooth,
  onUpdateZone,
  onAddBooth,
  zoom,
  onZoomChange,
  pan,
  onPanChange,
  showGrid,
  onCommitHistory,
}: FloorplanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Keyboard listeners for space bar panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSpacePressed && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSpacePressed]);

  // Convert client mouse coordinates to canvas SVG space
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (clientX - rect.left - pan.x) / zoom;
      const rawY = (clientY - rect.top - pan.y) / zoom;
      return { x: rawX, y: rawY };
    },
    [pan.x, pan.y, zoom]
  );

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(2.0, Math.max(0.4, Number((zoom * zoomFactor).toFixed(2))));
    onZoomChange(newZoom);
  };

  // Background pointer down (Pan or Deselect)
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || activeTool === "pan" || isSpacePressed) {
      // Middle click or pan tool
      e.preventDefault();
      setDragState({
        type: "pan",
        startX: e.clientX,
        startY: e.clientY,
        panStartX: pan.x,
        panStartY: pan.y,
      });
      return;
    }

    if (e.button === 0 && activeTool === "select") {
      onSelect(null, null);
    }
  };

  // Booth mouse down
  const handleBoothMouseDown = (e: React.MouseEvent, booth: FloorplanBooth) => {
    if (mode === "preview" || activeTool === "pan" || isSpacePressed) return;
    e.stopPropagation();

    onSelect(booth.id, "booth");

    if (activeTool === "select" && e.button === 0) {
      setDragState({
        type: "drag-booth",
        id: booth.id,
        startX: e.clientX,
        startY: e.clientY,
        elemStartX: booth.x,
        elemStartY: booth.y,
      });
    }
  };

  // Zone area mouse down
  const handleZoneMouseDown = (e: React.MouseEvent, zone: FloorplanZoneArea) => {
    if (mode === "preview" || activeTool === "pan" || isSpacePressed) return;
    e.stopPropagation();

    onSelect(zone.id, "zone");

    if (activeTool === "select" && e.button === 0) {
      setDragState({
        type: "drag-zone",
        id: zone.id,
        startX: e.clientX,
        startY: e.clientY,
        elemStartX: zone.x,
        elemStartY: zone.y,
      });
    }
  };

  // Resize handle mouse down
  const handleResizeHandleMouseDown = (
    e: React.MouseEvent,
    booth: FloorplanBooth,
    handle: "nw" | "ne" | "sw" | "se"
  ) => {
    if (mode === "preview" || activeTool !== "select") return;
    e.stopPropagation();
    setDragState({
      type: "resize-booth",
      id: booth.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      elemStartX: booth.x,
      elemStartY: booth.y,
      elemStartWidth: booth.width,
      elemStartHeight: booth.height,
    });
  };

  // Global mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState) return;

    if (dragState.type === "pan") {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      onPanChange({
        x: dragState.panStartX + dx,
        y: dragState.panStartY + dy,
      });
      return;
    }

    const dx = (e.clientX - dragState.startX) / zoom;
    const dy = (e.clientY - dragState.startY) / zoom;

    if (dragState.type === "drag-booth") {
      const newX = Math.max(
        0,
        Math.min(
          data.dimensions.width - 60,
          snapCoord(dragState.elemStartX + dx, data.gridSize, data.snapToGrid)
        )
      );
      const newY = Math.max(
        0,
        Math.min(
          data.dimensions.height - 60,
          snapCoord(dragState.elemStartY + dy, data.gridSize, data.snapToGrid)
        )
      );
      onUpdateBooth(dragState.id, { x: newX, y: newY });
      return;
    }

    if (dragState.type === "drag-zone") {
      const newX = Math.max(
        0,
        Math.min(
          data.dimensions.width - 100,
          snapCoord(dragState.elemStartX + dx, data.gridSize, data.snapToGrid)
        )
      );
      const newY = Math.max(
        0,
        Math.min(
          data.dimensions.height - 100,
          snapCoord(dragState.elemStartY + dy, data.gridSize, data.snapToGrid)
        )
      );
      onUpdateZone(dragState.id, { x: newX, y: newY });
      return;
    }

    if (dragState.type === "resize-booth") {
      const minDimension = 60;
      if (dragState.handle === "se") {
        const newWidth = Math.max(
          minDimension,
          snapCoord(dragState.elemStartWidth + dx, data.gridSize, data.snapToGrid)
        );
        const newHeight = Math.max(
          minDimension,
          snapCoord(dragState.elemStartHeight + dy, data.gridSize, data.snapToGrid)
        );
        onUpdateBooth(dragState.id, { width: newWidth, height: newHeight });
      }
    }
  };

  // Global mouse up
  const handleMouseUp = () => {
    if (dragState) {
      if (dragState.type !== "pan") {
        onCommitHistory();
      }
      setDragState(null);
    }
  };

  const selectedBooth =
    selectedType === "booth"
      ? data.booths.find((b) => b.id === selectedId) || null
      : null;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleBackgroundMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-[580px] lg:h-[640px] rounded-xl border bg-card overflow-hidden select-none touch-none ${
        activeTool === "pan" || isSpacePressed
          ? dragState?.type === "pan"
            ? "cursor-grabbing"
            : "cursor-grab"
          : "cursor-default"
      }`}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full block"
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern
            id="floorplan-grid-pattern"
            width={data.gridSize}
            height={data.gridSize}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={data.gridSize / 2}
              cy={data.gridSize / 2}
              r="1"
              className="fill-foreground/15"
            />
          </pattern>
        </defs>

        {/* Scaled & Panned Canvas Viewport */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Canvas Bound Plate */}
          <rect
            x={0}
            y={0}
            width={data.dimensions.width}
            height={data.dimensions.height}
            className="fill-background"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.35"
            rx="12"
          />

          {/* Grid Background */}
          {showGrid && (
            <rect
              x={0}
              y={0}
              width={data.dimensions.width}
              height={data.dimensions.height}
              fill="url(#floorplan-grid-pattern)"
              rx="12"
              pointerEvents="none"
            />
          )}

          {/* Layer 1: Zone Boundary Areas */}
          {data.zones.map((zone) => {
            const isSelected = selectedType === "zone" && selectedId === zone.id;
            return (
              <g
                key={zone.id}
                onMouseDown={(e) => handleZoneMouseDown(e, zone)}
                className="cursor-pointer"
              >
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  fill={zone.color}
                  stroke={isSelected ? "#ea580c" : zone.borderColor}
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  strokeDasharray="6 4"
                  rx="10"
                />

                {/* Zone Label Badge on Top-Left */}
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
            );
          })}

          {/* Layer 2: Bazaar Booths */}
          {data.booths.map((booth) => {
            const isSelected = selectedType === "booth" && selectedId === booth.id;
            const isOccupied = booth.status === "occupied";
            const isReserved = booth.status === "reserved";

            // Status Styling Tokens
            const statusBg = isOccupied
              ? "fill-card"
              : isReserved
              ? "fill-amber-500/5 dark:fill-amber-500/10"
              : "fill-primary/5 dark:fill-primary/10";

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

            const statusText = isOccupied
              ? "Terisi"
              : isReserved
              ? "Dipesan"
              : "Tersedia";

            return (
              <g
                key={booth.id}
                onMouseDown={(e) => handleBoothMouseDown(e, booth)}
                transform={`rotate(${booth.rotation}, ${booth.x + booth.width / 2}, ${
                  booth.y + booth.height / 2
                })`}
                className={`transition-shadow ${
                  activeTool === "select" && mode === "design"
                    ? "cursor-move"
                    : "cursor-pointer"
                }`}
              >
                {/* Booth Body Rectangle */}
                <rect
                  x={booth.x}
                  y={booth.y}
                  width={booth.width}
                  height={booth.height}
                  className={`${statusBg} shadow-xs`}
                  stroke={isSelected ? "#ea580c" : undefined}
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  rx="8"
                />

                {/* If not selected, render its status border */}
                {!isSelected && (
                  <rect
                    x={booth.x}
                    y={booth.y}
                    width={booth.width}
                    height={booth.height}
                    fill="none"
                    className={statusStroke}
                    strokeWidth="1.5"
                    rx="8"
                  />
                )}

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

                {/* Status Dot & Label (Top Right) */}
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

                {/* Tenant / Category Subtitle */}
                <text
                  x={booth.x + 10}
                  y={booth.y + 68}
                  fontSize="10"
                  className="fill-muted-foreground select-none"
                >
                  {isOccupied && booth.tenantName
                    ? booth.category || "Tenant Terdaftar"
                    : `${booth.sizeMeters} - ${statusText}`}
                </text>

                {/* Bottom Border Accent Indicator */}
                <rect
                  x={booth.x + 1}
                  y={booth.y + booth.height - 4}
                  width={booth.width - 2}
                  height="3"
                  rx="1.5"
                  fill={statusDotColor}
                  opacity="0.8"
                />

                {/* Selection Outline & Resize Handle (Design Mode only) */}
                {isSelected && mode === "design" && (
                  <g pointerEvents="all">
                    {/* Corner resize handle (SE) */}
                    <rect
                      x={booth.x + booth.width - 8}
                      y={booth.y + booth.height - 8}
                      width="16"
                      height="16"
                      rx="3"
                      className="fill-primary stroke-background cursor-se-resize"
                      strokeWidth="2"
                      onMouseDown={(e) =>
                        handleResizeHandleMouseDown(e, booth, "se")
                      }
                    />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Empty State Overlay if canvas has 0 booths */}
      {data.booths.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-xs p-6 text-center">
          <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Store className="size-6" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">
            Belum ada stan di denah ini
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
            Mulai rancang tata letak dengan menambahkan stan bazaar pertama Anda ke kanvas.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={onAddBooth}
            className="gap-1.5 text-xs font-medium"
          >
            <Plus className="size-3.5" />
            <span>Tambah Stan Pertama</span>
          </Button>
        </div>
      )}

      {/* Canvas Info HUD Bar (Bottom Right) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-md border bg-card/90 backdrop-blur-xs text-[11px] font-mono text-muted-foreground shadow-xs select-none">
        <span>
          Dimensi: {data.dimensions.width} x {data.dimensions.height} px
        </span>
        <span className="text-border">|</span>
        <span>Grid: {data.gridSize}px</span>
        {selectedBooth && (
          <>
            <span className="text-border">|</span>
            <span className="text-foreground font-semibold">
              {selectedBooth.code} ({selectedBooth.x}, {selectedBooth.y})
            </span>
          </>
        )}
      </div>
    </div>
  );
}

