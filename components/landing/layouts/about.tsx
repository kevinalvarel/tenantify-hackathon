import { GridCross } from "@/components/landing/ui/grid-cross";
import { StripedPattern } from "@/components/landing/ui/stripped-background";
import { CardBorder } from "../ui/card-border";

export interface SolutionItemType {
  icon: string;
  body: string;
}

const item: SolutionItemType[] = [
  {
    icon: "/icons/tenantify.png",
    body: "Calon UMKM dapat menemukan lokasi tenant yang sesuai dengan kriteria UMKM.",
  },
  {
    icon: "/icons/tenantify.png",
    body: "Pantau stok dan penjualan item atau manajemen barang secara cepat pada pemilik UMKM",
  },
  {
    icon: "/icons/tenantify.png",
    body: "Pesan makanan dari mana saja, kapan saja, dan dari tenant kesukaan kamu",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="z-10 relative border-t border-foreground/15">
      {/* Pattern melebar ke luar border container */}
      <StripedPattern className="pointer-events-none absolute inset-0 z-0 text-foreground/20" />

      <div className="relative z-10 bg-background mx-auto max-w-7xl overflow-hidden md:border-x border-foreground/15 h-dvh grid place-items-center">
        <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />

        <main className="mx-auto justify-center max-w-7xl space-y-16">
          {/* Header */}
          <header className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto px-16 md:px-24">
            {/* Left Grid */}
            <div className="mx-auto max-w-2xl p-5">
              <h2 className="text-left text-5xl font-bold leading-tight tracking-tight text-foreground ">
                Berikut ini alasan kenapa kamu harus mencoba Tenant
                <span className="text-primary">ify</span>
              </h2>
            </div>
            {/* Right Grid */}
            <div className="mx-auto max-w-xl p-5 mt-5">
              <p className="mt-3 max-w-xl text-left leading-loose text-muted-foreground text-base md:text-xl">
                Tenantify mampu memberikan kemudahan bagi para{" "}
                <span className="text-pill">Pengelola UMKM</span> dalam
                mengelola Tenant yang sesuai dengan kriteria UMKM.
              </p>
            </div>
          </header>
          <CardBorder SOLUTIONS={item} />
        </main>
      </div>
    </section>
  );
}
