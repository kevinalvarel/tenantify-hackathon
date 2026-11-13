import { ActiveUmkm } from "@/types/customer";

export type UmkmRegistryItem = ActiveUmkm & {
  category?: string;
  location: string;
  tenantIds: string[];
};

export const PRESET_UMKM: Record<string, UmkmRegistryItem> = {
  // 1. Paguyuban Cilegon Juare (Database default association)
  "5S5CTP": {
    code: "5S5CTP",
    name: "Paguyuban Cilegon Juare",
    type: "paguyuban",
    description: "Pusat kuliner & paguyuban UMKM terpadu Cilegon Juare dengan aneka tenant pilihan.",
    location: "Kawasan Sentra Kuliner Cilegon Juare",
    category: "Food Court & Multi-UMKM",
    tenantIds: [
      "tenant-kevin-kebab",
      "tenant-seblak-safik",
      "tenant-bebek-madura",
      "tenant-janji-manis",
      "tenant-ayam-juara",
      "tenant-serambi-aceh",
      "tenant-dimsum-imperial",
      "tenant-sate-mas-joko",
    ],
  },

  // 2. Paguyuban Kuliner Nusantara
  "PGY001": {
    code: "PGY001",
    name: "Paguyuban Kuliner Nusantara",
    type: "paguyuban",
    description: "Komunitas kuliner tradisional dan lauk otentik khas berbagai penjuru nusantara.",
    location: "Zona Kuliner Nusantara (Zona A & B)",
    category: "Kuliner Tradisional Nusantara",
    tenantIds: [
      "tenant-bebek-madura",
      "tenant-ayam-juara",
      "tenant-serambi-aceh",
      "tenant-sate-mas-joko",
    ],
  },

  // 3. Bazaar Kafe & Camilan
  "BZR002": {
    code: "BZR002",
    name: "Bazaar Festival Kafe & Camilan",
    type: "paguyuban",
    description: "Kumpulan stan UMKM modern, kopi artisan, kudapan ringan, dan jajanan favorit.",
    location: "Zona Kafe & Snack (Zona C)",
    category: "Kafe & Jajanan Kekinian",
    tenantIds: [
      "tenant-kevin-kebab",
      "tenant-janji-manis",
      "tenant-seblak-safik",
      "tenant-dimsum-imperial",
    ],
  },

  // 4. Stand UMKM Individu
  "KEB001": {
    code: "KEB001",
    name: "UMKM Kevin Kebab & Burger",
    type: "umkm",
    description: "UMKM spesialis kebab panggang daging sapi premium, burger juicy, dan roti canai.",
    location: "Stall A-04 (Zona A)",
    category: "Kebab & Timur Tengah",
    tenantIds: ["tenant-kevin-kebab"],
  },
  "BBK001": {
    code: "BBK001",
    name: "UMKM Bebek Madura Cak Munir",
    type: "umkm",
    description: "UMKM olahan bebek dan ayam bumbu hitam gurih pedas khas Madura dengan sambal mangga.",
    location: "Stall C-01 (Zona C)",
    category: "Nusantara & Lauk Pauk",
    tenantIds: ["tenant-bebek-madura"],
  },
  "KOP001": {
    code: "KOP001",
    name: "UMKM Kopi & Toast Janji Manis",
    type: "umkm",
    description: "UMKM kopi susu artisan gula aren, minuman segar, dan aneka toast panggang renyah.",
    location: "Stall A-01 (Zona A)",
    category: "Kopi & Roti Panggang",
    tenantIds: ["tenant-janji-manis"],
  },
  "AYM001": {
    code: "AYM001",
    name: "UMKM Ayam Juara Geprek",
    type: "umkm",
    description: "UMKM ayam geprek krispi pedas nampol dengan pilihan sambal korek dan mozzarella.",
    location: "Stall A-08 (Zona A)",
    category: "Ayam Geprek & Sambal",
    tenantIds: ["tenant-ayam-juara"],
  },
  "SBL001": {
    code: "SBL001",
    name: "UMKM Seblak Safik Bandung",
    type: "umkm",
    description: "UMKM seblak prasmanan khas Bandung dengan aneka topping gurih dan pedas berlevel.",
    location: "Stall B-12 (Zona B)",
    category: "Seblak & Kudapan Pedas",
    tenantIds: ["tenant-seblak-safik"],
  },
  "ACH001": {
    code: "ACH001",
    name: "UMKM Warung Serambi Aceh",
    type: "umkm",
    description: "UMKM kuliner khas Serambi Mekkah: Mie Aceh kuah kental rempah dan kopi Gayo otentik.",
    location: "Stall B-03 (Zona B)",
    category: "Mie & Kopi Nusantara",
    tenantIds: ["tenant-serambi-aceh"],
  },
  "DIM001": {
    code: "DIM001",
    name: "UMKM Dimsum Imperial",
    type: "umkm",
    description: "UMKM dimsum kukus lembut, dimsum goreng, mentai bakar, dan lumpia udang.",
    location: "Stall C-05 (Zona C)",
    category: "Dimsum & Kudapan",
    tenantIds: ["tenant-dimsum-imperial"],
  },
  "SAT001": {
    code: "SAT001",
    name: "UMKM Sate Purwakarta Mas Joko",
    type: "umkm",
    description: "UMKM sate maranggi sapi dan kambing bakar dengan bumbu kecap pedas nikmat.",
    location: "Stall A-02 (Zona A)",
    category: "Sate & Bakaran",
    tenantIds: ["tenant-sate-mas-joko"],
  },
};

// Map aliases like UMKM01 -> KEB001, etc.
export const CODE_ALIASES: Record<string, string> = {
  "UMKM01": "KEB001",
  "UMKM02": "BBK001",
  "UMKM03": "KOP001",
  "UMKM04": "AYM001",
  "UMKM05": "SBL001",
  "UMKM06": "ACH001",
  "UMKM07": "DIM001",
  "UMKM08": "SAT001",
  "TNT001": "5S5CTP",
  "BAZAAR": "5S5CTP",
};

export function findPresetUmkmByCode(rawCode: string): UmkmRegistryItem | null {
  if (!rawCode) return null;
  const normalized = rawCode.trim().toUpperCase();
  const targetCode = CODE_ALIASES[normalized] || normalized;
  return PRESET_UMKM[targetCode] || null;
}

