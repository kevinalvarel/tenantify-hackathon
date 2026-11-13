"use client";

import React, { useRef } from "react";
import {
  MousePointer,
  Hand,
  Store,
  Layers,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Magnet,
  Save,
  Download,
  Upload,
  Eye,
  Pencil,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditorMode, EditorTool } from "@/types/floorplan";
import { TEMPLATES_LIST } from "./floorplan-data";
import { toast } from "sonner";

interface FloorplanToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onFitView: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  onAddBooth: () => void;
  onAddZone: () => void;
  onSave: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onSelectTemplate: (templateId: string) => void;
  hasUnsavedChanges: boolean;
}

export function FloorplanToolbar({
  mode,
  onModeChange,
  activeTool,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  onFitView,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  onAddBooth,
  onAddZone,
  onSave,
  onExportJSON,
  onImportJSON,
  onSelectTemplate,
  hasUnsavedChanges,
}: FloorplanToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".json")) {
        toast.error("Format berkas harus berupa .json");
        return;
      }
      onImportJSON(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <TooltipProvider delay={200}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-hidden="true"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl border bg-card text-card-foreground shadow-xs">
        {/* Left: Mode switcher and editing tools */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Mode Switcher */}
          <div className="inline-flex items-center rounded-lg border bg-muted/50 p-1">
            <Button
              type="button"
              variant={mode === "design" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange("design")}
              className="h-8 gap-1.5 text-xs font-medium px-3"
            >
              <Pencil className="size-3.5" />
              <span>Desain</span>
            </Button>
            <Button
              type="button"
              variant={mode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange("preview")}
              className="h-8 gap-1.5 text-xs font-medium px-3"
            >
              <Eye className="size-3.5" />
              <span>Pratinjau Pengunjung</span>
            </Button>
          </div>

          <div className="hidden sm:block h-5 w-px bg-border" />

          {/* Primary Tools (only visible in design mode) */}
          {mode === "design" && (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant={activeTool === "select" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => onToolChange("select")}
                      className="h-8 px-2.5 gap-1.5 text-xs"
                      aria-label="Alat Pilih Objek (V)"
                    >
                      <MousePointer className="size-3.5" />
                      <span className="hidden md:inline">Pilih</span>
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  Alat Pilih Objek (Shortcut: V)
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant={activeTool === "pan" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => onToolChange("pan")}
                      className="h-8 px-2.5 gap-1.5 text-xs"
                      aria-label="Alat Geser Kanvas (H)"
                    >
                      <Hand className="size-3.5" />
                      <span className="hidden md:inline">Geser Kanvas</span>
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  Geser Kanvas (Shortcut: H)
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onAddBooth}
                      className="h-8 px-2.5 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Store className="size-3.5" />
                      <span>Tambah Stan</span>
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  Tambahkan stan bazaar baru ke kanvas
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onAddZone}
                      className="h-8 px-2.5 gap-1.5 text-xs"
                    >
                      <Layers className="size-3.5" />
                      <span className="hidden lg:inline">Tambah Zona</span>
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  Tambahkan area pembatas zona
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Undo and Redo */}
          {mode === "design" && (
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={onUndo}
                      disabled={!canUndo}
                      className="size-8"
                      aria-label="Urungkan (Undo)"
                    >
                      <Undo2 className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom">Urungkan (Ctrl+Z)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={onRedo}
                      disabled={!canRedo}
                      className="size-8"
                      aria-label="Ulangi (Redo)"
                    >
                      <Redo2 className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom">Ulangi (Ctrl+Y)</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Right: Zoom controls, Grid toggles, and Save/Export actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onZoomChange(
                        Math.max(0.4, Number((zoom - 0.1).toFixed(1))),
                      )
                    }
                    className="size-7"
                    aria-label="Perkecil Kanvas"
                  >
                    <ZoomOut className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent side="bottom">Perkecil</TooltipContent>
            </Tooltip>

            <span className="px-1.5 text-[11px] font-mono font-medium min-w-[42px] text-center select-none">
              {Math.round(zoom * 100)}%
            </span>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onZoomChange(
                        Math.min(2.0, Number((zoom + 0.1).toFixed(1))),
                      )
                    }
                    className="size-7"
                    aria-label="Perbesar Kanvas"
                  >
                    <ZoomIn className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent side="bottom">Perbesar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onFitView}
                    className="size-7"
                    aria-label="Sesuaikan Tampilan"
                  >
                    <Maximize2 className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                Sesuaikan Tampilan (Fit)
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Grid and Snap toggles (Design mode only) */}
          {mode === "design" && (
            <div className="hidden sm:flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant={showGrid ? "secondary" : "ghost"}
                      size="icon"
                      onClick={onToggleGrid}
                      className="size-8"
                      aria-label="Tampilkan Garis Kisi"
                    >
                      <Grid className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  {showGrid
                    ? "Sembunyikan Kisi (Grid)"
                    : "Tampilkan Kisi (Grid)"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant={snapToGrid ? "secondary" : "ghost"}
                      size="icon"
                      onClick={onToggleSnap}
                      className="size-8"
                      aria-label="Rapatkan ke Kisi (Snap to Grid)"
                    >
                      <Magnet className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  {snapToGrid ? "Matikan Snap Kisi" : "Nyalakan Snap Kisi"}
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Template Presets Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <FileSpreadsheet className="size-3.5" />
                  <span className="hidden md:inline">Template</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">
                  Pilihan Template Denah
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {TEMPLATES_LIST.map((tpl) => (
                  <DropdownMenuItem
                    key={tpl.id}
                    onClick={() => onSelectTemplate(tpl.id)}
                    className="cursor-pointer flex flex-col items-start gap-0.5"
                  >
                    <span className="font-medium text-xs text-foreground">
                      {tpl.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {tpl.description}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export / Import Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                >
                  <span>Berkas</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={onExportJSON}
                className="gap-2 cursor-pointer text-xs"
              >
                <Download className="size-3.5" />
                <span>Unduh Berkas JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 cursor-pointer text-xs"
              >
                <Upload className="size-3.5" />
                <span>Unggah Berkas JSON</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary Save Button */}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onSave}
            className="h-8 gap-1.5 text-xs font-semibold px-3.5"
          >
            <Save className="size-3.5" />
            <span>Simpan</span>
            {hasUnsavedChanges && (
              <span className="size-1.5 rounded-full bg-amber-300 animate-pulse" />
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
