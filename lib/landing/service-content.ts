export type ServiceCapability = {
  title: string;
  description: string;
};

export type ServiceShot = {
  src?: string;
  expectedPath?: string;
  alt: string;
  metricLabel: string;
  metricValue: string;
};

export type ServiceRole = {
  id: string;
  badge: string;
  roleName: string;
  headline: string;
  tagline: string;
  description: string;
  capabilities: [
    ServiceCapability,
    ServiceCapability,
    ServiceCapability,
    ServiceCapability,
    ServiceCapability,
  ];
  preview: ServiceShot;
  cta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
};

export type SynergyStep = {
  number: string;
  role: string;
  title: string;
  detail: string;
  iconName: "building" | "store" | "shopping-bag" | "sparkles";
};

export const SERVICE_META = {
  title: "Layanan Tenantify: Solusi Terintegrasi Pengelola, Penjual, dan Pembeli",
  description:
    "Pelajari layanan komprehensif Tenantify untuk digitalisasi bazaar dan food court. Fitur spesifik untuk Association (Pengelola), Seller (Penjual), dan Consumer (Pembeli).",
  canonicalPath: "/service",
};

export const SERVICE_HERO = {
  badge: "Ekosistem Komersial Terpadu",
  headline: "Layanan digital lengkap untuk bazaar dan food court modern",
  subline:
    "Tenantify menghubungkan pengelola kawasan, pelaku usaha stan UMKM, dan pembeli dalam satu sistem terintegrasi. Pilih peran Anda untuk mempelajari layanan spesifik yang kami hadirkan.",
  jumpAnchors: [
    {
      label: "Pengelola Area",
      role: "Association",
      targetId: "pengelola",
      summary: "Tata stan, persetujuan tenant, dan pantau okupansi kawasan",
    },
    {
      label: "Penjual Stan",
      role: "Seller",
      targetId: "penjual",
      summary: "Kasir POS, pantau persediaan stok, dan terima pesanan",
    },
    {
      label: "Pembeli & Pengunjung",
      role: "Consumer",
      targetId: "pembeli",
      summary: "Peta bazaar interaktif, jelajah menu, dan keranjang belanja terpadu",
    },
  ],
};

