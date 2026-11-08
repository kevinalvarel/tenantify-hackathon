"use client";

import { ShoppingBag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

type CustomerHeaderProps = {
  cartItemCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  activeTenantCount?: number;
};

export function CustomerHeader({
  cartItemCount,
  cartTotal,
  onOpenCart,
  activeTenantCount = 0,
}: CustomerHeaderProps) {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 shadow-sm">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

        <div className="relative p-5 sm:p-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 max-w-xl">

            {/* Main headline */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                Jelajahi Rasa, Pesan
                <span className="text-primary"> Lintas Tenant</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-md">
                Pesan dari berbagai tenant dalam satu keranjang. Praktis, cepat, tanpa antre!
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {activeTenantCount} Tenant Aktif
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="size-3" />
                <span>Buka Sekarang</span>
              </div>
            </div>
          </div>

          {/* Cart CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={onOpenCart}
              size="lg"
              className="relative gap-2.5 px-5 shadow-md rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ShoppingBag className="size-4.5" />
              <span>Keranjang</span>
              {cartItemCount > 0 ? (
                <>
                  <span className="flex items-center justify-center size-5 rounded-full bg-primary-foreground/20 text-[11px] font-extrabold text-primary-foreground">
                    {cartItemCount}
                  </span>
                  <span className="hidden sm:inline text-xs text-primary-foreground/90">
                    • {formatRupiah(cartTotal)}
                  </span>
                </>
              ) : (
                <span className="text-xs opacity-70">(0)</span>
              )}

              {/* Cart bounce indicator */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
