import type { AreaZone, BoothSlot } from "@/types/association";
import type {
  FloorplanBooth,
  FloorplanData,
  FloorplanDoor,
  FloorplanZoneArea,
} from "@/types/floorplan";
import { DEFAULT_DOORS } from "./floorplan-data";

const ZONE_TONES = [
  { color: "rgba(201, 100, 66, 0.08)", borderColor: "rgba(201, 100, 66, 0.4)" },
  { color: "rgba(13, 148, 136, 0.08)", borderColor: "rgba(13, 148, 136, 0.4)" },
  { color: "rgba(99, 102, 241, 0.08)", borderColor: "rgba(99, 102, 241, 0.4)" },
  { color: "rgba(202, 138, 4, 0.08)", borderColor: "rgba(202, 138, 4, 0.4)" },
];

export function floorplanFromAssociation(
  zones: AreaZone[],
  booths: BoothSlot[],
  doors?: FloorplanDoor[]
) {
  const zoneAreas: FloorplanZoneArea[] = zones.map((zone, index) => {
    const layout = zone.layout;
    const tone = ZONE_TONES[index % ZONE_TONES.length];
    return {
      id: zone.id,
      code: zone.code,
      name: zone.name,
      color: layout?.color || tone.color,
      borderColor: layout?.borderColor || tone.borderColor,
      x: layout?.x ?? 60 + (index % 2) * 620,
      y: layout?.y ?? 60 + Math.floor(index / 2) * 380,
      width: layout?.width ?? 580,
      height: layout?.height ?? 340,
    };
  });

  const zoneByCode = new Map(zoneAreas.map((zone) => [zone.code, zone]));
  const counters = new Map<string, number>();

  const mappedBooths: FloorplanBooth[] = booths.map((booth) => {
    const zone = zoneByCode.get(booth.zoneCode);
    const index = counters.get(booth.zoneCode) || 0;
    counters.set(booth.zoneCode, index + 1);
    const layout = booth.layout;

    return {
      id: booth.id,
      code: booth.boothNumber,
      label: booth.label || booth.tenantName || `Stan ${booth.boothNumber}`,
      zoneCode: booth.zoneCode,
      zoneName: zone?.name || booth.zoneCode,
      x: layout?.x ?? (zone?.x ?? 60) + 40 + (index % 3) * 160,
      y: layout?.y ?? (zone?.y ?? 60) + 80 + Math.floor(index / 3) * 130,
      width: layout?.width ?? 140,
      height: layout?.height ?? 100,
      rotation: layout?.rotation ?? 0,
      status: booth.status,
      sizeMeters: booth.size,
      priceMonthly: booth.priceMonthly,
      tenantId: booth.tenantId,
      tenantName: booth.tenantName,
      category: booth.category,
    };
  });

  return {
    zones: zoneAreas,
    booths: mappedBooths,
    doors: doors && doors.length > 0 ? doors : DEFAULT_DOORS,
  };
}

export function sanitizeTemplate(data: FloorplanData): FloorplanData {
  return {
    ...data,
    zones: data.zones.map((zone) => ({ ...zone })),
    doors: (data.doors || DEFAULT_DOORS).map((door) => ({ ...door })),
    booths: data.booths.map(
      (booth): FloorplanBooth => ({
        ...booth,
        label: `Stan ${booth.code}`,
        status: "available",
        priceMonthly: 0,
        tenantId: undefined,
        tenantName: undefined,
        tenantAvatar: undefined,
        category: undefined,
        rating: undefined,
        description: undefined,
      })
    ),
  };
}
