"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { GridCross } from "@/components/landing/ui/grid-cross";
import { ProductShot } from "@/components/landing/ui/product-shot";
import { StripedPattern } from "@/components/landing/ui/stripped-background";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/product-content";
import RubberSegment from "@/components/RubberSegment";

export function ProductRoles() {
  const [activeRoleId, setActiveRoleId] = useState(ROLES[0].id);

  const activeRole = ROLES.find((r) => r.id === activeRoleId) ?? ROLES[0];

  return (
    <section id="peran" className="relative z-10 border-t border-foreground/15">
      <StripedPattern className="pointer-events-none absolute inset-0 z-0 text-foreground/20" />

      <div className="relative z-10 mx-auto max-w-7xl overflow-hidden border-x border-foreground/15 bg-background py-16 md:py-24">
        <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />

        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 md:px-16">
          <h2 className="text-left text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            <span className="text-pill font-bold">Satu</span> platform, tiga
            cara memakainya
          </h2>
          <p className="mt-3 max-w-xl text-left leading-loose text-muted-foreground text-base md:text-lg">
            Pilih peran Anda di bawah ini.{" "}
            <span className="text-pill">Association</span>,{" "}
            <span className="text-pill">Seller</span>, dan{" "}
            <span className="text-pill">Consumer</span> memakai Tenantify dengan
            cara yang berbeda, dan semuanya berada dalam satu sistem yang sama.
          </p>
        </div>

        <div className="mt-10 w-full flex-col px-4 md:px-16">
          <div className="scrollbar-none flex w-full justify-start overflow-x-auto pb-1 md:justify-center">
            <RubberSegment
              aria-label="Pilih peran pengguna Tenantify"
              items={ROLES.map((role) => ({
                value: role.id,
                label: role.label,
              }))}
              value={activeRoleId}
              onChange={(value) => setActiveRoleId(value)}
              trackColor="#ede9de"
              thumbColor="#c96442"
              textColor="#3d3929"
              activeTextColor="#fafafa"
              size="md"
              radius={10}
              inset={3}
              equalSlots
              stretch={100}
              squash={3}
              speed={1}
              glide={75}
              draggable
            />
          </div>

          <div
            key={activeRole.id}
            className="mt-10 text-base outline-none animate-in fade-in-50 duration-300"
          >
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {activeRole.headline}
                </h3>

                <ul className="mt-6 space-y-3">
                  {activeRole.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <Check
                        className="mt-1 size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span className="text-sm leading-relaxed text-muted-foreground md:text-base">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  className="mt-8 h-auto rounded-full px-5 py-3 text-sm"
                  render={<Link href={activeRole.ctaHref} />}
                  nativeButton={false}
                >
                  {activeRole.ctaLabel}
                </Button>
              </div>

              <ProductShot shot={activeRole.shot} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
