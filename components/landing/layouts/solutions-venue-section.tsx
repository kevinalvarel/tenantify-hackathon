"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
  ShoppingBag,
  Building2,
  QrCode,
  CalendarCheck,
} from "lucide-react";

import { GridCross } from "@/components/landing/ui/grid-cross";
import { StripedPattern } from "@/components/landing/ui/stripped-background";
import { Button } from "@/components/ui/button";
import { VENUE_SOLUTIONS } from "@/lib/solutions-content";
import { cn } from "@/lib/utils";

/** Simulated Visual Preview Card for Bazaar & Festival */
function BazaarPreviewCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="size-4" />
          </span>
          <div>
            <p className="font-sans text-xs font-bold text-foreground">
              Denah Interaktif & Rekomendasi
            </p>
            <p className="font-sans text-[0.68rem] text-muted-foreground">
              Bazaar Fest Senayan &bull; 24 Stan Aktif
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold text-emerald-700 dark:text-emerald-400">
          Live Tracking
        </span>
      </div>

      {/* Interactive Map Visual */}
      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-background/90 p-3.5">
        <div className="flex items-center justify-between text-[0.7rem] font-semibold text-muted-foreground">
          <span>ZONA A - KULINER NUSANTARA</span>
          <span className="text-primary">Tap stan untuk menu</span>
        </div>

        {/* Booth grid map */}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center rounded-lg border border-primary/40 bg-primary/5 p-2 text-center transition-colors">
            <span className="font-sans text-xs font-bold text-primary">A-01</span>
            <span className="text-[0.65rem] font-medium text-foreground truncate max-w-[80px]">
              Sate Maranggi
            </span>
            <span className="mt-1 rounded bg-primary/15 px-1.5 py-0.2 text-[0.55rem] font-semibold text-primary">
              Antrean 3 mnt
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/60 p-2 text-center">
            <span className="font-sans text-xs font-bold text-muted-foreground">A-02</span>
            <span className="text-[0.65rem] font-medium text-foreground truncate max-w-[80px]">
              Nasi Liwet Solo
            </span>
            <span className="mt-1 rounded bg-secondary px-1.5 py-0.2 text-[0.55rem] font-semibold text-muted-foreground">
              Antrean 5 mnt
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg border border-primary/40 bg-primary/5 p-2 text-center">
            <span className="font-sans text-xs font-bold text-primary">A-03</span>
            <span className="text-[0.65rem] font-medium text-foreground truncate max-w-[80px]">
              Es Cendol Durian
            </span>
            <span className="mt-1 rounded bg-emerald-500/15 px-1.5 py-0.2 text-[0.55rem] font-semibold text-emerald-700 dark:text-emerald-400">
              Siap Ambil
            </span>
          </div>
        </div>

        {/* Cross-Tenant Smart Callout */}
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/10 p-2.5">
          <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
          <div className="text-[0.7rem]">
            <p className="font-sans font-bold text-primary">
              Smart Cross-Tenant Recommendation
            </p>
            <p className="font-serif text-muted-foreground">
              Pengunjung memesan <strong>Sate Maranggi (Stan A-01)</strong>. Sistem otomatis merekomendasikan <strong>Es Cendol (Stan A-03)</strong> dengan diskon bundle!
            </p>
          </div>
        </div>
      </div>

      {/* Metric snapshot */}
      <div className="grid grid-cols-3 gap-2 border-t border-border/70 pt-2 text-center">
        <div>
          <span className="font-sans text-xs font-bold text-primary">3x Lebih Cepat</span>
          <p className="text-[0.65rem] text-muted-foreground">Proses Pesanan</p>
        </div>
        <div>
          <span className="font-sans text-xs font-bold text-primary">-65%</span>
          <p className="text-[0.65rem] text-muted-foreground">Waktu Tunggu</p>
        </div>
        <div>
          <span className="font-sans text-xs font-bold text-primary">+34%</span>
          <p className="text-[0.65rem] text-muted-foreground">Cross-Selling</p>
        </div>
      </div>
    </div>
  );
}

