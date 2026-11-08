export type VenueSolution = {
  id: string;
  badge: string;
  title: string;
  roleBadge: string;
  summary: string;
  painPoints: [string, string, string];
  capabilities: Array<{
    title: string;
    description: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
  }>;
  tags: string[];
  ctaText: string;
  ctaHref: string;
};

export type ImpactPillar = {
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  iconName: "zap" | "trending-up" | "shield-check" | "users";
};

export const SOLUTIONS_META = {
  title: "Solusi Tenantify: Digitalisasi Bazaar, Food Court, dan Sentra UMKM",
  description:
    "Solusi platform terpadu Tenantify untuk Bazaar Kuliner, Food Court Modern, Pop-up Market, dan Sentra UMKM. Hubungkan pengelola, pedagang, dan pengunjung dengan sistem digital yang praktis.",
  canonicalPath: "/solutions",
};

export const SOLUTIONS_HERO = {
  badge: "Solusi Berbasis Kawasan",
  headline: "Solusi digital tepat guna untuk setiap model ruang komersial",
  subline:
    "Dari bazaar kuliner akhir pekan hingga food court modern dan kawasan sentra UMKM permanen, Tenantify menghadirkan solusi teknologi terpadu yang memadukan peta interaktif, manajemen kasir kilat, serta rekomendasi lintas tenant.",
  jumpAnchors: [
    {
      targetId: "bazaar-festival",
      label: "Bazaar & Festival",
      venueType: "Bazaar Kuliner",
      tagline: "Kurangi antrean & maksimalkan flow",
    },
    {
      targetId: "food-court",
      label: "Food Court",
      venueType: "Food Court Modern",
      tagline: "Satu keranjang belanja lintas tenant",
    },
    {
      targetId: "pop-up-market",
      label: "Pop-up Market",
      venueType: "Pasar Kreatif",
      tagline: "Setup stan kilat & kontrol stok",
    },
    {
      targetId: "sentra-umkm",
      label: "Sentra UMKM",
      venueType: "Kawasan Komersial",
      tagline: "Sewa tertib & pembukuan otomatis",
    },
  ],
};

