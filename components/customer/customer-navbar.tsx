"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  Building2,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Check,
  User,
  MapPin,
  LogIn,
  Bell,
  BellRing,
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  Megaphone,
} from "lucide-react";
import type { Promotion } from "@/types/seller";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useCustomer } from "@/context/customer-context";
import { useSession } from "@/lib/auth/auth-client";
import { logout } from "@/servers/auth-server";
import { CustomerAuthDialog } from "@/components/customer/customer-auth-dialog";
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

function getOrderStatusDisplay(status: string) {
  switch (status) {
    case "Disiapkan":
      return {
        label: "Sedang Dimasak",
        icon: ChefHat,
        badgeClass:
          "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300/40",
      };
    case "Siap Diambil":
      return {
        label: "Siap Diambil!",
        icon: BellRing,
        badgeClass:
          "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300/50 font-bold animate-pulse",
      };
    case "Diterima":
      return {
        label: "Menunggu Konfirmasi",
        icon: Clock,
        badgeClass:
          "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300/40",
      };
    case "Selesai":
      return {
        label: "Selesai",
        icon: CheckCircle2,
        badgeClass:
          "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700",
      };
    case "Dibatalkan":
      return {
        label: "Dibatalkan",
        icon: XCircle,
        badgeClass:
          "bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-300/40",
      };
    default:
      return {
        label: status,
        icon: Clock,
        badgeClass: "bg-neutral-100 text-neutral-700",
      };
  }
}

