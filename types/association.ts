export type TenantStatus = "active" | "inactive";

export type TenantCategory =
  | "Semua"
  | "Makanan"
  | "Minuman"
  | "Fashion"
  | "Kerajinan"
  | "Kopi & Pastry";

export interface AssociationTenant {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  category: string;
  zone: string;
  boothNumber: string;
  status: TenantStatus;
  joinedAt: string;
  monthlyRevenue: number;
  rating: number;
  totalProducts: number;
  avatar: string;
  description?: string;
}

// Alias untuk kompatibilitas ke belakang
export type ProviderTenant = AssociationTenant;

export interface BoothSlot {
  id: string;
  zoneCode: string;
  boothNumber: string;
  label?: string;
  tenantId?: string;
  tenantName?: string;
  category?: string;
  status: "occupied" | "available" | "reserved";
  size: string;
  priceMonthly: number;
  layout?: BoothLayout | null;
}

export type ZoneLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
};

export type BoothLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export interface AreaZone {
  id: string;
  name: string;
  code: string;
  description: string;
  categoryFocus: string;
  totalBooths: number;
  occupiedBooths: number;
  layout?: ZoneLayout | null;
}
