"use client";

import {
  Building2,
  Store,
  ShoppingBag,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { GridCross } from "@/components/landing/ui/grid-cross";
import { StripedPattern } from "@/components/landing/ui/stripped-background";
import { SERVICE_SYNERGY } from "@/lib/landing/service-content";

export function ServiceSynergy() {
  const renderStepIcon = (iconName: string) => {
    switch (iconName) {
      case "building":
        return <Building2 className="size-5 text-primary" aria-hidden="true" />;
      case "store":
        return <Store className="size-5 text-primary" aria-hidden="true" />;
      case "shopping-bag":
        return (
          <ShoppingBag className="size-5 text-primary" aria-hidden="true" />
        );
      case "sparkles":
      default:
        return <Sparkles className="size-5 text-primary" aria-hidden="true" />;
    }
  };

  return (
    <section
      id="sinergi"
      className="relative z-10 border-t border-foreground/15"
    >
      <StripedPattern className="pointer-events-none absolute inset-0 z-0 text-foreground/15" />

      <div className="relative z-10 mx-auto max-w-7xl overflow-hidden border-x border-foreground/15 bg-background px-4 py-16 md:px-16 md:py-24">
        <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />

        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            <span>Alur Operasional Terintegrasi</span>
          </div>

          <h2 className="mt-4 font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-5xl">
            {SERVICE_SYNERGY.headline}
          </h2>

          <p className="mt-2 text-sm font-medium text-primary md:text-base">
            {SERVICE_SYNERGY.tagline}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {SERVICE_SYNERGY.description}
          </p>
        </div>

        {/* 4 Connected Synergy Step Cards */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_SYNERGY.steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    {renderStepIcon(step.iconName)}
                  </span>
                  <span className="font-mono text-sm font-bold text-muted-foreground/60">
                    {step.number}
                  </span>
                </div>

                <div className="mt-4 inline-block rounded-md bg-muted px-2 py-0.5 text-[0.7rem] font-semibold text-foreground uppercase tracking-wider">
                  {step.role}
                </div>

                <h3 className="mt-2 font-sans text-base font-bold text-foreground">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {step.detail}
                </p>
              </div>

              {index < SERVICE_SYNERGY.steps.length - 1 && (
                <div className="mt-4 hidden items-center justify-end text-xs font-semibold text-primary lg:flex">
                  <ArrowRight
                    className="size-4 opacity-50 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
