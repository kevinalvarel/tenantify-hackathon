"use client";

import Link from "next/link";

import DotGrid from "@/components/landing/ui/dot-grid";
import { StripedPattern } from "@/components/landing/ui/stripped-background";
import { Button } from "@/components/ui/button";
import { SERVICE_CTA } from "@/lib/landing/service-content";

export function ServiceCta() {
  return (
    <section
      id="service-cta"
      className="relative z-10 border-t border-foreground/15"
    >
      <StripedPattern
        className="pointer-events-none absolute inset-0 z-0 text-foreground/20"
        direction="left"
      />

      <div className="relative z-10 mx-auto max-w-7xl border-x border-foreground/15 bg-background px-4 py-16 md:px-16 md:py-24">
        <div className="relative isolate overflow-hidden rounded-4xl border border-foreground/15 px-6 py-16 text-center md:py-24">
          <div className="absolute inset-0 z-0">
            <DotGrid
              baseColor="#3d3929"
              activeColor="#ffffff"
              shape="circle"
              dotSize={5}
              gap={18}
              proximity={140}
              strength={1}
              bounce={0.6}
              tension={0.4}
              returnDuration={0.8}
              shockRadius={320}
              shockStrength={5}
              swell={0.8}
              stretch={0.5}
              glow={0.5}
              fade={0}
              opacity={0.15}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {SERVICE_CTA.headline}
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground text-sm md:text-lg">
              {SERVICE_CTA.subline}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                nativeButton={false}
                className="h-auto rounded-xl px-8 py-4 font-sans text-base font-semibold shadow-md"
                render={<Link href={SERVICE_CTA.primaryCta.href} />}
              >
                {SERVICE_CTA.primaryCta.label}
              </Button>

              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                className="h-auto rounded-xl border border-border bg-card/80 px-7 py-4 font-sans text-base font-semibold text-foreground hover:bg-card hover:text-foreground"
                render={<Link href={SERVICE_CTA.secondaryCta.href} />}
              >
                {SERVICE_CTA.secondaryCta.label}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
