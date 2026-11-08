"use client";

import { Zap, TrendingUp, ShieldCheck, Users } from "lucide-react";
import { GridCross } from "@/components/landing/ui/grid-cross";
import { StripedPattern } from "@/components/landing/ui/stripped-background";
import { SOLUTIONS_IMPACT } from "@/lib/landing/solutions-content";

export function SolutionsImpact() {
  const getImpactIcon = (iconName: string) => {
    switch (iconName) {
      case "zap":
        return <Zap className="size-5 text-primary" aria-hidden="true" />;
      case "trending-up":
        return (
          <TrendingUp className="size-5 text-primary" aria-hidden="true" />
        );
      case "shield-check":
        return (
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
        );
      case "users":
        return <Users className="size-5 text-primary" aria-hidden="true" />;
      default:
        return <Zap className="size-5 text-primary" aria-hidden="true" />;
    }
  };

  return (
    <section
      id="solusi-impact"
      className="relative z-10 border-t border-foreground/15"
    >
      <StripedPattern className="pointer-events-none absolute inset-0 z-0 text-foreground/20" />

      <div className="relative z-10 mx-auto max-w-7xl overflow-hidden border-foreground/15 bg-background py-16 md:border-x md:py-24">
        <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />

        <div className="px-6 text-center md:px-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-semibold text-primary">
            <span>Dampak Nyata</span>
          </div>

          <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Hasil Terukur untuk Ekosistem Usaha Anda
          </h2>

          <p className="mx-auto mt-4 max-w-2xl font-serif text-base text-muted-foreground md:text-lg">
            Teknologi Tenantify dirancang bukan sekadar untuk mendigitalkan
            proses, namun untuk melipatgandakan kepuasan belanja dan efisiensi
            kawasan secara terukur.
          </p>

          {/* 4 Pillars Grid */}
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS_IMPACT.map((pillar, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 text-left shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      {getImpactIcon(pillar.iconName)}
                    </span>
                    <span className="font-sans text-2xl font-extrabold tracking-tight text-primary">
                      {pillar.metric}
                    </span>
                  </div>

                  <p className="mt-1 text-right font-sans text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider">
                    {pillar.metricLabel}
                  </p>

                  <h3 className="mt-4 font-sans text-lg font-bold text-foreground">
                    {pillar.title}
                  </h3>

                  <p className="mt-2 font-serif text-xs leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-border/60 pt-3">
                  <span className="font-sans text-[0.7rem] font-medium text-primary">
                    Pilar Keunggulan #{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
