import FaqDrawer from "@/components/landing/ui/faq-drawers";
import { StripedPattern } from "../ui/stripped-background";
import { GridCross } from "../ui/grid-cross";

export function FaqsSection() {
  return (
    <section id="about" className="z-10 relative border-t border-foreground/15">
      {/* Pattern melebar ke luar border container */}
      <StripedPattern className="pointer-events-none absolute inset-0 z-0 text-foreground/20" />

      <div className="relative z-10 bg-background mx-auto max-w-7xl overflow-hidden md:border-x border-foreground/15 h-dvh grid place-items-center">
        <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />
        <FaqDrawer style={{ flex: 1 }} />
      </div>
    </section>
  );
}
