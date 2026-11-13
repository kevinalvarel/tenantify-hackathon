export type BoothStatus = "available" | "occupied" | "reserved";

export type DoorType = "entrance" | "exit" | "both";

export interface FloorplanDoor {
  id: string;
  label: string;
  type: DoorType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

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
  doors: FloorplanDoor[];
  lastSavedAt: string;
}

export type EditorTool = "select" | "pan" | "booth" | "zone" | "door";

export type EditorMode = "design" | "preview";

