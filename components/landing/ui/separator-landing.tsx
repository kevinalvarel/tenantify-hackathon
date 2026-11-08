import { GridCross } from "@/components/landing/ui/grid-cross";
import { StripedPattern } from "@/components/landing/ui/stripped-background";

export function SeparatorLanding({ id = "about" }: { id?: string }) {
  return (
    <section id={id} className="relative border-t border-foreground/15 z-10">
      {/* Pattern melebar ke luar border container */}
      <StripedPattern
        className="pointer-events-none absolute inset-0 z-0 text-primary "
        direction="left"
      />

      <div className="relative z-10 mx-auto max-w-7xl overflow-hidden md:border-x border-foreground/15 h-[16dvh] bg-background">
        <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />
        <StripedPattern
          className="pointer-events-none absolute inset-0 z-0 stroke-[0.3] text-primary"
          direction="right"
        />
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
      </div>
    </section>
  );
}