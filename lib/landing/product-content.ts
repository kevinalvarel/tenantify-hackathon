export type ProductShot = {
  /** Set when the screenshot has been supplied. URL relative, with a leading slash. */
  src?: string;
  /** Set when the screenshot is still missing. The file the engineer is expected to add. */
  expectedPath?: string;
  /** Always required. Describes the content of the image for screen readers. */
  alt: string;
};

export type ProductRole = {
  id: string;
  label: string;
  headline: string;
  /** Exactly five entries per role, each traceable to docs/PRD.MD or a screen under /dashboard. */
  bullets: [string, string, string, string, string];
  shot: ProductShot;
  ctaLabel: string;
  ctaHref: string;
};

export type ProductStep = {
  title: string;
  body: string;
};

export const PRODUCT_META = {
  title: "Produk Tenantify: Kelola Tenant, Katalog, dan Pesanan dalam Satu Sistem",
  description:
    "Tenantify menyatukan association, seller, dan consumer dalam satu platform: kelola tenant, susun katalog dan stok, terima pesanan online maupun di tenant, dan pantau semuanya dari satu dashboard.",
  canonicalPath: "/product",
};

export const HERO = {
  headline: "Semua yang tenant Anda butuhkan, dalam satu sistem",
  subline:
    "Tenantify menyatukan pengelola area, pemilik tenant, dan pengunjung. Kelola tenant, susun katalog, terima pesanan online maupun langsung di tenant, dari satu dashboard saja.",
  primaryCta: { label: "Mulai Sekarang", href: "/auth/sign-up" },
  secondaryCta: { label: "Masuk ke Akun", href: "/auth/sign-in" },
  image: "/images/landing/seller.png",
  imageAlt: "Dashboard Seller Tenantify",
};

export const ROLES: ProductRole[] = [
  {
    id: "association",
    label: "Association",
    headline: "Pengelola Bazaar atau Food Court",
    bullets: [
      "Kelola seluruh tenant yang berada di area Anda",
      "Setujui atau tolak pendaftaran tenant baru",
      "Tentukan tenant mana yang tampil di aplikasi",
      "Susun layout dan lokasi tenant pada peta area",
      "Pantau jumlah tenant aktif beserta status persetujuannya",
    ],
    shot: {
      src: "/images/landing/asso.png",
      alt: "Dashboard Association Tenantify",
    },
    ctaLabel: "Mulai sebagai Association",
    ctaHref: "/auth/sign-up",
  },
  {
    id: "seller",
    label: "Seller",
    headline: "Pemilik UMKM dengan satu atau beberapa tenant",
    bullets: [
      "Kelola semua tenant yang Anda miliki dari satu akun",
      "Susun katalog produk, harga, dan kategori menu",
      "Pantau stok barang dan diberi tahu saat stok menipis",
      "Terima dan proses pesanan yang masuk",
      "Jalankan kasir sendiri di tenant dan pantau pemasukan",
    ],
    shot: {
      src: "/images/landing/seller.png",
      alt: "Dashboard Seller Tenantify",
    },
    ctaLabel: "Mulai sebagai Seller",
    ctaHref: "/auth/sign-in",
  },
  {
    id: "consumer",
    label: "Consumer",
    headline: "Pengunjung yang mencari dan membeli",
    bullets: [
      "Temukan tenant Anda lewat Tenant Map",
      "Lihat seluruh menu tenant dalam satu katalog",
      "Dapatkan rekomendasi produk dari tenant lain",
      "Pesan dan bayar langsung tanpa mengantri",
      "Lihat riwayat pesanan Anda kapan saja",
    ],
    shot: {
      src: "/images/landing/customer.png",
      alt: "Dashboard Consumer Tenantify",
    },
    ctaLabel: "Mulai sebagai Consumer",
    ctaHref: "/",
  },
];

export const STEPS: ProductStep[] = [
  {
    title: "Buat akun dan pilih peran",
    body: "Daftar sekali, lalu pilih cara Anda memakai Tenantify: sebagai pengelola area, pemilik tenant, atau pengunjung.",
  },
  {
    title: "Susun tenant dan katalog",
    body: "Masukkan tenant yang Anda kelola, lalu isi produk, harga, dan stok supaya siap menerima pesanan.",
  },
  {
    title: "Terima dan kelola pesanan",
    body: "Pesanan masuk baik secara online maupun langsung di tenant, dan semuanya terlihat di dashboard yang sama.",
  },
];

export const CTA = {
  headline: "Siap digitalisasi area Anda?",
  body: "Mulai dari mendaftarkan tenant, lalu lengkapi katalog, stok, dan pesanan. Satu akun sudah cukup untuk mencoba seluruh alurnya.",
  button: { label: "Mulai Sekarang", href: "/auth/sign-up" },
};