export const VENUE_SOLUTIONS: VenueSolution[] = [
  {
    id: "bazaar-festival",
    badge: "Event & Festival Musiman",
    title: "Bazaar Kuliner & Festival",
    roleBadge: "Volume Tinggi & Dinamis",
    summary:
      "Ubah kerumunan pengunjung menjadi transaksi cepat. Berikan pengalaman kuliner tanpa antrean melelahkan dengan denah stan interaktif dan pemesanan online langsung dari smartphone.",
    painPoints: [
      "Pengunjung menumpuk hingga 30 menit di stan viral, membuat pengunjung lain enggan berbelanja.",
      "Pengunjung kesulitan menavigasi denah stan makanan di venue bazaar yang luas dan ramai.",
      "Rekonsiliasi transaksi tiket/kupon fisik saat penutupan acara memakan waktu berjam-jam dan rentan selisih.",
    ],
    capabilities: [
      {
        title: "Peta Denah Stan Interaktif",
        description:
          "Pengunjung dapat membuka peta tata letak stan bazaar secara real-time dari browser smartphone tanpa perlu unduh aplikasi berat.",
      },
      {
        title: "Pemesanan & Antrean Mandiri",
        description:
          "Pengunjung memesan dan membayar secara digital, lalu menerima notifikasi saat hidangan siap diambil di booth terkait.",
      },
      {
        title: "Rekomendasi Lintas Tenant (Cross-Tenant)",
        description:
          "Algoritma pintar otomatis menawarkan minuman segar atau dessert dari stan mitra saat pengunjung memesan makanan berat.",
      },
      {
        title: "Kasir POS Cepat 3 Detik",
        description:
          "Pedagang stan dapat memproses pesanan langsung maupun tunai dengan sangat cepat melalui antarmuka kasir yang intuitif.",
      },
    ],
    stats: [
      { value: "3x", label: "Kecepatan Layanan Pesanan" },
      { value: "-65%", label: "Waktu Tunggu Antrean" },
      { value: "+34%", label: "Tambahan Omzet via Cross-Selling" },
    ],
    tags: [
      "Peta Lokasi Interaktif",
      "Pemesanan Online",
      "Cross-Tenant Recommendation",
      "Auto-Rekonsiliasi",
    ],
    ctaText: "Terapkan untuk Bazaar Anda",
    ctaHref: "/auth/sign-up?role=association",
  },
  {
    id: "food-court",
    badge: "Area Kuliner Terpusat",
    title: "Food Court Modern & Pujasera",
    roleBadge: "Operasional Multi-Tenant Harian",
    summary:
      "Tingkatkan kepuasan pengunjung dengan satu keranjang belanja untuk aneka stan berbeda, pembayaran terpadu, dan pembagian komisi otomatis kepada pengelola dan tenant.",
    painPoints: [
      "Pelanggan harus memesan dan mengantre berulang kali di kasir terpisah jika ingin makan dari tenant berbeda.",
      "Pengelola repot menghitung porsi komisi dan sewa berbasis bagi hasil dari puluhan pedagang setiap akhir hari.",
      "Ketiadaan data konsumsi pengunjung menghambat optimalisasi variasi tenant di dalam pujasera.",
    ],
    capabilities: [
      {
        title: "Keranjang Belanja Multi-Tenant",
        description:
          "Satu pesanan dapat menampung menu dari stan mie, stan minuman, dan stan dessert sekaligus dalam 1 kali transaksi pembayaran.",
      },
      {
        title: "Pembagian Omzet Otomatis (Auto-Split)",
        description:
          "Hasil pembayaran langsung terdistribusi secara otomatis sesuai rasio komisi pengelola dan porsi hak masing-masing pedagang.",
      },
      {
        title: "Sinkronisasi Status Meja & Pesanan",
        description:
          "Pengunjung cukup duduk di meja, memindai barcode meja, dan pesanan diteruskan langsung ke dapur masing-masing stan.",
      },
      {
        title: "Laporan Performa Tenant Terpadu",
        description:
          "Dashboard pengelola menyajikan perbandingan omzet stan terlaris, jam-jam puncak, dan margin komisi harian secara transparan.",
      },
    ],
    stats: [
      { value: "1", label: "Checkout Terpadu Multi-Stan" },
      { value: "0 Menit", label: "Waktu Rekonsiliasi Komisi" },
      { value: "+28%", label: "Rata-rata Basket Size Belanja" },
    ],
    tags: [
      "Multi-Tenant Cart",
      "Auto-Split Settlement",
      "Scan Meja QR",
      "Analitik Pujasera",
    ],
    ctaText: "Modernisasi Food Court Anda",
    ctaHref: "/auth/sign-up?role=association",
  },
  {
    id: "pop-up-market",
    badge: "Event Komunitas & Kriya",
    title: "Pop-up Market & Pasar Kreatif",
    roleBadge: "Setup Kilat & Fleksibel",
    summary:
      "Platform fleksibel untuk event akhir pekan atau pasar kurasi kriya. Pendaftaran stan transparan, aktivasi kasir dalam 5 menit, dan kontrol inventori produk unik tanpa risiko overselling.",
    painPoints: [
      "Waktu setup booth sangat terbatas (sering kali hanya beberapa jam sebelum pembukaan), sulit menginstal kasir tradisional.",
      "Pendaftaran dan kurasi stan sering berantakan karena dilakukan via chat atau spreadsheet manual.",
      "Produk handmade dan karya terbatas sering kali terjual ganda karena pencatatan stok tidak akurat di jam ramai.",
    ],
    capabilities: [
      {
        title: "Aktivasi Stan Instan via QR",
        description:
          "Kreator cukup masuk melalui browser ponsel atau tablet, dan stan langsung siap melayani transaksi QRIS dan tunai.",
      },
      {
        title: "Manajemen Slot & Kurasi Tenant",
        description:
          "Pengelola membuka pendaftaran booth digital, mengelompokkan kategori karya, dan menentukan nomor titik booth pada layout visual.",
      },
      {
        title: "Pelacakan Stok Real-Time",
        description:
          "Setiap item yang terjual langsung memotong sisa persediaan di katalog digital untuk mencegah komplain pembeli.",
      },
      {
        title: "Etalase & Profil Kreator Digital",
        description:
          "Pengunjung dapat melihat latar belakang brand lokal, cerita karya, dan tautan sosial media tiap pengrajin yang berpameran.",
      },
    ],
    stats: [
      { value: "< 5 Mnt", label: "Waktu Aktivasi Stan" },
      { value: "100%", label: "Akurasi Stok Real-Time" },
      { value: "Zero", label: "Kabel & Hardware Khusus" },
    ],
    tags: [
      "Aktivasi Kilat",
      "Etalase Kreator",
      "Stok Real-Time",
      "Manajemen Booth",
    ],
    ctaText: "Mulai untuk Pop-up Market",
    ctaHref: "/auth/coming-soon",
  },
  {
    id: "sentra-umkm",
    badge: "Kawasan Komersial Permanen",
    title: "Sentra UMKM & Kawasan Kampus",
    roleBadge: "Kemitraan Jangka Panjang",
    summary:
      "Berdayakan paguyuban pedagang dengan tata kelola profesional. Pencatatan arus kas otomatis bagi pedagang kecil dan sistem penagihan sewa stan digital yang tertib bagi asosiasi.",
    painPoints: [
      "Pembukuan pedagang UMKM sering tercampur antara uang pribadi dan kas modal stan.",
      "Pengelola kesulitan mendata kepatuhan iuran bulanan stan dan retribusi fasilitas umum.",
      "Minimnya data transaksi membuat pedagang sulit mengajukan pembiayaan usaha maupun evaluasi perkembangan stan.",
    ],
    capabilities: [
      {
        title: "Pencatatan Keuangan Sederhana",
        description:
          "Pedagang dapat langsung melihat total pemasukan harian, riwayat transaksi, dan keuntungan bersih tanpa istilah akuntansi yang rumit.",
      },
      {
        title: "Manajemen Sewa & Tagihan Berkala",
        description:
          "Sistem menerbitkan invoice sewa digital dengan pengingat otomatis, mencegah tunggakan stan dan menjaga arus kas pengelola.",
      },
      {
        title: "Direktori & Layanan Stan Kampus",
        description:
          "Mahasiswa dan civitas kampus dapat mencari tenant fotokopi, makanan, hingga jasa secara cepat dari portal direktori kawasan.",
      },
      {
        title: "Wawasan Pertumbuhan Komunitas",
        description:
          "Asosiasi pengelola memiliki data komprehensif mengenai produk yang paling diminati untuk menentukan program pembinaan UMKM.",
      },
    ],
    stats: [
      { value: "99.2%", label: "Ketepatan Waktu Iuran Stan" },
      { value: "Otomatis", label: "Pembukuan Kas Harian" },
      { value: "+40%", label: "Visibilitas Tenant Baru" },
    ],
    tags: [
      "Sewa Digital",
      "Pembukuan UMKM",
      "Portal Direktori",
      "Laporan Asosiasi",
    ],
    ctaText: "Daftarkan Kawasan UMKM",
    ctaHref: "/auth/sign-up?role=association",
  },
];