export const SERVICE_ROLES: ServiceRole[] = [
  {
    id: "pengelola",
    badge: "Association / Pengelola Kawasan",
    roleName: "Pengelola",
    headline: "Kendalikan seluruh operasional bazaar dan stan komersial",
    tagline: "Otomatisasi tata kelola stan, kurasi tenant UMKM, dan pengawasan metrik pendapatan",
    description:
      "Sebagai pengelola kawasan bazaar atau food court, Anda membutuhkan visibilitas menyeluruh terhadap kapasitas stan, permohonan masuk tenant UMKM, dan arus sewa. Tenantify menyediakan dasbor manajemen kawasan terpadu untuk merencanakan denah stan fisik, memverifikasi izin usaha, dan memantau status okupansi tanpa kerumitan administrasi manual.",
    capabilities: [
      {
        title: "Manajemen Tata Letak Stan & Pemetaan Zona",
        description:
          "Rancang dan visualisasikan denah stan fisik dalam kawasan bazaar dengan pembagian zona, ukuran stan, dan tarif sewa yang fleksibel.",
      },
      {
        title: "Alur Kurasi & Persetujuan Pendaftaran Tenant",
        description:
          "Tinjau pengajuan tenant baru secara digital, verifikasi profil kelayakan usaha UMKM, dan setujui stan dengan sistem workflow transparan.",
      },
      {
        title: "Pemantauan Okupansi & Status Sewa Real Time",
        description:
          "Ketahui stan mana saja yang terisi, sedang kosong, atau mendekati tenggat masa sewa aktif dari satu panel kontrol komprehensif.",
      },
      {
        title: "Laporan Pendapatan Sewa & Arsip Kuitansi",
        description:
          "Rekapitulasi riwayat tagihan sewa stan, pembayaran terverifikasi, dan tanda terima digital resmi yang siap diunduh untuk kebutuhan audit.",
      },
      {
        title: "Kendali Visibilitas Stan pada Direktori Publik",
        description:
          "Atur tenant yang aktif dan telah terverifikasi agar langsung tampil pada denah pencarian pengunjung dan katalog menu di aplikasi.",
      },
    ],
    preview: {
      src: "/images/landing/asso.png",
      alt: "Panel Dasbor Pengelola Kawasan Tenantify",
      metricLabel: "Efisiensi Kurasi & Okupansi",
      metricValue: "100% Digital",
    },
    cta: {
      label: "Daftar sebagai Pengelola",
      href: "/auth/sign-up?role=association",
    },
    secondaryCta: {
      label: "Masuk ke Portal Pengelola",
      href: "/auth/sign-in",
    },
  },
  {
    id: "penjual",
    badge: "Seller / Pelaku Usaha UMKM",
    roleName: "Penjual",
    headline: "Maksimalkan penjualan stan dengan kasir POS dan inventaris cerdas",
    tagline: "Kelola kasir on tenant, pantau ketersediaan stok bahan, dan catat omzet otomatis",
    description:
      "Untuk pelaku UMKM yang membuka stan di sentra bazaar, Tenantify menyederhanakan transaksi kasir di lokasi dan pengelolaan persediaan bahan. Dari satu perangkat tablet atau ponsel pintar, kasir stan dapat menerima pembayaran tunai maupun nontunai, menerima prapemesanan dari pengunjung, dan melihat laporan laba kotor harian secara akurat.",
    capabilities: [
      {
        title: "Point of Sale (POS) Kasir Stan Cepat",
        description:
          "Sistem kasir ringan yang dioptimalkan untuk antrean cepat di stan fisik, mendukung cetak struk dan konfirmasi pembayaran QRIS.",
      },
      {
        title: "Manajemen Stok & Menu Bahan Real Time",
        description:
          "Perbarui ketersediaan porsi atau bahan menu secara langsung. Sistem memberikan sinyal peringatan dini saat persediaan menipis.",
      },
      {
        title: "Pelacakan Pesanan Masuk Terpadu",
        description:
          "Kelola pesanan pelanggan dari antrean langsung di stan maupun pesanan online dari pengunjung yang memesan lebih awal.",
      },
      {
        title: "Sistem Pembayaran Sewa Stan Digital",
        description:
          "Lakukan pembayaran sewa berkala kepada pengelola kawasan langsung dari portal seller dengan bukti kuitansi elektronik resmi.",
      },
      {
        title: "Ringkasan Penjualan & Analisis Menu Terlaris",
        description:
          "Dapatkan visualisasi performa harian yang merinci omzet, produk paling laku, dan jam tersibuk stan tanpa hitungan kalkulator.",
      },
    ],
    preview: {
      src: "/images/landing/seller.png",
      alt: "Dasbor Kasir POS dan Manajemen Stok Seller Tenantify",
      metricLabel: "Kecepatan Pemrosesan Kasir",
      metricValue: "< 15 Detik",
    },
    cta: {
      label: "Buka Stan Penjual",
      href: "/auth/sign-in",
    },
    secondaryCta: {
      label: "Masuk ke Dasbor Kasir",
      href: "/auth/sign-in",
    },
  },
  {
    id: "pembeli",
    badge: "Consumer / Pengunjung & Pembeli",
    roleName: "Pembeli",
    headline: "Pengalaman berbelanja kuliner dan bazaar yang lebih nyaman",
    tagline: "Temukan stan lewat denah interaktif, pesan antar tenant, dan lewati antrean panjang",
    description:
      "Pengunjung bazaar kini tidak perlu lagi berjalan tanpa arah mencari stan makanan atau berdiri lelah mengantre di kasir. Tenantify menyajikan peta denah digital interaktif kawasan, penjelajah menu lintas stan lengkap dengan foto dan harga, serta rekomendasi kuliner pintar yang membuat kunjungan Anda semakin menyenangkan.",
    capabilities: [
      {
        title: "Denah Kawasan Bazaar Interaktif",
        description:
          "Buka denah stan digital di ponsel pintar Anda untuk melihat posisi gerai kuliner, toilet, musala, dan pintu keluar terdekat.",
      },
      {
        title: "Penjelajah Menu & Harga Lintas Tenant",
        description:
          "Jelajahi foto hidangan, harga, dan rincian menu dari seluruh stan makanan dan minuman di kawasan bazaar sebelum Anda melangkah.",
      },
      {
        title: "Rekomendasi Cerdas Antar Tenant (Cross Recommendation)",
        description:
          "Nikmati saran padanan hidangan otomatis, seperti rekomendasi minuman segar saat Anda memesan menu makanan berat di stan lain.",
      },
      {
        title: "Keranjang Belanja Terpadu Multi Tenant",
        description:
          "Pesan dari berbagai stan berbeda sekaligus dalam satu keranjang belanja praktis tanpa perlu membayar berulang kali di tiap kasir.",
      },
      {
        title: "Pelacakan Pesanan Hidangan Real Time",
        description:
          "Pantau status hidangan yang sedang dimasak langsung dari ponsel Anda. Ambil pesanan tepat saat makanan siap saji.",
      },
    ],
    preview: {
      src: "/images/landing/customer.png",
      alt: "Antarmuka Penjelajah Menu dan Denah Bazaar Consumer Tenantify",
      metricLabel: "Waktu Antre Dipangkas",
      metricValue: "Hingga 70%",
    },
    cta: {
      label: "Mulai Belanja & Jelajah",
      href: "/",
    },
    secondaryCta: {
      label: "Masuk Akun Pengunjung",
      href: "/auth/sign-in",
    },
  },
];

