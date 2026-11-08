"use client";

import { cn } from "@/lib/utils";
import TechText from "@/components/ui/TechText";

export function RecommendationSlider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden select-none flex items-center justify-center h-36 sm:h-44 md:h-52 lg:h-60 bg-transparent",
        className
      )}
    >
      {/* TechText interactive wordmark component: Black 'TENANT' and Orange 'IFY' on transparent background */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <TechText
          text="TENANTIFY"
          fontWeight={900}
          fontSize={150}
          letterSpacing={-0.02}
          color="#171717"
          accentColor="#c96442"
          reveal="letter"
          dashLength={4}
          dashGap={2}
          specks={15}
          intro="none"
          clickKick
          draggable
          selection
          sweep
          speed={1}
          guides={false}
        />
      </div>
    </div>
  );
}

export const TixBannerSlider = RecommendationSlider;