export const SOLUTIONS_IMPACT: ImpactPillar[] = [
  {
    title: "Operasional Super Cepat",
    description:
      "Pangkas waktu antre transaksi dan pemesanan hingga hitungan detik dengan alur kasir POS dan pemesanan mandiri via smartphone.",
    metric: "3x",
    metricLabel: "Perputaran Pesanan",
    iconName: "zap",
  },
  {
    title: "Peningkatan Omzet Bersama",
    description:
      "Fitur rekomendasi lintas tenant mendorong pembeli mengeksplorasi makanan, minuman, dan camilan dari berbagai stan di satu area.",
    metric: "+32%",
    metricLabel: "Kenaikan Nilai Keranjang",
    iconName: "trending-up",
  },
  {
    title: "Tata Kelola Transparan",
    description:
      "Rekonsiliasi transaksi, bagi hasil, dan sewa booth dicatat secara otomatis dalam laporan yang dapat diakses pengelola dan pedagang.",
    metric: "100%",
    metricLabel: "Otomasi Rekonsiliasi",
    iconName: "shield-check",
  },
  {
    title: "Kenyamanan Pengunjung",
    description:
      "Peta denah interaktif mempermudah pengunjung menemukan lokasi stan favorit dan melihat katalog menu tanpa kebingungan.",
    metric: "4.9/5",
    metricLabel: "Skor Kepuasan Pembeli",
    iconName: "users",
  },
];

export const SOLUTIONS_CTA = {
  badge: "Siap Berkolaborasi?",
  headline: "Siap mengubah kawasan komersial Anda menjadi lebih cerdas dan terintegrasi?",
  subline:
    "Bergabunglah dengan ratusan pengelola dan pelaku UMKM yang telah merasakan kemudahan tata kelola tenant modern bersama Tenantify.",
  primaryCta: {
    label: "Daftar Sekarang",
    href: "/auth/sign-up",
  },
  secondaryCta: {
    label: "Masuk ke Akun",
    href: "/auth/sign-in",
  },
};
