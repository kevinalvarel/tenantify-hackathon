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
  Star,
  DollarSign,
  Speaker,
  Megaphone,
  User,
  Map,
  Grid3X3,
} from "lucide-react";
import { IconType } from "react-icons";
import { FaMoneyBill } from "react-icons/fa";

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
        title: "Beranda",
        url: "/dashboard/association",
        icon: Building2,
      },
      {
        title: "Analitik",
        url: "/dashboard/association/analytics",
        icon: ChartNoAxesColumn,
      },
    ],
  },
  {
    label: "Manajemen Pedagang",
    items: [
      {
        title: "Daftar Pedagang",
        url: "/dashboard/association/manage-seller",
        icon: UsersRound,
      },
      {
        title: "Registrasi Pedagang",
        url: "/dashboard/association/register-seller",
        icon: UserRoundPlus,
      },
      {
        title: "Pembayaran Pedagang",
        url: "/dashboard/association/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Manajemen Area",
    items: [
      {
        title: "Denah Area",
        url: "/dashboard/association/floorplan",
        icon: Map,
      },
      {
        title: "Zona Tenant",
        url: "/dashboard/association/zone",
        icon: Store,
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
        title: "Manajemen Orderan",
        url: "/dashboard/seller/orders",
        icon: ReceiptText,
      },
    ],
  },
  {
    label: "Keuangan & Stock",
    items: [
      {
        title: "Pengaturan Stok",
        url: "/dashboard/seller/stock",
        icon: Package,
      },
      {
        title: "Pembayaran Sewa",
        url: "/dashboard/seller/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Pelanggan",
    items: [
      {
        title: "Statistik Pelanggan",
        url: "/dashboard/seller/statistics",
        icon: ChartNoAxesColumn,
      },
      {
        title: "Review Pelanggan",
        url: "/dashboard/seller/reviews",
        icon: Star,
      },
      {
        title: "Promosi",
        url: "/dashboard/seller/promotions",
        icon: Megaphone,
      },
    ],
  },
  {
    label: "Pengaturan Toko",
    items: [
      {
        title: "Pengaturan Toko",
        url: "/dashboard/seller/store-settings",
        icon: Settings,
      },
      {
        title: "Management Karyawan",
        url: "/dashboard/seller/employee-settings",
        icon: User,
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
