"use client";

import { ShoppingBag } from "lucide-react";
import { useCustomer } from "@/context/customer-context";
import { formatRupiah, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function CustomerFloatingCart() {
  const { cartItemCount, cartTotal, setIsCartOpen, isCartOpen } = useCustomer();

  // Sembunyikan floating button saat drawer keranjang sedang terbuka
  if (isCartOpen) return null;

  return (
    <aside
      aria-label="Floating Keranjang Belanja"
      className={cn(
        "fixed z-40 transition-all duration-300",
        // Di mobile (< md): muncul di atas bottom navigation (bottom-20) jika ada item belanja
        // Di desktop (>= md): selalu terlihat di pojok kanan bawah (bottom-8 right-8)
        cartItemCount > 0
          ? "bottom-20 right-4 md:bottom-8 md:right-8 flex"
          : "bottom-8 right-8 hidden md:flex"
      )}
    >
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-full font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 shadow-[0_8px_30px_rgba(200,90,50,0.35)] hover:shadow-[0_12px_40px_rgba(200,90,50,0.5)] border border-white/20 hover:-translate-y-1 bg-[#c85a32] hover:bg-[#b34a24] text-white",
          cartItemCount > 0
            ? "px-4 sm:px-5 py-3 sm:py-3.5"
            : "px-3.5 sm:px-4 py-2.5 sm:py-3"
        )}
        aria-label={`Buka Keranjang (${cartItemCount} item)`}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <ShoppingBag className="size-5 sm:size-5.5 stroke-[2.2] transition-transform group-hover:scale-110 text-white" />
          {cartItemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2.5 -right-3 flex size-5 p-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-sm border border-white animate-bounce"
            >
              {cartItemCount}
            </Badge>
          )}
        </div>

        <div className="flex flex-col items-start text-left leading-tight">
          <span className="text-xs sm:text-[13px] font-bold tracking-tight">
            Keranjang {cartItemCount > 0 ? `(${cartItemCount})` : "(0)"}
          </span>
          {cartItemCount > 0 && (
            <span className="text-[11px] sm:text-xs font-semibold text-white/90">
              {formatRupiah(cartTotal)}
            </span>
          )}
        </div>
      </button>
    </aside>
  );
}
