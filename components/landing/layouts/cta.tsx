"use client";

import { StripedPattern } from "../ui/stripped-background";
import DotGrid from "../ui/dot-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const CTASection = () => {
  return (
    <section id="cta" className="relative border-foreground/15 h-dvh z-10">
      <StripedPattern
        className="pointer-events-none absolute inset-0 z-0 text-foreground/20"
        direction="left"
      />
      <div className="relative z-10 mx-auto max-w-7xl min-h-dvh bg-background border-x border-foreground/15">
        <div className="flex min-h-dvh w-full flex-col justify-center py-16 md:py-24">
          <main className="relative overflow-hidden grid h-[24rem] w-full grid-cols-1 gap-6 rounded-4xl border-y border-foreground/15">
            <div className="absolute inset-0 -z-10">
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

            <div className="mt-24 flex flex-col items-center justify-center text-center ">
              <h1 className="text-5xl font-medium">Kita punya Solusinya</h1>
              <p className="mt-3 max-w-xl block text-muted-foreground text-center text-lg">
                Tidak perlu lagi pusing memikirkan tagihan, customer, dan
                operasional. Semua sudah terpusat dalam 1 dashboard
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                nativeButton={false}
                className="py-5 px-4 rounded-xl border-2 border-primary hover:border-foreground hover:text-primary transition-colors text-lg font-architech-daughter hover:cursor-pointer"
                render={<Link href="/auth/sign-in" />}
              >
                Mulai Sekarang
              </Button>
            </div>

            <div className="mt-24 mx-auto max-w-screen-sm overflow-hidden">
              <div className="bg-accent/10 rounded-[2rem] p-[0.25rem]">
                <div className="h-96 rounded-[1.75rem] bg-muted"></div>
              </div>
            </div>

            <div className="h-24"></div>
          </main>
        </div>
      </div>
    </section>
  );
};
