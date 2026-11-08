import { GridCross } from "@/components/landing/ui/grid-cross";
import { StripedPattern } from "@/components/landing/ui/stripped-background";
import MagicBento from "@/components/landing/ui/magic-bento";

export function UsageSection() {
  return (
    <section id="usage" className="relative border-t border-foreground/15 z-10">
      <StripedPattern className="pointer-events-none absolute inset-0 z-0 text-foreground/20" />

      <div className="relative z-10 bg-background mx-auto max-w-7xl overflow-hidden md:border-x border-foreground/15 min-h-dvh">
        <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />

        <div className="mx-auto justify-cente max-w-7xl py-16 md:py-16">
          <main className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            {/* Left Grid */}
            <div className="mx-auto max-w-2xl px-16 md:px-24">
              <h2 className="text-left text-4xl font-bold leading-tight tracking-tight text-foreground ">
                Kurangi cara Tradisional. Ayo beralih menggunakan Tenant
                <span className="text-primary">ify</span>
              </h2>
            </div>
            {/* Right Grid */}
            <div className="mx-auto max-w-2xl px-16 md:px-24">
              <p className="mt-3 max-w-xl text-left leading-loose text-muted-foreground text-base md:text-lg">
                Tenantify hadir sebagai solusi untuk para organisasi{" "}
                <span className="text-pill">Pengelola UMKM</span>
                atau <span className="text-pill">UMKM</span> itu sendiri dalam
                mengelola tenant.
              </p>
            </div>
            <MagicBento
              className="col-span-2"
              columns={4}
              rowHeight={200}
              gap={12}
              radius={20}
              enableBorderGlow
              enableSpotlight
              spotlightRadius={300}
              clickEffect
              enableStars={false}
              particleCount={24}
              enableTilt={false}
              enableMagnetism={false}
              textAutoHide
              intro
            />
          </main>
        </div>
      </div>
    </section>
  );
}
