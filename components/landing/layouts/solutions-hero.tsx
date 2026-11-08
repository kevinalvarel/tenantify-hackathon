"use client";

import Link from "next/link";
import {
  ArrowDown,
  UtensilsCrossed,
  Store,
  Sparkles,
  Building2,
} from "lucide-react";

import { CloudShader } from "@/components/ui/cloud-shader";
import { Button } from "@/components/ui/button";
import { SOLUTIONS_HERO } from "@/lib/solutions-content";

export function SolutionsHero() {
  const getVenueIcon = (targetId: string) => {
    switch (targetId) {
      case "bazaar-festival":
        return <UtensilsCrossed className="size-5 text-primary" aria-hidden="true" />;
      case "food-court":
        return <Store className="size-5 text-primary" aria-hidden="true" />;
      case "pop-up-market":
        return <Sparkles className="size-5 text-primary" aria-hidden="true" />;
      case "sentra-umkm":
        return <Building2 className="size-5 text-primary" aria-hidden="true" />;
      default:
        return <Store className="size-5 text-primary" aria-hidden="true" />;
    }
  };

  return (
    <section
      id="solusi-hero"
      aria-labelledby="solutions-hero-heading"
      className="relative flex min-h-[85vh] w-full flex-col justify-between overflow-hidden pt-24 pb-16 md:min-h-dvh md:pt-32 md:pb-24"
    >
      {/* Background with CloudShader */}
      <div className="absolute inset-0 z-0">
        <CloudShader className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      {/* Main hero typography & CTAs */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3.5 py-1 text-xs font-semibold text-white drop-shadow-sm backdrop-blur-md md:text-sm">
          <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
          <span>{SOLUTIONS_HERO.badge}</span>
        </div>

        <h1
          id="solutions-hero-heading"
          className="mt-6 text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-6xl lg:text-7xl"
        >
          Solusi Digital Cerdas untuk Setiap Kawasan{" "}
          <span className="text-primary">Komersial</span>
        </h1>

        <p className="mt-6 max-w-3xl text-base text-white/90 drop-shadow-sm md:text-xl">
          {SOLUTIONS_HERO.subline}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            render={<Link href="#solusi-venue" />}
            nativeButton={false}
            className="px-6 py-2.5 text-base shadow-lg"
          >
            Lihat Solusi Sesuai Area
          </Button>
          <Button
            variant="outline"
            render={<Link href="/auth/sign-up" />}
            nativeButton={false}
            className="px-6 py-2.5 text-base"
          >
            Daftar Tenantify Sekarang
          </Button>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 text-xs font-medium text-white/80 drop-shadow-sm md:text-sm">
          <span>Pilih jenis kawasan Anda untuk menuju rincian solusi:</span>
          <ArrowDown
            className="size-4 animate-bounce text-primary drop-shadow-sm"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Quick Jump Venue Cards */}
      <div className="relative z-10 mx-auto mt-10 w-full max-w-6xl px-4 md:mt-14 md:px-8">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {SOLUTIONS_HERO.jumpAnchors.map((item) => (
            <Link
              key={item.targetId}
              href={`#${item.targetId}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/40 bg-white/75 p-4 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-white hover:shadow-md dark:border-border/60 dark:bg-card/75 dark:hover:bg-card"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    {getVenueIcon(item.targetId)}
                  </span>
                  <span className="rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.venueType}
                  </span>
                </div>
                <h3 className="mt-3 font-sans text-base font-bold text-foreground transition-colors group-hover:text-primary">
                  {item.label}
                </h3>
                <p className="mt-1 font-serif text-xs text-muted-foreground line-clamp-2">
                  {item.tagline}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span>Pelajari Solusi</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
