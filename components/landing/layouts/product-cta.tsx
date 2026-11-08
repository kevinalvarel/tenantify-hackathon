"use client";

import Link from "next/link";

import DotGrid from "@/components/landing/ui/dot-grid";
import { StripedPattern } from "@/components/landing/ui/stripped-background";
import { Button } from "@/components/ui/button";
import { CTA } from "@/lib/product-content";

export function ProductCta() {
  return (
    <section id="cta" className="relative z-10 border-t border-foreground/15">
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
              {CTA.headline}
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">
              {CTA.body}
            </p>

            <Button
              size="lg"
              nativeButton={false}
              className="mt-8 h-auto rounded-xl border-2 border-primary px-8 py-5 text-lg transition-colors hover:border-foreground hover:text-primary"
              render={<Link href={CTA.button.href} />}
            >
              {CTA.button.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}