/** Simulated Visual Preview Card for Food Court */
function FoodCourtPreviewCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShoppingBag className="size-4" />
          </span>
          <div>
            <p className="font-sans text-xs font-bold text-foreground">
              Unified Multi-Tenant Cart
            </p>
            <p className="font-sans text-[0.68rem] text-muted-foreground">
              Meja 14 &bull; 1 Kali Checkout Digital
            </p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold text-primary">
          Auto Split Payment
        </span>
      </div>

      <div className="space-y-2 rounded-xl border border-border/80 bg-background/90 p-3.5">
        <div className="flex items-center justify-between text-[0.7rem] font-semibold text-muted-foreground">
          <span>PESANAN GABUNGAN (3 STAN)</span>
          <span className="text-primary font-bold">1 Transaksi QRIS</span>
        </div>

        {/* Items */}
        <div className="space-y-1.5 text-[0.72rem]">
          <div className="flex items-center justify-between rounded-md bg-card/80 px-2.5 py-1.5">
            <div>
              <p className="font-sans font-semibold text-foreground">Bakmi Ayam Jamur</p>
              <p className="text-[0.62rem] text-muted-foreground">Stan #02: Bakmi Master</p>
            </div>
            <span className="font-sans font-bold text-foreground">Rp 38.000</span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-card/80 px-2.5 py-1.5">
            <div>
              <p className="font-sans font-semibold text-foreground">Kopi Susu Gula Aren</p>
              <p className="text-[0.62rem] text-muted-foreground">Stan #08: Kopi Seduh</p>
            </div>
            <span className="font-sans font-bold text-foreground">Rp 20.000</span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-card/80 px-2.5 py-1.5">
            <div>
              <p className="font-sans font-semibold text-foreground">Pisang Goreng Madu</p>
              <p className="text-[0.62rem] text-muted-foreground">Stan #11: Camilan Legit</p>
            </div>
            <span className="font-sans font-bold text-foreground">Rp 17.000</span>
          </div>
        </div>

        <div className="mt-2 border-t border-border/80 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Total Pembayaran</span>
            <span className="text-primary">Rp 75.000</span>
          </div>
          <p className="mt-1 font-serif text-[0.65rem] text-muted-foreground">
            Sistem otomatis mendistribusikan dana ke masing-masing saldo stan dan memotong komisi pengelola secara instan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border/70 pt-2 text-center">
        <div>
          <span className="font-sans text-xs font-bold text-primary">1 Checkout</span>
          <p className="text-[0.65rem] text-muted-foreground">Multi-Stan</p>
        </div>
        <div>
          <span className="font-sans text-xs font-bold text-primary">0 Menit</span>
          <p className="text-[0.65rem] text-muted-foreground">Rekonsiliasi</p>
        </div>
        <div>
          <span className="font-sans text-xs font-bold text-primary">+28%</span>
          <p className="text-[0.65rem] text-muted-foreground">Basket Size</p>
        </div>
      </div>
    </div>
  );
}

/** Simulated Visual Preview Card for Pop-up Market */
function PopUpPreviewCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <QrCode className="size-4" />
          </span>
          <div>
            <p className="font-sans text-xs font-bold text-foreground">
              Aktivasi Booth & Stok Real-Time
            </p>
            <p className="font-sans text-[0.68rem] text-muted-foreground">
              Creative Weekend Market &bull; Booth #09
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold text-emerald-700 dark:text-emerald-400">
          Siap Jual &bull; 02:40 mnt
        </span>
      </div>

      <div className="space-y-2 rounded-xl border border-border/80 bg-background/90 p-3.5">
        <div className="flex items-center justify-between text-[0.7rem] font-semibold text-muted-foreground">
          <span>ETALASE PRODUK ARTISAN</span>
          <span className="text-primary">Sync Otomatis</span>
        </div>

        <div className="space-y-1.5 text-[0.72rem]">
          <div className="flex items-center justify-between rounded-md bg-card/80 px-2.5 py-1.5">
            <div>
              <p className="font-sans font-semibold text-foreground">Tote Bag Kanvas Lukis</p>
              <p className="text-[0.62rem] text-muted-foreground">Sisa Stok: 4 buah</p>
            </div>
            <span className="rounded bg-primary/15 px-2 py-0.5 font-sans text-[0.62rem] font-bold text-primary">
              Tersedia
            </span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-card/80 px-2.5 py-1.5">
            <div>
              <p className="font-sans font-semibold text-foreground">Lilin Aromaterapi Lavender</p>
              <p className="text-[0.62rem] text-muted-foreground">Sisa Stok: 1 buah</p>
            </div>
            <span className="rounded bg-amber-500/15 px-2 py-0.5 font-sans text-[0.62rem] font-bold text-amber-700 dark:text-amber-400">
              Hampir Habis
            </span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-card/80 px-2.5 py-1.5">
            <div>
              <p className="font-sans font-semibold text-foreground">Cangkir Keramik Handmade</p>
              <p className="text-[0.62rem] text-muted-foreground">Sisa Stok: 0 buah</p>
            </div>
            <span className="rounded bg-muted px-2 py-0.5 font-sans text-[0.62rem] font-bold text-muted-foreground">
              Habis Terjual
            </span>
          </div>
        </div>

        <p className="mt-2 font-serif text-[0.65rem] text-muted-foreground">
          Kreator cukup memindai QR registrasi dari ponsel untuk mengaktifkan kasir, tanpa memerlukan perangkat keras tambahan.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border/70 pt-2 text-center">
        <div>
          <span className="font-sans text-xs font-bold text-primary">&lt; 5 Menit</span>
          <p className="text-[0.65rem] text-muted-foreground">Setup Stan</p>
        </div>
        <div>
          <span className="font-sans text-xs font-bold text-primary">100%</span>
          <p className="text-[0.65rem] text-muted-foreground">Akurasi Stok</p>
        </div>
        <div>
          <span className="font-sans text-xs font-bold text-primary">Zero</span>
          <p className="text-[0.65rem] text-muted-foreground">Kabel/Hardware</p>
        </div>
      </div>
    </div>
  );
}

