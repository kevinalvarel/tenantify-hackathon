"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  Building2,
  MapPin,
  ArrowRight,
  RefreshCw,
  LogIn,
  UtensilsCrossed,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { useCustomer } from "@/context/customer-context";
import { CustomerHeroBanner } from "@/components/customer/customer-hero-banner";
import { QuickCategoryBar } from "@/components/customer/quick-category-bar";
import { ProductExplorer } from "@/components/customer/product-explorer";
import { FeaturedTenantsSection } from "@/components/customer/featured-tenants-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SAMPLE_CODES = [
  {
    code: "5S5CTP",
    name: "Paguyuban Cilegon Juare",
    type: "Paguyuban Multi-UMKM",
    desc: "8 Tenant • Bebek Madura, Kevin Kebab, Ayam Geprek, dll.",
  },
  {
    code: "KEB001",
    name: "Kevin Kebab & Burger",
    type: "Stan UMKM",
    desc: "Kebab panggang daging sapi premium & burger juicy",
  },
  {
    code: "BBK001",
    name: "Bebek Madura Cak Munir",
    type: "Stan UMKM",
    desc: "Bebek & ayam goreng bumbu hitam Madura",
  },
  {
    code: "KOP001",
    name: "UMKM Kopi Kita",
    type: "Stan UMKM",
    desc: "Kopi nikmat dan minuman segar",
  },
  {
    code: "PGY001",
    name: "Paguyuban Nusantara",
    type: "Paguyuban 4 Tenant",
    desc: "Bebek Madura, Ayam Juara, Mie Aceh, Sate Maranggi",
  },
];

