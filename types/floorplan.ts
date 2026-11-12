export type BoothStatus = "available" | "occupied" | "reserved";

export interface FloorplanBooth {
  id: string;
  code: string;
  label: string;
  zoneCode: string;
  zoneName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  status: BoothStatus;
  sizeMeters: string;
  priceMonthly: number;
  tenantId?: string;
  tenantName?: string;
  tenantAvatar?: string;
  category?: string;
  rating?: number;
  description?: string;
}

export interface FloorplanZoneArea {
  id: string;
  code: string;
  name: string;
  color: string;
  borderColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloorplanData {
  version: string;
  title: string;
  areaName: string;
  dimensions: {
    width: number;
    height: number;
  };
  gridSize: number;
  snapToGrid: boolean;
  zones: FloorplanZoneArea[];
  booths: FloorplanBooth[];
  lastSavedAt: string;
}

export type EditorTool = "select" | "pan" | "booth" | "zone";

export type EditorMode = "design" | "preview";