/** Simulated Visual Preview Card for Sentra UMKM */
function SentraPreviewCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </span>
          <div>
            <p className="font-sans text-xs font-bold text-foreground">
              Pembukuan Kas & Tata Kelola Sewa
            </p>
            <p className="font-sans text-[0.68rem] text-muted-foreground">
              Sentra Niaga UMKM &bull; Kios #18
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold text-emerald-700 dark:text-emerald-400">
          Sewa Lunas
        </span>
      </div>

      <div className="space-y-2 rounded-xl border border-border/80 bg-background/90 p-3.5">
        <div className="flex items-center justify-between text-[0.7rem] font-semibold text-muted-foreground">
          <span>RINGKASAN OPERASIONAL BULANAN</span>
          <span className="text-primary font-bold">Periode Oktober</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[0.72rem]">
          <div className="rounded-lg bg-card/80 p-2.5">
            <span className="text-[0.62rem] text-muted-foreground uppercase">Omzet Masuk</span>
            <p className="font-sans text-sm font-bold text-foreground">Rp 14.850.000</p>
            <span className="text-[0.6rem] font-semibold text-emerald-600 dark:text-emerald-400">
              &uarr; 18% dari bln lalu
            </span>
          </div>

          <div className="rounded-lg bg-card/80 p-2.5">
            <span className="text-[0.62rem] text-muted-foreground uppercase">Sewa & Retribusi</span>
            <p className="font-sans text-sm font-bold text-primary">Rp 1.500.000</p>
            <span className="text-[0.6rem] font-semibold text-muted-foreground">
              Jatuh Tempo: Tgl 01
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-2 text-[0.68rem]">
          <CalendarCheck className="size-3.5 text-primary shrink-0" />
          <span className="font-serif text-muted-foreground">
            Invoice digital bulan depan telah dikirim otomatis kepada pengelola dan pedagang.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border/70 pt-2 text-center">
        <div>
          <span className="font-sans text-xs font-bold text-primary">99.2%</span>
          <p className="text-[0.65rem] text-muted-foreground">Ketertiban Sewa</p>
        </div>
        <div>
          <span className="font-sans text-xs font-bold text-primary">Otomatis</span>
          <p className="text-[0.65rem] text-muted-foreground">Laporan Kas</p>
        </div>
        <div>
          <span className="font-sans text-xs font-bold text-primary">+40%</span>
          <p className="text-[0.65rem] text-muted-foreground">Retensi Tenant</p>
        </div>
      </div>
    </div>
  );
}

function renderVenuePreview(venueId: string) {
  switch (venueId) {
    case "bazaar-festival":
      return <BazaarPreviewCard />;
    case "food-court":
      return <FoodCourtPreviewCard />;
    case "pop-up-market":
      return <PopUpPreviewCard />;
    case "sentra-umkm":
      return <SentraPreviewCard />;
    default:
      return <BazaarPreviewCard />;
  }
}