export default function CustomerExplorePage() {
  const {
    products,
    tenants,
    addToCart,
    selectedCategory,
    setSelectedCategory,
    activeUmkm,
    leaveUmkm,
    joinUmkmByCode,
  } = useCustomer();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("all");
  const [isJoiningSample, setIsJoiningSample] = useState<string | null>(null);

  const handleSelectSample = async (sampleCode: string) => {
    setIsJoiningSample(sampleCode);
    await joinUmkmByCode(sampleCode);
    setIsJoiningSample(null);
  };

  // -------------------------------------------------------------
  // STATE 1: JIKA BELUM JOIN UMKM -> SEMBUNYIKAN MENU & TAMPILKAN JOIN HERO
  // -------------------------------------------------------------
  if (!activeUmkm) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-full min-w-0 py-2 sm:py-4">
        {/* Banner Promo Tetap Terlihat di Layar Tablet/Desktop */}
        <section aria-label="Promo Utama Hari Ini" className="hidden sm:block">
          <CustomerHeroBanner />
        </section>

        {/* Hero Card: Wajib Masukkan Kode Unik (Navigasi Join) */}
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/95 p-6 sm:p-10 shadow-xl shadow-black/5 text-center flex flex-col items-center">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#c85a32] via-[#e57342] to-amber-500" />

          {/* Badge Pengenal */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c85a32]/10 text-[#c85a32] text-xs font-bold uppercase tracking-wider mb-4">
            <Layers className="size-3.5" />
            <span>Sistem Multi-UMKM & Paguyuban</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight max-w-2xl leading-tight">
            Pesan Menu Langsung dari UMKM Pilihanmu
          </h1>

          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
            Tenantify menampung berbagai paguyuban dan stan UMKM kuliner. Daftar
            menu disesuaikan dengan lokasi UMKM yang kamu tuju.
            <strong className="block text-neutral-900 dark:text-white font-semibold mt-1">
              Silakan masukkan Kode Unik stan/paguyuban untuk melihat menu hidangan.
            </strong>
          </p>

          {/* NAVIGASI JOIN: Tombol Utama ke Halaman Join */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/join"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-full bg-[#c85a32] hover:bg-[#b34a24] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#c85a32]/25 transition-all transform hover:-translate-y-0.5 active:scale-95 select-none"
            >
              <LogIn className="size-5 shrink-0" />
              <span>Masukkan Kode Unik (Join)</span>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          </div>

          {/* Shortcut: Coba Kode Sample Langsung */}
          <div className="mt-8 pt-6 border-t border-neutral-200/80 dark:border-neutral-800 w-full max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Atau coba langsung kode contoh berikut:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-left">
              {SAMPLE_CODES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectSample(item.code)}
                  disabled={isJoiningSample !== null}
                  className="group flex flex-col p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-[#c85a32] bg-neutral-50/60 dark:bg-neutral-800/40 hover:bg-[#c85a32]/5 transition-all cursor-pointer text-left active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-xs font-extrabold text-[#c85a32] bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700">
                      {item.code}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      {item.type}
                    </Badge>
                  </div>
                  <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 mt-1.5 group-hover:text-[#c85a32] transition-colors truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3 Keunggulan Fitur Paguyuban */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mt-8 pt-6 border-t border-neutral-200/80 dark:border-neutral-800 text-left">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30">
              <Store className="size-5 text-[#c85a32] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold text-neutral-900 dark:text-white">
                  Multi-UMKM Terpusat
                </h2>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Setiap UMKM & paguyuban memiliki kode unik tersendiri.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30">
              <UtensilsCrossed className="size-5 text-[#c85a32] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold text-neutral-900 dark:text-white">
                  Menu Khusus Sesuai UMKM
                </h2>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Hanya menampilkan menu otentik milik UMKM yang kamu tuju.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30">
              <ShieldCheck className="size-5 text-[#c85a32] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold text-neutral-900 dark:text-white">
                  Notifikasi Real-Time
                </h2>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Lacak proses pesanan dari persiapan hingga siap diambil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  // -------------------------------------------------------------
  // STATE 2: SUDAH JOIN UMKM -> TAMPILKAN MENU SPESIFIK UMKM INI
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full min-w-0">
      {/* Active UMKM Location Header Bar */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        <div className="w-full rounded-2xl sm:rounded-3xl border border-[#c85a32]/30 bg-gradient-to-r from-[#c85a32]/10 via-amber-500/5 to-white dark:to-neutral-900 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="size-11 sm:size-12 rounded-2xl bg-[#c85a32] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#c85a32]/20">
              {activeUmkm.type === "paguyuban" ? (
                <Building2 className="size-6" />
              ) : (
                <Store className="size-6" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight truncate">
                  {activeUmkm.name}
                </h1>
                <Badge className="bg-[#c85a32] text-white text-[10px] font-bold uppercase border-none px-2 py-0.5">
                  {activeUmkm.type === "paguyuban"
                    ? "Paguyuban Multi-UMKM"
                    : "Stan UMKM Kuliner"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                <span className="font-mono font-bold text-[#c85a32]">
                  Kode: {activeUmkm.code}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 text-neutral-400 shrink-0" />
                  {activeUmkm.location || "Area Food Court"}
                </span>
                <span>•</span>
                <span
                  className={
                    products.length > 0
                      ? "font-semibold text-emerald-600 dark:text-emerald-400"
                      : "font-semibold text-amber-600 dark:text-amber-400"
                  }
                >
                  {products.length > 0
                    ? `${products.length} Menu Siap Dipesan`
                    : "Belum Ada Menu"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: Ganti UMKM / Kode Lain */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={leaveUmkm}
              className="rounded-full text-xs font-semibold gap-1.5 h-8 sm:h-9 hover:border-[#c85a32] hover:text-[#c85a32] transition-colors"
            >
              <RefreshCw className="size-3.5" />
              <span>Ganti UMKM</span>
            </Button>
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-full text-xs font-semibold gap-1.5 h-8 sm:h-9 px-3.5 bg-[#c85a32] hover:bg-[#b34a24] text-white shadow-xs transition-colors"
            >
              <LogIn className="size-3.5" />
              <span>Kode Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Banner Carousel (hidden on smartphones, visible on sm and up) */}
      <section aria-label="Promo Utama Hari Ini" className="hidden sm:block">
        <CustomerHeroBanner />
      </section>

      {/* Food Category Bar (Filtered to this UMKM's products) */}
      <QuickCategoryBar
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Main Product Explorer: Displays ONLY products matching active UMKM */}
      <div id="customer-product-explorer" className="w-full">
        <ProductExplorer
          products={products}
          tenants={tenants}
          onAddToCart={addToCart}
          selectedTenantId={selectedTenantId}
          onSelectTenant={setSelectedTenantId}
        />
      </div>

      {/* Featured Tenants Section for this UMKM / Paguyuban */}
      {tenants.length > 1 && (
        <FeaturedTenantsSection
          onSelectTenant={(tenantId) => setSelectedTenantId(tenantId)}
        />
      )}
    </div>
  );
}
