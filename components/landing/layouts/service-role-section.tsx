"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight, ImageOff } from "lucide-react";

import { GridCross } from "@/components/landing/ui/grid-cross";
import { StripedPattern } from "@/components/landing/ui/stripped-background";
import { Button } from "@/components/ui/button";
import { SERVICE_ROLES, type ServiceRole } from "@/lib/landing/service-content";
import { cn } from "@/lib/utils";

function ServicePreviewShot({ role }: { role: ServiceRole }) {
  const { preview } = role;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-md md:p-5">
      {/* Metric Callout Badge */}
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <span className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider">
            {preview.metricLabel}
          </span>
          <p className="font-sans text-xl font-bold tracking-tight text-primary">
            {preview.metricValue}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 font-sans text-xs font-semibold text-primary">
          {role.roleName}
        </span>
      </div>

      {preview.src ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-inner">
          <Image
            src={preview.src}
            alt={preview.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
            priority={false}
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-background text-muted-foreground shadow-xs">
            <ImageOff className="size-6 text-primary" aria-hidden="true" />
          </span>
          <div>
            <p className="font-sans text-sm font-bold text-foreground">
              {preview.alt}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {preview.expectedPath}
            </p>
          </div>
          <p className="max-w-xs text-xs text-muted-foreground">
            Pratinjau antarmuka riil akan tampil otomatis setelah tangkapan
            layar ditambahkan.
          </p>
        </div>
      )}
    </div>
  );
}

export function ServiceRoleSection() {
  return (
    <div className="relative w-full">
      {SERVICE_ROLES.map((role, index) => {
        const isEven = index % 2 === 1;

        return (
          <section
            key={role.id}
            id={role.id}
            className="relative z-10 border-t border-foreground/15"
          >
            <StripedPattern
              className="pointer-events-none absolute inset-0 z-0 text-foreground/15"
              direction={isEven ? "right" : "left"}
            />

            <div className="relative z-10 mx-auto max-w-7xl overflow-hidden border-x border-foreground/15 bg-background px-4 py-16 md:px-16 md:py-24">
              <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
              <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />
              <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
              <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />

              <div
                className={cn(
                  "grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16",
                  isEven &&
                    "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1",
                )}
              >
                {/* Text Content Column */}
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                    <span
                      className="size-1.5 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <span>{role.badge}</span>
                  </div>

                  <h2 className="mt-4 font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                    {role.headline}
                  </h2>

                  <p className="mt-2 font-sans text-sm font-medium text-primary md:text-base">
                    {role.tagline}
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {role.description}
                  </p>

                  {/* 5 Specific Capabilities */}
                  <div className="mt-8">
                    <h3 className="font-sans text-xs font-bold text-foreground uppercase tracking-wider">
                      5 Kapabilitas Utama Layanan {role.roleName}:
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {role.capabilities.map((cap, capIdx) => (
                        <li
                          key={capIdx}
                          className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/60 p-3.5 transition-colors hover:border-primary/40 hover:bg-card"
                        >
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Check className="size-3.5" aria-hidden="true" />
                          </span>
                          <div>
                            <strong className="block text-sm font-semibold text-foreground">
                              {cap.title}
                            </strong>
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                              {cap.description}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button
                      size="lg"
                      nativeButton={false}
                      className="h-auto rounded-xl px-6 py-3.5 font-sans text-sm font-semibold shadow-xs"
                      render={<Link href={role.cta.href} />}
                    >
                      <span>{role.cta.label}</span>
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>

                    {role.secondaryCta && (
                      <Button
                        variant="secondary"
                        size="lg"
                        nativeButton={false}
                        className="h-auto rounded-xl border border-border px-5 py-3.5 font-sans text-sm font-medium"
                        render={<Link href={role.secondaryCta.href} />}
                      >
                        {role.secondaryCta.label}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Preview Column */}
                <div className="lg:col-span-5">
                  <ServicePreviewShot role={role} />
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
