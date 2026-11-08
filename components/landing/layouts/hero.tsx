"use client";

import { CloudShader } from "@/components/ui/cloud-shader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <>
      <section id="hero" className="relative min-h-dvh w-full overflow-hidden">
        <div>
          <CloudShader className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />
        </div>

        {/* hero */}
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pt-20 text-center md:pt-32">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-6xl lg:text-7xl">
            Kembangkan Bisnis UMKM kamu dengan Tenant
            <span className="text-primary">ify</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base text-white/90 drop-shadow-sm md:text-lg">
            Tenantify membantu Pengelola UMKM mengelola tenant, manajemen
            produk, dan hal-hal lain dalam satu sistem sederhana yang dibangun
            untuk bisnis modern.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button render={<Link href="/auth/sign-up" />} nativeButton={false}>
              Mulai Sekarang
            </Button>

            <Button
              variant="outline"
              render={<Link href="/auth/sign-in" />}
              nativeButton={false}
            >
              Masuk ke Akun
            </Button>
          </div>

          <p className="mt-4 text-xs text-white/70">
            Setup mudah &middot; Dibuat untuk bisnis modern
          </p>
        </div>

        {/* dashboard image */}
        <div className="relative z-10 mx-auto mt-12 w-full max-w-6xl px-4 pb-4 md:mt-16 md:px-8">
          <div className="rounded-2xl border border-white/30 bg-white/20 p-2 shadow-2xl backdrop-blur-md md:rounded-[2rem] md:p-3 [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]">
            <Image
              src="/images/dashboard-seller.png"
              alt="Tenantify Seller Dashboard"
              height={1080}
              width={1920}
              className="
              w-full rounded-xl border border-black/5 shadow-lg
               md:rounded-3xl"
            />
          </div>
        </div>
      </section>
    </>
  );
}
