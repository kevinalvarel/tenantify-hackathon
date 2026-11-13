"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  UtensilsCrossed,
  Receipt,
  ShoppingBag,
  User,
  LogIn,
} from "lucide-react";
import { useCustomer } from "@/context/customer-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function CustomerBottomNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const { cartItemCount, activeOrdersCount, setIsCartOpen, isCartOpen, activeUmkm } =
    useCustomer();
  const [scrollSection, setScrollSection] = useState<"beranda" | "menu">(
    "beranda",
  );

  useEffect(() => {
    if (pathname !== "/") return;

    const handleScroll = () => {
      const explorerEl = document.getElementById("customer-product-explorer");
      if (!explorerEl) return;
      const rect = explorerEl.getBoundingClientRect();
      if (rect.top <= 180) {
        setScrollSection("menu");
      } else {
        setScrollSection("beranda");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  if (!isMobile || isCartOpen) return null;

  const isHomeActive = pathname === "/" && scrollSection === "beranda";
  const isMenuActive = pathname === "/" && scrollSection === "menu";
  const isOrdersActive = pathname.startsWith("/orders");
  const isProfileActive = pathname.startsWith("/profile");

  const handleBerandaClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setScrollSection("beranda");
    } else {
      router.push("/");
    }
  };

  const handleMenuClick = () => {
    if (!activeUmkm) {
      router.push("/join");
      return;
    }
    if (pathname === "/" || pathname === "/customer") {
      const explorerEl = document.getElementById("customer-product-explorer");
      if (explorerEl) {
        explorerEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setScrollSection("menu");
    } else {
      router.push("/customer#customer-product-explorer");
    }
  };

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800/80 px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-4 max-w-md mx-auto w-full items-center">
        {/* 1. Beranda */}
        <button
          type="button"
          onClick={handleBerandaClick}
          className={cn(
            "min-h-[48px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer",
            isHomeActive
              ? "text-[#c85a32] font-semibold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
          )}
          aria-label="Kembali ke Beranda"
        >
          <Home className="size-5 stroke-[2]" />
          <span className="text-[11px] leading-none mt-1">Beranda</span>
        </button>

        {/* 2. Menu atau Join */}
        <button
          type="button"
          onClick={handleMenuClick}
          className={cn(
            "min-h-[48px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer",
            isMenuActive || (!activeUmkm && pathname.includes("/join"))
              ? "text-[#c85a32] font-semibold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
          )}
          aria-label={activeUmkm ? "Pilihan Menu Makanan" : "Join UMKM"}
        >
          {activeUmkm ? (
            <>
              <UtensilsCrossed className="size-5 stroke-[2]" />
              <span className="text-[11px] leading-none mt-1">Menu</span>
            </>
          ) : (
            <>
              <LogIn className="size-5 stroke-[2]" />
              <span className="text-[11px] leading-none mt-1">Join</span>
            </>
          )}
        </button>

        {/* 3. Pesanan */}
        <Link
          href="/orders"
          className={cn(
            "min-h-[48px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 select-none",
            isOrdersActive
              ? "text-[#c85a32] font-semibold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
          )}
          aria-label="Riwayat Pesanan Saya"
        >
          <div className="relative">
            <Receipt className="size-5 stroke-[2]" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2.5 flex size-4 items-center justify-center rounded-full bg-[#c85a32] text-[9px] font-bold text-white shadow-xs">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-none mt-1">Pesanan</span>
        </Link>

        {/* 4. Keranjang */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="min-h-[48px] flex flex-col items-center justify-center py-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all active:scale-95 cursor-pointer"
          aria-label="Buka Keranjang Belanja"
        >
          <div className="relative">
            <ShoppingBag className="size-5 stroke-[2]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-2.5 flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-[#c85a32] text-[9px] font-bold text-white shadow-xs">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-none mt-1">Keranjang</span>
        </button>
        {/* 5. Profile */}
        <Link
          href="/profile"
          className={cn(
            "min-h-[48px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 select-none",
            isProfileActive
              ? "text-[#c85a32] font-semibold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
          )}
          aria-label="Profil Akun Saya"
        >
          <div className="relative">
            <User className="size-5 stroke-[2]" />
          </div>
          <span className="text-[11px] leading-none mt-1">Akun</span>
        </Link>
      </div>
    </nav>
  );
}
