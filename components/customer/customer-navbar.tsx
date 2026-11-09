"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Store,
  Building2,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Check,
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useCustomer } from "@/context/customer-context";
import { useSession } from "@/lib/auth/auth-client";
import { logout } from "@/servers/auth-server";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FoodTypeItem = {
  id: string;
  name: string;
  label: string;
  description: string;
  badge?: string;
  badgeColor?: string;
};

const foodTypes: FoodTypeItem[] = [
  {
    id: "paling-laris",
    name: "Paling Laris",
    label: "Paling Laris",
    description: "Menu favorit & bestseller pilihan terbanyak pengunjung",
    badge: "Hot",
    badgeColor: "bg-primary text-primary-foreground",
  },
  {
    id: "makanan-berat",
    name: "Makanan Berat",
    label: "Makanan Berat",
    description: "Aneka olahan nasi, lauk pauk, dan hidangan mengenyangkan",
  },
  {
    id: "makanan-ringan",
    name: "Makanan Ringan",
    label: "Makanan Ringan",
    description: "Pastry, camilan gurih, dan kudapan ringan lainnya",
  },
  {
    id: "minuman",
    name: "Minuman",
    label: "Minuman",
    description: "Kopi, teh, jus, dan aneka minuman segar",
  },
];

export function CustomerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const {
    cartItemCount,
    cartTotal,
    setIsCartOpen,
    activeOrdersCount,
    selectedCategory,
    setSelectedCategory,
  } = useCustomer();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [foodDropdownOpen, setFoodDropdownOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    // Hysteresis prevents flicker near the boundary
    if (latest > 25 && !isScrolled) {
      setIsScrolled(true);
    } else if (latest < 10 && isScrolled) {
      setIsScrolled(false);
    }
  });

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (scrollY.get() > 25) {
        setIsScrolled(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollY]);

  const user = session?.user;
  const userName = user?.name || "Pelanggan";
  const userEmail = user?.email || "customer@tenantify.id";
  const userAvatar = user?.image || undefined;

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "CU"
    );
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      const res = await logout();
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.push("/auth/sign-in");
      router.refresh();
    } catch {
      toast.error("Gagal keluar dari akun.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handler when user selects a food type from dropdown
  const handleSelectFoodType = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setFoodDropdownOpen(false);
    setMobileMenuOpen(false);

    toast.success(`Filter: Kategori "${categoryName}"`);

    if (pathname === "/customer") {
      const catalogEl = document.getElementById("explore-catalog");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      router.push("/customer");
    }
  };

  const isFoodTypeActive = foodTypes.some((f) => f.name === selectedCategory);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full flex flex-col items-center transition-[background-color,border-color,box-shadow,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isScrolled
          ? "pointer-events-none bg-transparent border-b-transparent px-3 sm:px-6"
          : "pointer-events-auto bg-white/95 dark:bg-[#0c0d12]/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 px-0 shadow-xs",
      )}
    >
      <motion.div
        initial={false}
        animate={{
          y: isScrolled ? 10 : 0,
          maxWidth: isScrolled ? "820px" : "1400px",
          borderRadius: isScrolled ? 9999 : 0,
          boxShadow: isScrolled
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)"
            : "0 0 0 0 rgba(0, 0, 0, 0)",
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 28,
          mass: 0.8,
        }}
        className={cn(
          "pointer-events-auto w-full flex items-center justify-between transition-[padding,gap,border-color,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md",
          isScrolled
            ? "p-1.5 sm:p-2 gap-2 sm:gap-4 lg:gap-6 border border-neutral-200/90 dark:border-neutral-800/90"
            : "px-4 sm:px-8 py-2.5 sm:py-3 gap-3 sm:gap-6 border-b border-neutral-200/80 dark:border-neutral-800 border-t-transparent border-x-transparent",
        )}
      >
        {/* Left: Brand Logo (Tanpa background hitam) */}
        <Link
          href="/customer"
          onClick={() => setSelectedCategory("Semua")}
          className="flex items-center shrink-0 transition-transform active:scale-95 group px-1 sm:px-1.5"
          aria-label="Tenantify Home"
        >
          <Image
            src="/icons/tenantify-logo.png"
            alt="Tenantify Logo"
            width={36}
            height={36}
            priority
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Center: Clean Title-Case Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
          {/* 1. Home */}
          <Link
            href="/customer"
            onClick={() => setSelectedCategory("Semua")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-colors select-none",
              pathname === "/customer" && selectedCategory === "Semua"
                ? "text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-800"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50",
            )}
          >
            Home
          </Link>

          {/* 2. Jenis Makanan Dropdown */}
          <DropdownMenu
            open={foodDropdownOpen}
            onOpenChange={setFoodDropdownOpen}
          >
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-1 px-3.5 py-1.5 h-auto rounded-full text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer select-none outline-none",
                    isFoodTypeActive
                      ? "text-primary bg-primary/10 hover:bg-primary/15 hover:text-primary"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50",
                  )}
                >
                  <span className="max-w-[120px] xl:max-w-none truncate">
                    {isFoodTypeActive ? selectedCategory : "Jenis Makanan"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200 shrink-0 opacity-70",
                      foodDropdownOpen && "rotate-180 opacity-100",
                    )}
                  />
                </Button>
              }
            />

            <DropdownMenuContent
              align="start"
              sideOffset={14}
              className="w-72 p-2 rounded-2xl bg-white dark:bg-[#12141a] border border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Pilih Jenis Makanan
              </div>

              {foodTypes.map((item) => {
                const isSelected = selectedCategory === item.name;
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => handleSelectFoodType(item.name)}
                    className={cn(
                      "flex flex-col items-start px-3 py-2.5 rounded-xl cursor-pointer transition-colors group",
                      isSelected
                        ? "bg-primary/15 text-neutral-900 dark:text-white"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60",
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
                          {item.label}
                        </span>
                        {item.badge && (
                          <Badge
                            className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border-none",
                              item.badgeColor || "bg-primary text-black",
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="size-3.5 text-primary shrink-0 ml-auto" />
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5 leading-normal">
                      {item.description}
                    </span>
                  </DropdownMenuItem>
                );
              })}

              <DropdownMenuSeparator className="my-1 bg-neutral-200 dark:bg-neutral-800" />

              {/* Reset to All Menus */}
              <DropdownMenuItem
                onClick={() => handleSelectFoodType("Semua")}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                <span>Semua Menu Bazaar</span>
                <ArrowRight className="size-3.5 text-neutral-400" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Pesanan */}
          <Link
            href="/customer/orders"
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-colors select-none flex items-center gap-1.5",
              pathname.startsWith("/customer/orders")
                ? "text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-800"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50",
            )}
          >
            <span>Pesanan</span>
            {activeOrdersCount > 0 && (
              <Badge className="px-1.5 py-0 rounded-full text-[10px] font-bold bg-primary text-primary-foreground border-none">
                {activeOrdersCount}
              </Badge>
            )}
          </Link>

          {/* 4. Denah Bazaar */}
          <Link
            href="/customer/map"
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-colors select-none",
              pathname.startsWith("/customer/map")
                ? "text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-800"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50",
            )}
          >
            Denah Bazaar
          </Link>
        </nav>

        {/* Right Section: Black Pill Capsule (Cart CTA), User Menu & Mobile Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Black Pill Capsule: Cart CTA */}
          <Button
            onClick={() => setIsCartOpen(true)}
            className="group relative flex items-center gap-2 h-9 sm:h-10 px-4 sm:px-5 rounded-full font-semibold text-xs sm:text-[13px] transition-all duration-200 cursor-pointer select-none active:scale-95 bg-neutral-950 hover:bg-neutral-800 text-white shadow-md shadow-black/15 border-none shrink-0"
          >
            <ShoppingBag className="size-4 shrink-0 transition-transform group-hover:scale-110 text-neutral-300" />
            <span className="hidden sm:inline">Keranjang</span>

            {cartItemCount > 0 ? (
              <>
                <Badge className="flex items-center justify-center size-5 p-0 rounded-full bg-primary text-primary-foreground text-[11px] font-bold border-none shrink-0">
                  {cartItemCount}
                </Badge>
                <span className="hidden xl:inline text-xs font-semibold text-neutral-300">
                  • {formatRupiah(cartTotal)}
                </span>
              </>
            ) : (
              <span className="text-[11px] sm:text-xs text-neutral-400 font-semibold">
                (0)
              </span>
            )}

            {cartItemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 flex size-4 p-0 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-xs animate-bounce border-none"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>

          {/* User Profile Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="flex items-center p-0.5 h-auto rounded-full hover:ring-2 hover:ring-neutral-200 dark:hover:ring-neutral-700 transition-all cursor-pointer outline-none shrink-0"
                  aria-label="Profil Pengguna"
                />
              }
            >
              <Avatar className="size-8 sm:size-9 ring-1 ring-neutral-200 dark:ring-neutral-800">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-60 p-2 shadow-2xl rounded-2xl bg-white dark:bg-[#12141a] border border-neutral-200 dark:border-neutral-800"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-2 font-normal">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate text-foreground">
                          {userName}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0 uppercase bg-primary/20 text-neutral-900 dark:text-primary font-bold"
                        >
                          Customer
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {userEmail}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1" />

              {/* Multi-role Switcher */}
              <DropdownMenuGroup>
                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Beralih Peran
                </div>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/seller")}
                  className="gap-2.5 text-xs font-medium cursor-pointer rounded-lg py-2"
                >
                  <Store className="size-4 text-primary" />
                  <span>Seller Hub (Penjual)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/association")}
                  className="gap-2.5 text-xs font-medium cursor-pointer rounded-lg py-2"
                >
                  <Building2 className="size-4 text-primary" />
                  <span>Pengelola Bazaar</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1" />

              {/* Logout */}
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="gap-2.5 text-xs font-semibold cursor-pointer rounded-lg py-2 text-destructive"
              >
                <LogOut className="size-4" />
                <span>{isLoggingOut ? "Keluar..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Hamburger Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden size-9 sm:size-10 items-center justify-center rounded-full text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="size-4.5 sm:size-5" />
            ) : (
              <Menu className="size-4.5 sm:size-5" />
            )}
          </Button>
        </div>
      </motion.div>

      {/* Mobile Drawer Navigation Card */}
      {mobileMenuOpen && (
        <div
          className={cn(
            "pointer-events-auto animate-in slide-in-from-top-2 duration-200 shadow-2xl flex flex-col gap-2",
            isScrolled
              ? "max-w-md mx-auto w-full mt-2 rounded-3xl bg-white/98 dark:bg-neutral-900/98 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4"
              : "w-full max-w-[1400px] mx-auto mt-2 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4",
          )}
        >
          <Link
            href="/customer"
            onClick={() => {
              setSelectedCategory("Semua");
              setMobileMenuOpen(false);
            }}
            className={cn(
              "flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors",
              pathname === "/customer" && selectedCategory === "Semua"
                ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            )}
          >
            <span>Home</span>
          </Link>

          {/* Jenis Makanan Category Accordion / List in Mobile */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-2.5 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1 mb-1">
              Jenis Makanan:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {foodTypes.map((item) => {
                const isSelected = selectedCategory === item.name;
                return (
                  <Button
                    key={item.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleSelectFoodType(item.name)}
                    className={cn(
                      "flex items-center justify-center p-2.5 h-auto rounded-xl text-center text-xs font-semibold transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs border-transparent"
                        : "bg-white dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 hover:border-primary",
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator className="my-1 bg-neutral-200 dark:bg-neutral-800" />

          <Link
            href="/customer/orders"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors",
              pathname.startsWith("/customer/orders")
                ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            )}
          >
            <span>Pesanan Saya</span>
            {activeOrdersCount > 0 && (
              <Badge className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground border-none">
                {activeOrdersCount} Aktif
              </Badge>
            )}
          </Link>

          <Link
            href="/customer/map"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors",
              pathname.startsWith("/customer/map")
                ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            )}
          >
            <span>Denah Bazaar</span>
          </Link>
        </div>
      )}
    </header>
  );
}
