import type { Promotion } from "@/types/seller";

export const demoSellerPromotions: Promotion[] = [
  {
    id: "promo-001",
    title: "Menu Baru: Es Kopi Pandan",
    message:
      "Mulai hari ini, Es Kopi Pandan sudah tersedia di stan kami. Cobain varian barunya, ya!",
    type: "Info",
    startDate: "2026-11-08",
    endDate: "2026-11-30",
    status: "Terkirim",
    sentAt: "08 Nov 2026, 09.15",
    isDemo: true,
  },
  {
    id: "promo-002",
    title: "Diskon 15% Paket Hemat",
    message:
      "Khusus pembelian Paket Hemat Nasi + Es Teh, dapatkan potongan 15% sampai akhir pekan ini.",
    type: "Diskon",
    startDate: "2026-11-06",
    endDate: "2026-11-09",
    status: "Terkirim",
    sentAt: "06 Nov 2026, 10.40",
    isDemo: true,
  },
  {
    id: "promo-003",
    title: "Jam Operasional Berubah",
    message:
      "Sabtu ini kami buka lebih awal mulai pukul 09.00. Silakan mampir untuk sarapan.",
    type: "Pengumuman",
    startDate: "2026-11-02",
    endDate: "2026-11-07",
    status: "Terkirim",
    sentAt: "02 Nov 2026, 08.05",
    isDemo: true,
  },
  {
    id: "promo-004",
    title: "Stok Camilan Terbatas",
    message:
      "Pisang Goreng Keju sedang terbatas hari ini. Pesan lebih awal supaya tidak kehabisan.",
    type: "Pengumuman",
    startDate: "2026-10-30",
    endDate: "2026-10-30",
    status: "Terkirim",
    sentAt: "30 Okt 2026, 11.20",
    isDemo: true,
  },
];
