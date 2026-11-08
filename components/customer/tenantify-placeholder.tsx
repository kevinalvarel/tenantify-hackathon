"use client";

import { cn } from "@/lib/utils";

type TenantifyPlaceholderProps = {
  size?: "xs" | "sm" | "md" | "lg";
  subtitle?: string;
  className?: string;
};

export function TenantifyPlaceholder({
  size = "md",
  subtitle = "Bazaar Kuliner",
  className,
}: TenantifyPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-card to-primary/5 select-none transition-all duration-300",
        className
      )}
    >
      {/* Decorative ambient radial glow */}
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

      {/* Decorative accent top & bottom subtle borders */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />

      {/* Main Logo Text */}
      <div className="relative flex flex-col items-center justify-center text-center px-2">
        <span
          className={cn(
            "font-black tracking-widest uppercase transition-transform duration-300 group-hover:scale-105",
            size === "xs" && "text-[9px] tracking-tight leading-none",
            size === "sm" && "text-[11px] tracking-wider leading-none",
            size === "md" && "text-sm sm:text-base tracking-wider",
            size === "lg" && "text-2xl sm:text-3xl lg:text-4xl tracking-widest"
          )}
        >
          <span className="text-foreground">TENANT</span>
          <span className="text-primary">IFY</span>
        </span>
        {size !== "xs" && size !== "sm" && (
          <span
            className={cn(
              "font-bold uppercase tracking-widest text-primary/80",
              size === "lg" ? "text-xs mt-1.5" : "text-[9px] mt-0.5"
            )}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