export function CustomerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const isLoggedIn = !!session?.user;
  const {
    activeOrdersCount,
    orders,
    promotions,
    selectedCategory,
    setSelectedCategory,
    activeUmkm,
  } = useCustomer();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [notifTab, setNotifTab] = React.useState<"semua" | "pesanan" | "promo">("semua");
  const [foodDropdownOpen, setFoodDropdownOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);

  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    const previous = lastScrollY.current;
    const diff = latest - previous;

    if (latest <= 30) {
      setIsVisible(true);
    } else if (Math.abs(diff) > 5) {
      if (mobileMenuOpen || foodDropdownOpen) {
        setIsVisible(true);
      } else if (diff > 0) {
        setIsVisible(false);
      } else if (diff < 0) {
        setIsVisible(true);
      }
    }

    lastScrollY.current = latest;
  });

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
      await refetch();
      router.push("/");
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

    if (pathname === "/customer" || pathname === "/dashboard/customer") {
      const catalogEl =
        document.getElementById("pilihan-menu") ||
        document.getElementById("explore-catalog");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      router.push("/customer#pilihan-menu");
    }
  };

  const isFoodTypeActive = foodTypes.some((f) => f.name === selectedCategory);

  return (
    <header className="fixed top-3 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none flex flex-col items-center">
      <motion.div
        initial={false}
        animate={{
          y: isVisible ? 0 : -90,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          duration: 0.28,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={cn(
          "pointer-events-auto w-full max-w-[1240px] flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800/90 shadow-lg shadow-black/5 min-w-0 transition-shadow",
          !isVisible && "pointer-events-none",
        )}
      >
        {/* Left: Brand Logo */}
        <Link
          href="/customer"
          onClick={() => setSelectedCategory("Semua")}
          className="flex items-center gap-2 shrink-0 transition-transform active:scale-95 group px-1 sm:px-1.5"
          aria-label="Tenantify Home"
        >
          <Image
            src="/icons/tenantify.png"
            alt="Tenantify Logo"
            width={32}
            height={32}
            priority
            className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-neutral-900 dark:text-neutral-100 hidden sm:inline">
            TENANT<span className="text-[#c85a32]">IFY</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink min-w-0">
          <Link
            href="/customer"
            onClick={() => setSelectedCategory("Semua")}
            className={cn(
              "px-2 xl:px-3 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold transition-colors select-none whitespace-nowrap",
              (pathname === "/customer" ||
                pathname === "/dashboard/customer") &&
                selectedCategory === "Semua"
                ? "text-white bg-[#c85a32] shadow-sm"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50",
            )}
          >
            Beranda
          </Link>

          {/* Pesanan */}
          <Link
            href="/customer/orders"
            className={cn(
              "px-2 xl:px-3 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold transition-colors select-none flex items-center gap-1.5 whitespace-nowrap",
              pathname.includes("/orders")
                ? "text-white bg-[#c85a32] shadow-sm"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50",
            )}
          >
            <span>Pesanan</span>
            {activeOrdersCount > 0 && (
              <Badge className="px-1.5 py-0 rounded-full text-[10px] font-bold bg-[#c85a32] text-white border-none">
                {activeOrdersCount}
              </Badge>
            )}
          </Link>

          {/* Denah Bazaar */}
          <Link
            href="/customer/map"
            className={cn(
              "px-2 xl:px-3 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold transition-colors select-none whitespace-nowrap",
              pathname.includes("/map")
                ? "text-white bg-[#c85a32] shadow-sm"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50",
            )}
          >
            Denah Bazaar
          </Link>

          {/* Join UMKM (Jika belum connect) ATAU Pill Lokasi UMKM Aktif (Jika sudah connect) */}
          {!activeUmkm ? (
            <Link
              href="/join"
              className={cn(
                "flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold transition-all select-none whitespace-nowrap",
                pathname.includes("/join")
                  ? "text-white bg-[#c85a32] shadow-sm"
                  : "text-[#c85a32] bg-[#c85a32]/10 hover:bg-[#c85a32]/20 border border-[#c85a32]/30",
              )}
            >
              <LogIn className="size-3.5" />
              <span>Join UMKM</span>
            </Link>
          ) : (
            <Link
              href="/join"
              className={cn(
                "flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold transition-all select-none whitespace-nowrap max-w-[130px] xl:max-w-[160px]",
                pathname.includes("/join")
                  ? "text-white bg-[#c85a32] shadow-sm"
                  : "text-[#c85a32] bg-[#c85a32]/10 hover:bg-[#c85a32]/20 border border-[#c85a32]/30",
              )}
              title={`Terhubung ke ${activeUmkm.name} (${activeUmkm.code}). Klik untuk ganti.`}
            >
              <MapPin className="size-3.5 shrink-0 text-[#c85a32]" />
              <span className="truncate">{activeUmkm.name}</span>
              <Badge className="bg-[#c85a32] text-white text-[10px] font-mono px-1 py-0 border-none shrink-0">
                {activeUmkm.code}
              </Badge>
            </Link>
          )}
        </nav>

        {/* Right Section: Terracotta Pill Capsule (Cart CTA), User Menu & Mobile Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-10">
          {/* Customer Notification Bell */}
          {(() => {
            const promoList = promotions || [];
            const totalNotifCount = activeOrdersCount + promoList.length;

            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative flex items-center justify-center size-9 sm:size-10 p-0 rounded-full transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 border",
                        totalNotifCount > 0
                          ? "bg-[#c85a32]/10 hover:bg-[#c85a32]/20 text-[#c85a32] border-[#c85a32]/30 shadow-xs"
                          : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70",
                      )}
                      aria-label="Notifikasi & Promosi"
                    />
                  }
                >
                  {totalNotifCount > 0 ? (
                    <BellRing className="size-4 sm:size-4.5 text-[#c85a32] animate-bounce" />
                  ) : (
                    <Bell className="size-4 sm:size-4.5" />
                  )}

                  {totalNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4 sm:size-4.5 items-center justify-center pointer-events-none">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex items-center justify-center size-4 sm:size-4.5 rounded-full bg-red-600 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
                        {totalNotifCount}
                      </span>
                    </span>
                  )}
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-80 sm:w-96 p-2 shadow-2xl rounded-2xl bg-white dark:bg-[#12141a] border border-neutral-200 dark:border-neutral-800"
                >
                  {/* Header */}
                  <div className="flex flex-col gap-2 px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-[#c85a32]/10 flex items-center justify-center text-[#c85a32]">
                          <Bell className="size-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            Notifikasi &amp; Promo
                          </span>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            Update pesanan &amp; promosi UMKM
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {activeOrdersCount > 0 && (
                          <Badge className="bg-[#c85a32] text-white text-[10px] px-1.5 py-0 rounded-full font-bold border-none">
                            {activeOrdersCount} Pesanan
                          </Badge>
                        )}
                        {promoList.length > 0 && (
                          <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 rounded-full font-bold border-none">
                            {promoList.length} Promo
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Filter Tabs inside notification dropdown */}
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setNotifTab("semua")}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer",
                          notifTab === "semua"
                            ? "bg-[#c85a32] text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200",
                        )}
                      >
                        Semua ({orders.length + promoList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifTab("promo")}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1",
                          notifTab === "promo"
                            ? "bg-[#c85a32] text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200",
                        )}
                      >
                        <Megaphone className="size-3" />
                        Promo ({promoList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifTab("pesanan")}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer",
                          notifTab === "pesanan"
                            ? "bg-[#c85a32] text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200",
                        )}
                      >
                        Pesanan ({orders.length})
                      </button>
                    </div>
                  </div>

                  {/* List Content */}
                  <div className="max-h-80 overflow-y-auto py-1 divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {/* Render Promotions */}
                    {(notifTab === "semua" || notifTab === "promo") &&
                      promoList.map((promo: Promotion) => (
                        <div
                          key={promo.id}
                          onClick={() => {
                            const target =
                              promo.targetUrl ||
                              `/?tenant=${promo.tenantId}#customer-product-explorer`;
                            toast.info(`Membuka menu ${promo.tenantName}...`);
                            router.push(target);
                          }}
                          className="p-2.5 m-1 rounded-xl cursor-pointer bg-gradient-to-r from-amber-500/10 via-[#c85a32]/5 to-transparent hover:from-amber-500/15 hover:via-[#c85a32]/10 transition-all flex flex-col gap-1.5 border border-[#c85a32]/20 hover:border-[#c85a32]/50 group"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 truncate">
                              <Megaphone className="size-3.5 text-[#c85a32] shrink-0" />
                              Promo Baru dari {promo.tenantName}!
                            </span>
                            <Badge
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-bold border-none shrink-0",
                                promo.type === "Diskon"
                                  ? "bg-rose-500 text-white"
                                  : promo.type === "Pengumuman"
                                    ? "bg-amber-500 text-white"
                                    : "bg-blue-500 text-white",
                              )}
                            >
                              {promo.type}
                            </Badge>
                          </div>

                          <p className="text-xs font-bold text-[#c85a32] dark:text-[#f59e0b]">
                            Nikmati {promo.title} sekarang.
                          </p>

                          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                            {promo.message}
                          </p>

                          <div className="flex items-center justify-between w-full pt-1 text-[10px] text-neutral-400 dark:text-neutral-500 border-t border-[#c85a32]/10">
                            <span>📅 {promo.startDate} - {promo.endDate}</span>
                            <span className="font-bold text-[#c85a32] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                              Lihat Menu &amp; Belanja &rarr;
                            </span>
                          </div>
                        </div>
                      ))}

                    {/* Render Orders */}
                    {(notifTab === "semua" || notifTab === "pesanan") &&
                      orders.slice(0, 5).map((order) => {
                        const statusInfo = getOrderStatusDisplay(order.status);
                        const StatusIcon = statusInfo.icon;
                        const primaryTenant = order.tenantNames?.[0] || "UMKM";
                        const itemsSummary = order.items
                          ?.map((it) => `${it.quantity}x ${it.productName}`)
                          .join(", ");

                        return (
                          <DropdownMenuItem
                            key={order.id}
                            onClick={() => router.push("/orders")}
                            className="p-2.5 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/70 transition-colors flex flex-col items-start gap-1.5 focus:bg-neutral-100 dark:focus:bg-neutral-800"
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                {primaryTenant}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 font-medium",
                                  statusInfo.badgeClass,
                                )}
                              >
                                <StatusIcon className="size-3" />
                                <span>{statusInfo.label}</span>
                              </Badge>
                            </div>

                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 w-full text-left">
                              {itemsSummary || "Menu pesanan"}
                            </p>

                            <div className="flex items-center justify-between w-full text-[10px] text-neutral-400 dark:text-neutral-500 pt-0.5">
                              <span>
                                Kode:{" "}
                                <strong className="text-neutral-700 dark:text-neutral-300 font-mono">
                                  {order.pickupCode}
                                </strong>
                              </span>
                              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                {formatRupiah(order.total)}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}

                    {/* Empty state when nothing in selected tab */}
                    {((notifTab === "promo" && promoList.length === 0) ||
                      (notifTab === "pesanan" && orders.length === 0) ||
                      (notifTab === "semua" &&
                        orders.length === 0 &&
                        promoList.length === 0)) && (
                      <div className="py-6 px-4 text-center">
                        <div className="mx-auto size-10 rounded-full bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center text-neutral-400 mb-2">
                          <Bell className="size-5 text-neutral-400" />
                        </div>
                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          {notifTab === "promo"
                            ? "Belum ada promosi UMKM"
                            : notifTab === "pesanan"
                              ? "Belum ada pesanan aktif"
                              : "Belum ada notifikasi"}
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                          {notifTab === "promo"
                            ? "Promo diskon dan penawaran khusus dari UMKM yang kamu kunjungi akan muncul di sini."
                            : "Status pesanan real-time dari stan UMKM akan otomatis muncul di sini."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer CTA */}
                  <DropdownMenuSeparator className="my-1 bg-neutral-100 dark:bg-neutral-800" />
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/orders")}
                      className="w-full justify-between text-xs font-semibold text-[#c85a32] hover:bg-[#c85a32]/10 hover:text-[#b34a24] rounded-xl h-8.5 px-3 cursor-pointer"
                    >
                      <span>Lihat Semua Pesanan &amp; Riwayat</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })()}

          {isPending ? (
            <span
              aria-hidden
              className="size-8 sm:size-9 shrink-0 rounded-full bg-neutral-200/80 dark:bg-neutral-800 animate-pulse"
            />
          ) : isLoggedIn ? (
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

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="gap-2.5 text-xs font-medium cursor-pointer rounded-lg py-2"
                  >
                    <User className="size-4 text-primary" />
                    <span>Profil & Riwayat Pesanan</span>
                  </DropdownMenuItem>
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
          ) : (
            <CustomerAuthDialog />
          )}

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
        <div className="pointer-events-auto animate-in slide-in-from-top-2 duration-200 shadow-2xl flex flex-col gap-2 max-w-md mx-auto w-full mt-2 rounded-3xl bg-white/98 dark:bg-neutral-900/98 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
          <Link
            href="/customer"
            onClick={() => {
              setSelectedCategory("Semua");
              setMobileMenuOpen(false);
            }}
            className={cn(
              "flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors",
              (pathname === "/customer" ||
                pathname === "/dashboard/customer") &&
                selectedCategory === "Semua"
                ? "bg-[#c85a32] text-white"
                : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            )}
          >
            <span>Beranda</span>
          </Link>

          {/* Menu Makanan: Hanya jika UMKM sudah aktif */}
          {activeUmkm && (
            <>
              <a
                href="#pilihan-menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>Pilihan Makanan</span>
              </a>

              <a
                href="#katering-section"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>Tenant Favorit</span>
              </a>

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
            </>
          )}

          {/* Join UMKM Link on Mobile */}
          <Link
            href="/join"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors",
              pathname.includes("/join")
                ? "bg-[#c85a32] text-white"
                : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            )}
          >
            <div className="flex items-center gap-2">
              <LogIn className="size-4 text-[#c85a32]" />
              <span>{activeUmkm ? "Ganti UMKM / Lokasi" : "Join UMKM / Paguyuban"}</span>
            </div>
            {activeUmkm && (
              <Badge className="bg-[#c85a32] text-white text-[10px] py-0 border-none">
                {activeUmkm.code}
              </Badge>
            )}
          </Link>

          <Link
            href="/customer/orders"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors",
              pathname.includes("/orders")
                ? "bg-[#c85a32] text-white"
                : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            )}
          >
            <span>Pesanan Saya</span>
            {activeOrdersCount > 0 && (
              <Badge className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c85a32] text-white border-none">
                {activeOrdersCount} Aktif
              </Badge>
            )}
          </Link>

          <Link
            href="/customer/map"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors",
              pathname.includes("/map")
                ? "bg-[#c85a32] text-white"
                : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            )}
          >
            <span>Denah Bazaar</span>
          </Link>

          {!isPending && !isLoggedIn && (
            <div className="pt-2">
              <CustomerAuthDialog className="w-full justify-center h-10" />
            </div>
          )}
        </div>
      )}
    </header>
  );
}