export function SolutionsVenueSection() {
  const [activeTab, setActiveTab] = useState<string>("bazaar-festival");

  return (
    <section id="solusi-venue" className="relative z-10 border-t border-foreground/15">
      {/* Background patterned stripes */}
      <StripedPattern className="pointer-events-none absolute inset-0 z-0 text-foreground/20" />

      <div className="relative z-10 mx-auto max-w-7xl overflow-hidden border-foreground/15 bg-background md:border-x">
        <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />

        {/* Section Header */}
        <div className="px-6 pt-16 pb-10 text-center md:px-12 md:pt-24 md:pb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-semibold text-primary">
            <span>Dirancang Khusus untuk Model Bisnis Anda</span>
          </div>

          <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Solusi Berdasarkan Lingkungan Operasional
          </h2>

          <p className="mx-auto mt-4 max-w-3xl font-serif text-base text-muted-foreground md:text-xl">
            Setiap area komersial memiliki pola transaksi dan tantangan tersendiri. Telusuri bagaimana Tenantify memberikan solusi presisi untuk meningkatkan pengalaman pengunjung dan profitabilitas tenant.
          </p>

          {/* Interactive quick filter tabs */}
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2 p-1.5">
            {VENUE_SOLUTIONS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveTab(v.id)}
                className={cn(
                  "cursor-pointer rounded-xl px-4 py-2 font-sans text-xs font-semibold transition-all duration-200 md:text-sm",
                  activeTab === v.id
                    ? "bg-primary text-white shadow-sm"
                    : "border border-border/80 bg-card/60 text-foreground/80 hover:bg-card hover:text-foreground",
                )}
              >
                {v.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sequential Venue Narrative Sections */}
        <div className="divide-y divide-border/80">
          {VENUE_SOLUTIONS.map((venue) => {
            const isHighlighted = activeTab === venue.id;

            return (
              <div
                key={venue.id}
                id={venue.id}
                className={cn(
                  "relative scroll-mt-24 px-6 py-14 transition-colors duration-500 md:px-12 md:py-20",
                  isHighlighted ? "bg-card/30" : "bg-transparent",
                )}
              >
                <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
                  {/* Left Column: Narrative, Pain Points, and Capabilities */}
                  <div className="space-y-6 lg:col-span-7">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-full bg-primary/10 px-3 py-1 font-sans text-xs font-bold text-primary">
                        {venue.badge}
                      </span>
                      <span className="rounded-full border border-border bg-card px-2.5 py-0.5 font-sans text-xs font-medium text-muted-foreground">
                        {venue.roleBadge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-sans text-2xl font-bold tracking-tight text-foreground md:text-4xl">
                        {venue.title}
                      </h3>
                      <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground md:text-lg">
                        {venue.summary}
                      </p>
                    </div>

                    {/* Problem vs Solution Split */}
                    <div className="space-y-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 md:p-5">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-destructive uppercase">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>Tantangan Utama di Lapangan (Sebelum Tenantify)</span>
                      </div>
                      <ul className="space-y-2">
                        {venue.painPoints.map((pain, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 font-serif text-xs text-foreground/80 md:text-sm"
                          >
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive/60" />
                            <span>{pain}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* How Tenantify Solves It (Capabilities) */}
                    <div className="space-y-3">
                      <h4 className="font-sans text-sm font-bold tracking-wider text-foreground uppercase">
                        Fitur & Solusi yang Tenantify Sediakan
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {venue.capabilities.map((cap, capIdx) => (
                          <div
                            key={capIdx}
                            className="rounded-xl border border-border bg-card p-3.5 shadow-2xs transition-shadow hover:shadow-xs"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="size-4 shrink-0 text-primary" />
                              <h5 className="font-sans text-xs font-bold text-foreground">
                                {cap.title}
                              </h5>
                            </div>
                            <p className="mt-1.5 font-serif text-xs leading-relaxed text-muted-foreground">
                              {cap.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {venue.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 font-sans text-[0.7rem] font-medium text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="pt-2">
                      <Button
                        render={<Link href={venue.ctaHref} />}
                        nativeButton={false}
                        className="px-5 py-2.5 text-sm"
                      >
                        {venue.ctaText}
                        <ArrowRight className="ml-1.5 size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: Live Simulated Interface Card */}
                  <div className="sticky top-24 lg:col-span-5">
                    <div className="relative">
                      {renderVenuePreview(venue.id)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