export const SERVICE_SYNERGY: {
  headline: string;
  tagline: string;
  description: string;
  steps: SynergyStep[];
} = {
  headline: "Sinergi Tiga Pilar Ekosistem Tenantify",
  tagline: "Bagaimana Pengelola, Penjual, dan Pembeli Terhubung Harmonis",
  description:
    "Tenantify bukan sekadar aplikasi kasir biasa atau peta statis. Sistem kami menciptakan aliran interaksi langsung antara pengelola kawasan, pedagang UMKM, dan pengunjung dalam siklus operasional yang saling menguntungkan.",
  steps: [
    {
      number: "01",
      role: "Pengelola Kawasan",
      title: "Penataan Zona & Registrasi Stan",
      detail:
        "Pengelola menyiapkan denah stan fisik di lokasi bazaar dan menyetujui pendaftaran pedagang UMKM yang bergabung.",
      iconName: "building",
    },
    {
      number: "02",
      role: "Pelaku Usaha (Penjual)",
      title: "Publikasi Menu & Kesiapan POS",
      detail:
        "Penjual mengisi katalog hidangan, menyetel persediaan bahan, dan membuka kasir digital siap melayani pesanan.",
      iconName: "store",
    },
    {
      number: "03",
      role: "Pengunjung (Pembeli)",
      title: "Eksplorasi Denah & Pemesanan Terpadu",
      detail:
        "Pengunjung menjelajahi denah stan di ponsel, memilih menu dari berbagai gerai, dan melakukan pemesanan tanpa antre.",
      iconName: "shopping-bag",
    },
    {
      number: "04",
      role: "Sistem Terpadu",
      title: "Rekap Transaksi & Pembayaran Otomatis",
      detail:
        "Pesanan langsung terdistribusi ke dapur masing masing stan, sementara data penjualan dan biaya sewa terarsip otomatis.",
      iconName: "sparkles",
    },
  ],
};

export const SERVICE_CTA = {
  headline: "Siap mendigitalisasi area bazaar atau stan Anda?",
  subline:
    "Bergabunglah dengan ratusan pengelola dan pelaku usaha UMKM yang telah meningkatkan efisiensi operasional dan kenyamanan pengunjung bersama Tenantify.",
  primaryCta: { label: "Daftar Akun Sekarang", href: "/auth/sign-up" },
  secondaryCta: { label: "Masuk ke Akun", href: "/auth/sign-in" },
};
