import type { Metadata } from "next";
import { CustomerProfileView } from "@/components/customer/customer-profile-view";

export const metadata: Metadata = {
  title: "Profil & Riwayat Pesanan - Tenantify",
  description:
    "Kelola profil akun pengguna, lihat riwayat pesanan makanan aktif dan selesai, serta kelola ulasan stan kuliner Anda.",
};

export default function CustomerProfilePage() {
  return <CustomerProfileView />;
}

