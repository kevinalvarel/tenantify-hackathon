import { GridCross } from "@/components/landing/ui/grid-cross";
import { StripedPattern } from "@/components/landing/ui/stripped-background";
import { STEPS } from "@/lib/product-content";

export function ProductSteps() {
  return (
    <section
      id="cara-kerja"
      className="relative z-10 border-t border-foreground/15"
    >
      <StripedPattern
        className="pointer-events-none absolute inset-0 z-0 text-foreground/20"
        direction="right"
      />

      <div className="relative z-10 mx-auto max-w-7xl overflow-hidden border-x border-foreground/15 bg-background py-16 md:py-24">
        <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />

        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 md:px-16">
          <h2 className="text-left text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Tiga langkah, dari daftar sampai pesanan masuk
          </h2>
          <p className="mt-3 max-w-xl text-left leading-loose text-muted-foreground text-base md:text-lg">
            Tidak ada alat baru yang harus Anda pelajari. Mulai dari{" "}
            <span className="text-pill">mendaftarkan tenant</span>, lalu
            lengkapi katalog, dan pesanan akan masuk ke dashboard yang sama.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-foreground/15 bg-foreground/15 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col bg-background p-8 md:p-10"
            >
              <span
                className="flex size-10 items-center justify-center rounded-full border border-foreground/20 font-mono text-sm font-medium text-primary"
                aria-hidden
              >
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground md:text-xl">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}