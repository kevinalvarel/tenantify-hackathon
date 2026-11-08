import {
  Building2,
  MapPin,
  Store,
  Package,
  ReceiptText,
  CreditCard,
  UtensilsCrossed,
  type LucideIcon,
  ChartNoAxesColumn,
  UsersRound,
  UserRoundPlus,
  Settings,
} from "lucide-react";
import { IconType } from "react-icons";

export type DashboardNavItem = {
  title: string;
  url: string;
  icon: LucideIcon | IconType;
  items?: { title: string; url: string }[];
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export const ASSOCIATION_NAV: DashboardNavGroup[] = [
  {
    label: "Dashboard",
    items: [
      {
        title: "General",
        url: "/dashboard/association",
        icon: Building2,
      },
      {
        title: "Statistik",
        url: "/dashboard/association/analytics",
        icon: ChartNoAxesColumn,
      },
    ],
  },
  {
    label: "Manajemen UMKM",
    items: [
      {
        title: "Kelola Pedagang",
        url: "/dashboard/association/manage-seller",
        icon: UsersRound,
      },
      {
        title: "Registrasi Pedagang",
        url: "/dashboard/association/register-seller",
        icon: UserRoundPlus,
      },
      {
        title: "Denah Bazaar / Layout",
        url: "/dashboard/association/layout",
        icon: MapPin,
      },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      {
        title: "Pengaturan",
        url: "/dashboard/association/settings",
        icon: Settings,
      },
    ],
  },
];

export const SELLER_NAV: DashboardNavGroup[] = [
  {
    label: "Seller Hub",
    items: [
      {
        title: "POS Kasir On-Tenant",
        url: "/dashboard/seller",
        icon: Store,
      },
      {
        title: "Pengaturan Stok",
        url: "/dashboard/seller/stock",
        icon: Package,
      },
      {
        title: "Manajemen Orderan",
        url: "/dashboard/seller/orders",
        icon: ReceiptText,
      },
      {
        title: "Pembayaran Sewa",
        url: "/dashboard/seller/payments",
        icon: CreditCard,
      },
    ],
  },
];

export const DEVELOPER_NAV: DashboardNavGroup[] = [
  ...ASSOCIATION_NAV,
  ...SELLER_NAV,
  {
    label: "Customer",
    items: [
      {
        title: "Jelajah Menu",
        url: "/customer",
        icon: UtensilsCrossed,
      },
      {
        title: "Riwayat Pesanan",
        url: "/customer/orders",
        icon: ReceiptText,
      },
      {
        title: "Denah Tenant",
        url: "/customer/map",
        icon: MapPin,
      },
    ],
  },
];

export const DASHBOARD_NAV_BY_ROLE: Record<string, DashboardNavGroup[]> = {
  association: ASSOCIATION_NAV,
  seller: SELLER_NAV,
  developer: DEVELOPER_NAV,
};
