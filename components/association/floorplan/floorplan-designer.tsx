"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FloorplanData,
  FloorplanBooth,
  FloorplanZoneArea,
  EditorMode,
  EditorTool,
} from "@/types/floorplan";
import {
  DEFAULT_FLOORPLAN_DATA,
  TEMPLATES_LIST,
  generateBoothId,
  generateZoneId,
} from "./floorplan-data";
import { FloorplanToolbar } from "./floorplan-toolbar";
import { FloorplanCanvas } from "./floorplan-canvas";
import { FloorplanInspector } from "./floorplan-inspector";
import { FloorplanPreview } from "./floorplan-preview";
import { floorplanFromAssociation, sanitizeTemplate } from "./floorplan-sync";
import { useAssociation } from "@/context/association-context";
import { toast } from "sonner";

const INITIAL_FLOORPLAN: FloorplanData = {
  ...DEFAULT_FLOORPLAN_DATA,
  title: "Denah Bazaar",
  areaName: "Area Bazaar",
  zones: [],
  booths: [],
};

export function FloorplanDesigner() {
  const {
    tenants: associationTenants,
    zones: associationZones,
    booths: associationBooths,
    isLoading: associationLoading,
    loadError: associationLoadError,
    handleSaveFloorplan,
  } = useAssociation();

  // Core Floorplan Data State
  const [data, setData] = useState<FloorplanData>(INITIAL_FLOORPLAN);

  // History Stack for Undo/Redo
  const [history, setHistory] = useState<FloorplanData[]>([INITIAL_FLOORPLAN]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // UI & Tool States
  const [mode, setMode] = useState<EditorMode>("design");
  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"booth" | "zone" | null>(null);

  // Canvas Viewport States
  const [zoom, setZoom] = useState<number>(0.8);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const initializedFromDatabase = useRef(false);

  // Load the saved layout once the association data is ready
  useEffect(() => {
    if (associationLoading || initializedFromDatabase.current) return;
    initializedFromDatabase.current = true;

    const mapped = floorplanFromAssociation(
      associationZones,
      associationBooths
    );
    setData((prev) => ({ ...prev, ...mapped }));
    setHistory([{ ...INITIAL_FLOORPLAN, ...mapped }]);
    setHistoryIndex(0);
  }, [associationLoading, associationZones, associationBooths]);

  // Commit state to history stack
  const commitToHistory = useCallback((newData: FloorplanData) => {
    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, newData];
    });
    setHistoryIndex((prev) => prev + 1);
    setHasUnsavedChanges(true);
  }, [historyIndex]);

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setData(history[prevIndex]);
      setHasUnsavedChanges(true);
      toast.info("Perubahan diurungkan");
    }
  }, [history, historyIndex]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setData(history[nextIndex]);
      setHasUnsavedChanges(true);
      toast.info("Perubahan diulangi");
    }
  }, [history, historyIndex]);

  // Element Selection
  const handleSelect = (id: string | null, type: "booth" | "zone" | null) => {
    setSelectedId(id);
    setSelectedType(type);
  };

  // Update Booth
  const handleUpdateBooth = (id: string, updates: Partial<FloorplanBooth>) => {
    setData((prev) => {
      const updatedBooths = prev.booths.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      );
      return { ...prev, booths: updatedBooths };
    });
    setHasUnsavedChanges(true);
  };

  // Update Zone
  const handleUpdateZone = (id: string, updates: Partial<FloorplanZoneArea>) => {
    setData((prev) => {
      const updatedZones = prev.zones.map((z) =>
        z.id === id ? { ...z, ...updates } : z
      );
      return { ...prev, zones: updatedZones };
    });
    setHasUnsavedChanges(true);
  };

  // Add new booth
  const handleAddBooth = () => {
    const nextNum = data.booths.length + 1;
    const defaultZone = data.zones[0] || {
      code: "ZA",
      name: "Zona A",
    };
    const code = `${defaultZone.code.replace("Z", "")}-${String(nextNum).padStart(2, "0")}`;

    const newBooth: FloorplanBooth = {
      id: generateBoothId(),
      code,
      label: `Stan ${code}`,
      zoneCode: defaultZone.code,
      zoneName: defaultZone.name,
      x: 100,
      y: 100,
      width: 140,
      height: 100,
      rotation: 0,
      status: "available",
      sizeMeters: "3x3 m",
      priceMonthly: 0,
    };

    const nextData = {
      ...data,
      booths: [...data.booths, newBooth],
    };
    setData(nextData);
    commitToHistory(nextData);
    setSelectedId(newBooth.id);
    setSelectedType("booth");
    toast.success(`Stan ${code} berhasil ditambahkan`);
  };

  // Add new zone boundary
  const handleAddZone = () => {
    const zoneNum = data.zones.length + 1;
    const code = `Z${String.fromCharCode(64 + zoneNum)}`;
    const newZone: FloorplanZoneArea = {
      id: generateZoneId(),
      code,
      name: `Zona ${String.fromCharCode(64 + zoneNum)} (Area Baru)`,
      color: "rgba(234, 88, 12, 0.08)",
      borderColor: "rgba(234, 88, 12, 0.4)",
      x: 80,
      y: 80,
      width: 400,
      height: 300,
    };

    const nextData = {
      ...data,
      zones: [...data.zones, newZone],
    };
    setData(nextData);
    commitToHistory(nextData);
    setSelectedId(newZone.id);
    setSelectedType("zone");
    toast.success(`Zona ${code} berhasil ditambahkan`);
  };

  // Delete booth
  const handleDeleteBooth = (id: string) => {
    const boothToDelete = data.booths.find((b) => b.id === id);
    if (boothToDelete?.status === "occupied" || boothToDelete?.tenantId) {
      toast.error(
        "Booth terisi tidak bisa dihapus. Kosongkan booth terlebih dahulu."
      );
      return;
    }
    const nextData = {
      ...data,
      booths: data.booths.filter((b) => b.id !== id),
    };
    setData(nextData);
    commitToHistory(nextData);
    setSelectedId(null);
    setSelectedType(null);
    toast.info(`Stan ${boothToDelete?.code || ""} telah dihapus`);
  };

  // Delete zone
  const handleDeleteZone = (id: string) => {
    const zoneToDelete = data.zones.find((z) => z.id === id);
    const zoneHasOccupiedBooth = data.booths.some(
      (booth) =>
        booth.zoneCode === zoneToDelete?.code &&
        (booth.status === "occupied" || Boolean(booth.tenantId))
    );
    if (zoneHasOccupiedBooth) {
      toast.error(
        "Zona masih memiliki booth terisi. Kosongkan booth terlebih dahulu."
      );
      return;
    }
    const nextData = {
      ...data,
      zones: data.zones.filter((z) => z.id !== id),
    };
    setData(nextData);
    commitToHistory(nextData);
    setSelectedId(null);
    setSelectedType(null);
    toast.info(`Area ${zoneToDelete?.name || ""} telah dihapus`);
  };

  // Duplicate booth
  const handleDuplicateBooth = (id: string) => {
    const sourceBooth = data.booths.find((b) => b.id === id);
    if (!sourceBooth) return;

    const nextNum = data.booths.length + 1;
    const code = `${sourceBooth.zoneCode.replace("Z", "")}-${String(nextNum).padStart(2, "0")}`;

    const duplicated: FloorplanBooth = {
      ...sourceBooth,
      id: generateBoothId(),
      code,
      label: `Stan ${code}`,
      x: sourceBooth.x + 20,
      y: sourceBooth.y + 20,
      status: "available",
      tenantId: undefined,
      tenantName: undefined,
    };

    const nextData = {
      ...data,
      booths: [...data.booths, duplicated],
    };
    setData(nextData);
    commitToHistory(nextData);
    setSelectedId(duplicated.id);
    setSelectedType("booth");
    toast.success(`Stan diduplikasi menjadi ${code}`);
  };

  // Rotate booth
  const handleRotateBooth = (id: string) => {
    const target = data.booths.find((b) => b.id === id);
    if (!target) return;
    const nextRotation = (target.rotation + 90) % 360;
    const nextData = {
      ...data,
      booths: data.booths.map((b) =>
        b.id === id ? { ...b, rotation: nextRotation } : b
      ),
    };
    setData(nextData);
    commitToHistory(nextData);
  };

  // Canvas Settings Update
  const handleUpdateCanvasSettings = (settings: {
    title?: string;
    areaName?: string;
    width?: number;
    height?: number;
    gridSize?: number;
  }) => {
    const nextData: FloorplanData = {
      ...data,
      title: settings.title ?? data.title,
      areaName: settings.areaName ?? data.areaName,
      gridSize: settings.gridSize ?? data.gridSize,
      dimensions: {
        width: settings.width ?? data.dimensions.width,
        height: settings.height ?? data.dimensions.height,
      },
    };
    setData(nextData);
    commitToHistory(nextData);
  };

  // Template Selection
  const handleSelectTemplate = (templateId: string) => {
    const template = TEMPLATES_LIST.find((t) => t.id === templateId);
    if (template) {
      const sanitized = sanitizeTemplate(template.data);
      setData(sanitized);
      setHistory([sanitized]);
      setHistoryIndex(0);
      setSelectedId(null);
      setSelectedType(null);
      setHasUnsavedChanges(true);
      toast.success(`Template "${template.name}" berhasil dimuat`);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `floorplan-${data.title.toLowerCase().replace(/\s+/g, "-")}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Berkas denah JSON berhasil diunduh");
  };

  // Import JSON
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed && Array.isArray(parsed.booths) && parsed.dimensions) {
          setData(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
          setSelectedId(null);
          setSelectedType(null);
          setHasUnsavedChanges(false);
          toast.success("Berkas denah berhasil diimpor ke editor");
        } else {
          toast.error("Format data denah tidak valid");
        }
      } catch {
        toast.error("Gagal membaca berkas JSON");
      }
    };
    reader.readAsText(file);
  };

  // Save changes to the database
  const handleSave = async () => {
    if (isSaving) return;
    if (associationLoading) {
      toast.error("Data zona masih dimuat. Coba lagi sebentar.");
      return;
    }
    if (associationLoadError) {
      toast.error(
        "Data denah belum termuat dari database. Muat ulang halaman sebelum menyimpan."
      );
      return;
    }

    setIsSaving(true);
    const result = await handleSaveFloorplan({
      zones: data.zones.map((zone) => ({
        code: zone.code,
        name: zone.name,
        layout: {
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          color: zone.color,
          borderColor: zone.borderColor,
        },
      })),
      booths: data.booths.map((booth) => ({
        code: booth.code,
        zoneCode: booth.zoneCode,
        label: booth.label,
        sizeMeters: booth.sizeMeters,
        priceMonthly: booth.priceMonthly,
        status: booth.status,
        tenantId: booth.tenantId,
        layout: {
          x: booth.x,
          y: booth.y,
          width: booth.width,
          height: booth.height,
          rotation: booth.rotation,
        },
      })),
    });
    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    if (result.data) {
      const mapped = floorplanFromAssociation(result.data.zones, result.data.booths);
      const nextData = {
        ...data,
        ...mapped,
        lastSavedAt: new Date().toISOString(),
      };
      setData(nextData);
      setHistory([nextData]);
      setHistoryIndex(0);
    }

    setHasUnsavedChanges(false);
    toast.success(result.message);
  };

  // Fit View
  const handleFitView = () => {
    setZoom(0.75);
    setPan({ x: 10, y: 10 });
  };

  // Keyboard Shortcuts (Delete, Undo, Redo, Escape, Nudge)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement
      ) {
        return;
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Delete / Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        if (selectedType === "booth") {
          handleDeleteBooth(selectedId);
        } else if (selectedType === "zone") {
          handleDeleteZone(selectedId);
        }
        return;
      }

      // Escape (Deselect)
      if (e.key === "Escape") {
        setSelectedId(null);
        setSelectedType(null);
        setActiveTool("select");
        return;
      }

      // Arrow keys nudge selected booth
      if (
        selectedId &&
        selectedType === "booth" &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 40 : 20;
        const currentBooth = data.booths.find((b) => b.id === selectedId);
        if (!currentBooth) return;

        let newX = currentBooth.x;
        let newY = currentBooth.y;
        if (e.key === "ArrowUp") newY = Math.max(0, currentBooth.y - step);
        if (e.key === "ArrowDown") newY = currentBooth.y + step;
        if (e.key === "ArrowLeft") newX = Math.max(0, currentBooth.x - step);
        if (e.key === "ArrowRight") newX = currentBooth.x + step;

        handleUpdateBooth(selectedId, { x: newX, y: newY });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    selectedId,
    selectedType,
    data.booths,
  ]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Desain Denah & Tata Letak Stan
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rancang posisi stan bazaar dan pembagian zona untuk pengunjung Tenantify.
          </p>
        </div>

        {hasUnsavedChanges && (
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500 animate-ping" />
            <span>Ada perubahan belum disimpan</span>
          </div>
        )}
      </div>

      {/* Editor Toolbar */}
      <FloorplanToolbar
        mode={mode}
        onModeChange={setMode}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitView={handleFitView}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
        snapToGrid={data.snapToGrid}
        onToggleSnap={() =>
          setData((prev) => ({ ...prev, snapToGrid: !prev.snapToGrid }))
        }
        onAddBooth={handleAddBooth}
        onAddZone={handleAddZone}
        onSave={handleSave}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onSelectTemplate={handleSelectTemplate}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Content Area: Design Mode vs Consumer Preview Mode */}
      {mode === "design" ? (
        <div className="grid gap-4 lg:grid-cols-4 items-start">
          {/* Main Interactive Canvas Area */}
          <div className="lg:col-span-3">
            <FloorplanCanvas
              data={data}
              mode={mode}
              activeTool={activeTool}
              selectedId={selectedId}
              selectedType={selectedType}
              onSelect={handleSelect}
              onUpdateBooth={handleUpdateBooth}
              onUpdateZone={handleUpdateZone}
              onAddBooth={handleAddBooth}
              zoom={zoom}
              onZoomChange={setZoom}
              pan={pan}
              onPanChange={setPan}
              showGrid={showGrid}
              onCommitHistory={() => commitToHistory(data)}
            />
          </div>

          {/* Properties Inspector Sidebar */}
          <div className="lg:col-span-1">
            <FloorplanInspector
              data={data}
              selectedId={selectedId}
              selectedType={selectedType}
              onSelect={handleSelect}
              onUpdateBooth={handleUpdateBooth}
              onUpdateZone={handleUpdateZone}
              onDeleteBooth={handleDeleteBooth}
              onDeleteZone={handleDeleteZone}
              onDuplicateBooth={handleDuplicateBooth}
              onRotateBooth={handleRotateBooth}
              onUpdateCanvasSettings={handleUpdateCanvasSettings}
              associationTenants={associationTenants}
              associationZones={associationZones}
            />
          </div>
        </div>
      ) : (
        <FloorplanPreview
          data={data}
          onExitPreview={() => setMode("design")}
        />
      )}
    </div>
  );
}

