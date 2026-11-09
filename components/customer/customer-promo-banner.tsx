"use client";

import { useState } from "react";
import {
  Tag,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export function CustomerPromoBanner() {
  const [copied, setCopied] = useState(false);
  const promoCode = "HEMATTENANT";

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    toast.success(`Kode promo "${promoCode}" berhasil disalin!`);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      id="promo-banner"
      aria-label="Voucher dan Promo Spesial"
      className="py-6 sm:py-8 max-w-7xl mx-auto w-full px-4 sm:px-6 my-2"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#c85a32] via-[#b34a24] to-[#1c1d1f] p-6 sm:p-10 text-white shadow-xl border border-white/20">
        {/* Ambient glow blobs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-black/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/30 shadow-sm">
              <Sparkles className="size-3.5 fill-white text-white" />
              VOUCHER DISKON PENGUNJUNG
            </span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
              Hemat s/d 50% untuk Pesanan Multi-Tenant Pertamamu!
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
              Gunakan kupon saat checkout. Berlaku untuk seluruh tenant makanan
              berat, minuman segar, dan camilan di food court Tenantify.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-white/90 font-medium">
              <div className="flex items-center gap-1.5">
                <Layers className="size-4 text-[#ffdbcf]" />
                <span>1 Keranjang Semua Tenant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-[#ffdbcf]" />
                <span>Tanpa Antre Berpindah Stall</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-[#ffdbcf]" />
                <span>Garansi Pesanan Akurat</span>
              </div>
            </div>
          </div>

          {/* Promo Code Box */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/30 shadow-lg">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Tag className="size-5 text-[#ffdbcf]" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-white/70 block">
                  KODE PROMO:
                </span>
                <span className="text-base sm:text-lg font-black tracking-widest text-white">
                  {promoCode}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#c85a32] hover:bg-neutral-100 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-600 stroke-[3]" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="size-4 stroke-[2.5]" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

