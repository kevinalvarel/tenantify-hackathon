"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CloudShader } from "@/components/ui/cloud-shader";
import { HERO } from "@/lib/landing/product-content";

export function ProductHero() {
  return (
    <section
      id="produk"
      className="relative flex min-h-dvh w-full flex-col overflow-hidden"
    >
      <div>
        <CloudShader className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-20 text-center md:pt-32">
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-6xl lg:text-7xl">
          {HERO.headline}
        </h1>

        <p className="mt-6 max-w-2xl text-base text-white/90 drop-shadow-sm md:text-lg">
          {HERO.subline}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            render={<Link href={HERO.primaryCta.href} />}
            nativeButton={false}
          >
            {HERO.primaryCta.label}
          </Button>

          <Button
            variant="outline"
            render={<Link href={HERO.secondaryCta.href} />}
            nativeButton={false}
          >
            {HERO.secondaryCta.label}
          </Button>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-12 w-full max-w-6xl px-4 pb-4 md:mt-16 md:px-8">
        <div className="rounded-2xl border border-white/30 bg-white/20 p-2 shadow-2xl backdrop-blur-md md:rounded-[2rem] md:p-3 [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]">
          <Image
            src={HERO.image}
            alt={HERO.imageAlt}
            height={1080}
            width={1920}
            className="w-full rounded-xl border border-black/5 shadow-lg md:rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
}
