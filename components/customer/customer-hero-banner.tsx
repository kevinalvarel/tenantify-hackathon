"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Utensils,
  ArrowRight,
  Store,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Slide = {
  id: string;
  badge: string;
  title: string;
  description: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  cardTitle: string;
  cardHighlight: string;
  cardSubtext: string;
  icon: "flame" | "utensils" | "store";
};

const slides: Slide[] = [
  {
    id: "slide-1",
    badge: "PROMO SPESIAL HARI INI",
    title: "Pesta Kuliner Hemat Diskon s/d 50% + Cashback 40%!",
    description:
      "Gabungkan aneka hidangan lezat dan minuman segar pilihan dalam 1 pesanan kilat tanpa biaya antre meja.",
    primaryCtaText: "Klaim Promo Sekarang",
    primaryCtaHref: "#customer-product-explorer",
    secondaryCtaText: "Jelajahi Tenant",
    secondaryCtaHref: "#katering-section",
    cardTitle: "Aneka Menu Pilihan",
    cardHighlight: "Diskon s/d 50%",
    cardSubtext: "Pesan multi-tenant dalam 1 transaksi",
    icon: "flame",
  },
  {
    id: "slide-2",
    badge: "MULTI-TENANT ORDERING",
    title: "1 Meja, Aneka Rasa: Pesan Sekaligus Tanpa Antre!",
    description:
      "Bebas pilih hidangan utama, camilan renyah, dan minuman segar dari berbagai stan dalam satu checkout mudah.",
    primaryCtaText: "Jelajahi Tenant Favorit",
    primaryCtaHref: "#katering-section",
    secondaryCtaText: "Buka Denah Bazaar",
    secondaryCtaHref: "/customer/map",
    cardTitle: "Tenant Mitra Terpercaya",
    cardHighlight: "Antrean Kilat",
    cardSubtext: "Notifikasi siap ambil real-time",
    icon: "store",
  },
  {
    id: "slide-3",
    badge: "MENU PALING DICARI",
    title: "Nikmati Cita Rasa Autentik & Berkualitas",
    description:
      "Sensasi hidangan hangat dan resep terbaik langsung dimasak segar oleh stan mitra pilihan food court.",
    primaryCtaText: "Pesan Menu Terlaris",
    primaryCtaHref: "#customer-product-explorer",
    secondaryCtaText: "Lihat Semua Kategori",
    secondaryCtaHref: "#customer-product-explorer",
    cardTitle: "Rasa Terfavorit",
    cardHighlight: "Menu Pilihan",
    cardSubtext: "Ulasan terbaik dari para penikmat kuliner",
    icon: "utensils",
  },
];

export function CustomerHeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section
      aria-label="Promo Utama Food Court"
      className="pt-2 pb-2 px-2 sm:px-4 max-w-7xl mx-auto w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl border border-neutral-200/40 dark:border-neutral-800 bg-gradient-to-r from-[#c85a32] via-[#b34a24] to-[#1c1d1f] min-h-[460px] lg:min-h-[500px] flex items-center transition-all">
        {/* Subtle decorative background patterns */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-black/20 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between p-6 sm:p-10 lg:p-16 text-white gap-8 w-full z-10">
          {/* Left Column: Text & CTAs */}
          <div className="space-y-4 sm:space-y-5 max-w-2xl text-left">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white border border-white/30 shadow-sm">
              <Flame className="size-3.5 fill-white text-white animate-pulse" />
              {slide.badge}
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white transition-all duration-300">
              {slide.title}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-xl font-normal">
              {slide.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <a
                href={slide.primaryCtaHref}
                onClick={(e) => {
                  if (slide.primaryCtaHref.startsWith("#")) {
                    e.preventDefault();
                    const el = document.querySelector(slide.primaryCtaHref);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-[#c85a32] px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="size-4 sm:size-5" />
                <span>{slide.primaryCtaText}</span>
              </a>

              {slide.secondaryCtaHref.startsWith("#") ? (
                <a
                  href={slide.secondaryCtaHref}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.querySelector(slide.secondaryCtaHref);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    } else {
                      toast.info("Gunakan kode 'HEMATTENANT' untuk diskon 50% di keranjang!");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-full border border-white/30 transition-all font-semibold text-sm sm:text-base cursor-pointer"
                >
                  <span>{slide.secondaryCtaText}</span>
                  <ChevronRight className="size-4" />
                </a>
              ) : (
                <Link
                  href={slide.secondaryCtaHref}
                  className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-full border border-white/30 transition-all font-semibold text-sm sm:text-base cursor-pointer"
                >
                  <span>{slide.secondaryCtaText}</span>
                  <ChevronRight className="size-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Visual Preview Card */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <div className="w-72 h-52 sm:w-80 sm:h-60 lg:w-96 lg:h-72 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group">
              <div className="text-center p-6 space-y-3">
                <div className="size-16 sm:size-20 mx-auto rounded-full bg-white/20 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                  {slide.icon === "flame" && (
                    <Utensils className="size-8 sm:size-10 text-white" />
                  )}
                  {slide.icon === "store" && (
                    <Store className="size-8 sm:size-10 text-white" />
                  )}
                  {slide.icon === "utensils" && (
                    <Sparkles className="size-8 sm:size-10 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-white font-extrabold text-base sm:text-lg">
                    {slide.cardTitle}
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                    {slide.cardSubtext}
                  </p>
                </div>
                <div>
                  <span className="inline-block px-4 py-1.5 bg-white text-[#c85a32] rounded-full text-xs sm:text-sm font-extrabold shadow-md">
                    {slide.cardHighlight}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Slide Sebelumnya"
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 size-10 sm:size-12 rounded-full bg-white/80 hover:bg-white text-neutral-900 backdrop-blur-md shadow-lg flex items-center justify-center transition-all hover:scale-110 z-20 focus:outline-none cursor-pointer"
        >
          <ChevronLeft className="size-5 sm:size-6 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Slide Selanjutnya"
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 size-10 sm:size-12 rounded-full bg-white/80 hover:bg-white text-neutral-900 backdrop-blur-md shadow-lg flex items-center justify-center transition-all hover:scale-110 z-20 focus:outline-none cursor-pointer"
        >
          <ChevronRight className="size-5 sm:size-6 stroke-[2.5]" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Buka Slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx ? "w-9 bg-white shadow-sm" : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

