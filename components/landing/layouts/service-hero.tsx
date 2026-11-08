"use client";

import Link from "next/link";
import { ArrowDown, Building2, Store, ShoppingBag } from "lucide-react";

import { CloudShader } from "@/components/ui/cloud-shader";
import { SERVICE_HERO } from "@/lib/service-content";

export function ServiceHero() {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Association":
        return <Building2 className="size-5 text-primary" aria-hidden="true" />;
      case "Seller":
        return <Store className="size-5 text-primary" aria-hidden="true" />;
      case "Consumer":
        return (
          <ShoppingBag className="size-5 text-primary" aria-hidden="true" />
        );
      default:
        return <Store className="size-5 text-primary" aria-hidden="true" />;
    }
  };

  return (
    <section
      id="layanan-hero"
      aria-labelledby="service-hero-heading"
      className="relative flex min-h-[85vh] w-full flex-col justify-between overflow-hidden pt-24 pb-16 md:min-h-dvh md:pt-32 md:pb-24"
    >
      <div className="absolute inset-0 z-0">
        <CloudShader className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3.5 py-1 text-xs font-semibold text-white drop-shadow-sm backdrop-blur-md md:text-sm">
          <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
          <span>{SERVICE_HERO.badge}</span>
        </div>

        <h1
          id="service-hero-heading"
          className="mt-6 text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-6xl lg:text-7xl"
        >
          {SERVICE_HERO.headline}
        </h1>

        <p className="mt-6 max-w-3xl text-base text-white/90 drop-shadow-sm md:text-xl">
          {SERVICE_HERO.subline}
        </p>

        <div className="mt-8 flex flex-col items-center gap-2 text-xs font-medium text-white/80 drop-shadow-sm md:text-sm">
          <span>Pilih peran untuk langsung menuju rincian layanan:</span>
          <ArrowDown
            className="size-4 animate-bounce text-primary drop-shadow-sm"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-12 w-full max-w-6xl px-4 md:mt-16 md:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SERVICE_HERO.jumpAnchors.map((item) => (
            <Link
              key={item.targetId}
              href={`#${item.targetId}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/40 bg-white/70 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-white hover:shadow-md dark:border-border/60 dark:bg-card/70 dark:hover:bg-card"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    {getRoleIcon(item.role)}
                  </span>
                  <span className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.role}
                  </span>
                </div>
                <h2 className="mt-4 font-sans text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                  {item.label}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.summary}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span>Lihat Layanan</span>
                <span className="transition-transform duration-200 group-hover:translate-y-0.5">
                  ↓
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
