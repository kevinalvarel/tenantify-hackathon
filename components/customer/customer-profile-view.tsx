"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Receipt,
  Star,
  MessageSquare,
  ShoppingBag,
  ChefHat,
  Clock,
  CheckCircle2,
  RotateCcw,
  Store,
  QrCode,
  LogOut,
  Edit3,
  Phone,
  Mail,
  AlertCircle,
  Info,
  HelpCircle,
  X,
} from "lucide-react";
import { useCustomer } from "@/context/customer-context";
import { useSession, updateUser } from "@/lib/auth/auth-client";
import { logout, updateCustomerProfile } from "@/servers/auth-server";
import { CustomerAuthDialog } from "@/components/customer/customer-auth-dialog";
import { CustomerOrder, CustomerOrderStatus } from "@/types/customer";
import type { CommentClassificationResult } from "@/lib/ai-client";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export type CustomerReviewItem = {
  id: string;
  orderId?: string;
  tenantName: string;
  boothNumber: string;
  rating: number;
  comment: string;
  badge?: string;
  aspects?: string[];
  createdAt: string;
  reply?: {
    tenantName: string;
    message: string;
    repliedAt: string;
  };
};

const DEFAULT_REVIEWS: CustomerReviewItem[] = [
  {
    id: "rev-demo-1",
    orderId: "ORD-9421",
    tenantName: "Kevin Kebab",
    boothNumber: "Stall A-04",
    rating: 5,
    comment:
      "Kebab dagingnya melimpah, saus garlic mayo gurih dan rotinya dipanggang pas tidak alot. Waktu tunggu relatif cepat sekitar 5 menit.",
    badge: "Rasa & Kualitas",
    aspects: ["Rasa", "Kecepatan Penyajian"],
    createdAt: "Kemarin, 14:20 WIB",
    reply: {
      tenantName: "Kevin Kebab",
      message:
        "Terima kasih banyak kak atas ulasannya! Kami selalu menjaga kualitas daging dan kematangan roti terbaik untuk pelanggan.",
      repliedAt: "Kemarin, 15:02 WIB",
    },
  },
  {
    id: "rev-demo-2",
    orderId: "ORD-8710",
    tenantName: "Kopi & Toast Janji Manis",
    boothNumber: "Stall A-02",
    rating: 5,
    comment:
      "Kopi susu gula arennya mantap, rasanya bold dan manisnya pas. Toast keju cokelatnya juga garing di luar dan lembut di dalam.",
    badge: "Rekomendasi Menu",
    aspects: ["Minuman Segar", "Camilan"],
    createdAt: "3 hari yang lalu",
    reply: {
      tenantName: "Kopi & Toast Janji Manis",
      message:
        "Senang sekali cocok dengan racikan kopi kami kak! Ditunggu kedatangannya kembali di booth Janji Manis.",
      repliedAt: "3 hari yang lalu",
    },
  },
  {
    id: "rev-demo-3",
    orderId: "ORD-7304",
    tenantName: "Bebek Madura Cak Munir",
    boothNumber: "Stall C-01",
    rating: 4,
    comment:
      "Bumbu hitamnya juara pedas gurih nagih! Daging bebeknya empuk sekali. Sedikit catatan sambalnya cukup pedas bagi yang sensitif pedas.",
    badge: "Ulasan Rasa",
    aspects: ["Porsi", "Pedas"],
    createdAt: "1 minggu yang lalu",
    reply: {
      tenantName: "Bebek Madura Cak Munir",
      message:
        "Matur suwun kak! Catatan tingkat kepedasan kami catat, untuk pesanan selanjutnya bisa request bumbu manis-pedas ya kak.",
      repliedAt: "1 minggu yang lalu",
    },
  },
];

type ProfileTab = "pesanan" | "ulasan" | "akun";
const orderStatusFilters = [
  "Semua",
  "Berjalan",
  "Selesai",
  "Dibatalkan",
] as const;
const ratingFilters = ["Semua", 5, 4, 3, 2, 1] as const;

export function CustomerProfileView() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const { orders, reorder, activeOrdersCount } = useCustomer();

  const [activeTab, setActiveTab] = useState<ProfileTab>("pesanan");
  const [orderFilter, setOrderFilter] =
    useState<(typeof orderStatusFilters)[number]>("Semua");
  const [ratingFilter, setRatingFilter] =
    useState<(typeof ratingFilters)[number]>("Semua");

  const [reviews, setReviews] = useState<CustomerReviewItem[]>([]);
  const [isReviewsLoaded, setIsReviewsLoaded] = useState(false);

  // User contact details state
  const [phone, setPhone] = useState("0812-3456-7890");
  const [displayName, setDisplayName] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editNameInput, setEditNameInput] = useState("");
  const [editPhoneInput, setEditPhoneInput] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Review Dialog State
  const [reviewOrder, setReviewOrder] = useState<CustomerOrder | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  // Pickup Code Dialog
  const [activePickupOrder, setActivePickupOrder] =
    useState<CustomerOrder | null>(null);

  // Logout State
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load persisted reviews & profile on mount
  useEffect(() => {
    try {
      const storedReviews = localStorage.getItem("tenantify_customer_reviews");
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      } else {
        setReviews(DEFAULT_REVIEWS);
        localStorage.setItem(
          "tenantify_customer_reviews",
          JSON.stringify(DEFAULT_REVIEWS),
        );
      }

      const storedPhone = localStorage.getItem("tenantify_customer_phone");
      if (storedPhone) {
        setPhone(storedPhone);
      }

      const storedName = localStorage.getItem("tenantify_customer_name");
      if (storedName) {
        setDisplayName(storedName);
      }
    } catch {
      setReviews(DEFAULT_REVIEWS);
    } finally {
      setIsReviewsLoaded(true);
    }
  }, []);

  // Sync profile when session becomes available
  useEffect(() => {
    if (session?.user) {
      if (
        session.user.name &&
        !localStorage.getItem("tenantify_customer_name")
      ) {
        setDisplayName(session.user.name);
      }
      if (session.user.id) {
        const userPhone = localStorage.getItem(
          `tenantify_customer_phone_${session.user.id}`,
        );
        if (userPhone) {
          setPhone(userPhone);
        }
      }
    }
  }, [session?.user]);

  const isLoggedIn = !!session?.user;
  const user = session?.user;
  const resolvedName =
    displayName ||
    user?.name ||
    (isLoggedIn ? "Pelanggan Tenantify" : "Tamu Pengunjung");
  const resolvedEmail =
    user?.email || (isLoggedIn ? "customer@tenantify.id" : "Belum masuk akun");

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

  const handleOpenEditProfile = () => {
    setEditNameInput(resolvedName);
    setEditPhoneInput(phone);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = editNameInput.trim();
    const cleanPhone = editPhoneInput.trim();

    if (!cleanName) {
      toast.error("Nama tidak boleh kosong.");
      return;
    }

    setIsSavingProfile(true);
    try {
      if (session?.user) {
        const res = await updateCustomerProfile({ name: cleanName });
        if (!res.success) {
          toast.error(res.message);
        }
        try {
          await updateUser({ name: cleanName });
        } catch {}
      }

      setDisplayName(cleanName);
      setPhone(cleanPhone || "0812-3456-7890");

      try {
        localStorage.setItem("tenantify_customer_name", cleanName);
        if (cleanPhone) {
          localStorage.setItem("tenantify_customer_phone", cleanPhone);
          if (session?.user?.id) {
            localStorage.setItem(
              `tenantify_customer_phone_${session.user.id}`,
              cleanPhone,
            );
          }
        }
      } catch {}

      setIsEditProfileOpen(false);
      toast.success("Profil akun berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal memperbarui profil.";
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
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
      setDisplayName("");
      try {
        localStorage.removeItem("tenantify_customer_name");
      } catch {}
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Gagal keluar dari akun.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (orderFilter === "Semua") return true;
      if (orderFilter === "Berjalan") {
        return (
          order.status === "Diterima" ||
          order.status === "Disiapkan" ||
          order.status === "Siap Diambil"
        );
      }
      return order.status === orderFilter;
    });
  }, [orders, orderFilter]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      if (ratingFilter === "Semua") return true;
      return rev.rating === ratingFilter;
    });
  }, [reviews, ratingFilter]);

  // Completed Orders that can be reviewed
  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "Selesai");
  }, [orders]);

  // Set of order IDs that have already been reviewed
  const reviewedOrderIds = useMemo(() => {
    return new Set(reviews.map((r) => r.orderId).filter(Boolean));
  }, [reviews]);

  const handleOpenReviewDialog = (order: CustomerOrder) => {
    setReviewOrder(order);
    setReviewRating(5);
    setReviewComment("");
    setModerationError(null);
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder) return;
    const cleanText = reviewComment.trim();
    if (cleanText.length < 5) {
      toast.error("Ulasan terlalu singkat. Tuliskan minimal 5 karakter.");
      return;
    }

    setIsSubmittingReview(true);
    setModerationError(null);

    try {
      const res = await fetch("/api/reviews/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentText: cleanText,
          commentId: `rev-${reviewOrder.id}-${Date.now()}`,
          tenantId: reviewOrder.tenantNames[0] || "Stan Tenant",
          rating: reviewRating,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses ulasan.");
      }

      if (data.accepted) {
        const moderation: CommentClassificationResult | undefined =
          data.moderation;
        const badge =
          moderation?.dashboard_badge ||
          moderation?.category ||
          "Ulasan Pelanggan";

        const newReviewItem: CustomerReviewItem = {
          id: `rev-${Date.now()}`,
          orderId: reviewOrder.id,
          tenantName: reviewOrder.tenantNames.join(", ") || "Tenant Food Court",
          boothNumber: reviewOrder.tableNumber
            ? `Meja ${reviewOrder.tableNumber}`
            : "Stan Booth",
          rating: reviewRating,
          comment: cleanText,
          badge,
          aspects: moderation?.aspects || ["Layanan"],
          createdAt: "Baru saja",
        };

        const updatedList = [newReviewItem, ...reviews];
        setReviews(updatedList);
        try {
          localStorage.setItem(
            "tenantify_customer_reviews",
            JSON.stringify(updatedList),
          );
        } catch {}

        toast.success(`Ulasan berhasil dikirim (${badge})`);
        setReviewOrder(null);
        setActiveTab("ulasan");
      } else {
        const reason =
          data.moderation?.moderation_reason ||
          "Ulasan tidak memenuhi pedoman komunitas ulasan ramah.";
        setModerationError(reason);
        toast.error("Ulasan belum dapat diterbitkan. Periksa saran di bawah.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim ulasan.";
      toast.error(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getOrderStatusBadge = (status: CustomerOrderStatus) => {
    switch (status) {
      case "Diterima":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 gap-1 font-medium"
          >
            <Clock className="size-3" />
            Menunggu Konfirmasi
          </Badge>
        );
      case "Disiapkan":
        return (
          <Badge
            variant="secondary"
            className="border-[#c85a32]/30 text-[#c85a32] dark:text-[#f48a60] bg-[#c85a32]/10 gap-1 font-medium"
          >
            <ChefHat className="size-3" />
            Sedang Dimasak
          </Badge>
        );
      case "Siap Diambil":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium shadow-xs">
            <CheckCircle2 className="size-3" />
            Siap Diambil di Stan
          </Badge>
        );
      case "Selesai":
        return (
          <Badge
            variant="outline"
            className="border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 gap-1"
          >
            <CheckCircle2 className="size-3 text-emerald-500" />
            Selesai
          </Badge>
        );
      case "Dibatalkan":
        return (
          <Badge
            variant="outline"
            className="border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 bg-rose-500/10 gap-1"
          >
            <X className="size-3" />
            Dibatalkan
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 md:pb-12 min-w-0">
      {/* 1. Header Profile Banner */}
      {isSessionLoading ? (
        <section
          aria-label="Memuat Informasi Profil"
          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-5 sm:p-7 shadow-xs relative overflow-hidden animate-pulse"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="size-16 sm:size-20 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
              <div className="space-y-2">
                <div className="h-6 w-44 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-56 rounded-md bg-neutral-100 dark:bg-neutral-800/60" />
              </div>
            </div>
            <div className="h-10 w-28 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80">
            <div className="h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800/50" />
            <div className="h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800/50" />
            <div className="h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800/50" />
          </div>
        </section>
      ) : (
        <section
          aria-label="Informasi Profil Pengguna"
          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-5 sm:p-7 shadow-xs backdrop-blur-xs relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* Avatar and Identity */}
            <div className="flex items-start sm:items-center gap-4">
              <Avatar className="size-16 sm:size-20 ring-2 ring-[#c85a32]/20 shrink-0">
                <AvatarImage
                  src={user?.image || undefined}
                  alt={resolvedName}
                />
                <AvatarFallback className="text-lg sm:text-xl font-bold bg-[#c85a32]/15 text-[#c85a32]">
                  {getInitials(resolvedName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-50 truncate tracking-tight">
                    {resolvedName}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-[#c85a32]/15 text-[#c85a32] dark:text-[#f48a60] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
                  >
                    {isLoggedIn ? "Pelanggan Terverifikasi" : "Mode Tamu"}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5 truncate">
                    <Mail className="size-3.5 text-neutral-400 shrink-0" />
                    {resolvedEmail}
                  </span>
                  <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">
                    •
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-neutral-400 shrink-0" />
                    {phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons (Edit Profile / Logout / Login) */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              {isLoggedIn ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenEditProfile}
                    className="min-h-[44px] h-10 px-3.5 rounded-xl border-neutral-300 dark:border-neutral-700 text-xs font-medium cursor-pointer transition-colors"
                  >
                    <Edit3 className="size-3.5 mr-1.5" />
                    Ubah Profil
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="min-h-[44px] h-10 px-3.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium cursor-pointer transition-colors"
                    aria-label="Keluar dari akun"
                  >
                    <LogOut className="size-3.5 mr-1.5" />
                    {isLoggingOut ? "Keluar..." : "Keluar"}
                  </Button>
                </>
              ) : (
                <CustomerAuthDialog
                  trigger={
                    <Button className="min-h-[44px] h-10 px-4 rounded-xl bg-[#c85a32] hover:bg-[#b04f2c] text-white text-xs font-semibold cursor-pointer shadow-xs">
                      Masuk atau Daftar
                    </Button>
                  }
                />
              )}
            </div>
          </div>

          {/* Guest Informational Callout */}
          {!isLoggedIn && (
            <div className="mt-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <Info className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">
                  Anda sedang menjelajah sebagai Tamu.
                </span>
                <span>
                  Masuk ke akun untuk menyinkronkan riwayat pesanan lintas
                  perangkat, menulis review stan, dan menerima notifikasi
                  real-time saat pesanan siap diambil.
                </span>
              </div>
            </div>
          )}

          {/* Account Activity Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80">
            <button
              type="button"
              onClick={() => setActiveTab("pesanan")}
              className="flex flex-col items-center sm:items-start p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left cursor-pointer group"
            >
              <span className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
                Total Pesanan
              </span>
              <span className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("pesanan");
                setOrderFilter("Berjalan");
              }}
              className="flex flex-col items-center sm:items-start p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left cursor-pointer group"
            >
              <span className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
                Pesanan Berjalan
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-bold text-[#c85a32]">
                  {activeOrdersCount}
                </span>
                {activeOrdersCount > 0 && (
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c85a32] opacity-75" />
                    <span className="relative inline-flex rounded-full size-2 bg-[#c85a32]" />
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ulasan")}
              className="flex flex-col items-center sm:items-start p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left cursor-pointer group"
            >
              <span className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
                Ulasan Diberikan
              </span>
              <span className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {reviews.length}
              </span>
            </button>
          </div>
        </section>
      )}

      {/* 2. Accessible Tabbed Navigation */}
      <nav
        aria-label="Pilihan Bagian Profil"
        className="grid grid-cols-3 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/60 max-w-lg"
      >
        <button
          type="button"
          onClick={() => setActiveTab("pesanan")}
          className={cn(
            "min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "pesanan"
              ? "bg-white dark:bg-neutral-900 text-[#c85a32] shadow-xs"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200",
          )}
          aria-current={activeTab === "pesanan" ? "page" : undefined}
        >
          <Receipt className="size-4" />
          <span>Pesanan</span>
          {orders.length > 0 && (
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "pesanan"
                  ? "bg-[#c85a32]/10 text-[#c85a32]"
                  : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300",
              )}
            >
              {orders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ulasan")}
          className={cn(
            "min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "ulasan"
              ? "bg-white dark:bg-neutral-900 text-[#c85a32] shadow-xs"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200",
          )}
          aria-current={activeTab === "ulasan" ? "page" : undefined}
        >
          <Star className="size-4" />
          <span>Ulasan</span>
          {reviews.length > 0 && (
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "ulasan"
                  ? "bg-[#c85a32]/10 text-[#c85a32]"
                  : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300",
              )}
            >
              {reviews.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("akun")}
          className={cn(
            "min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "akun"
              ? "bg-white dark:bg-neutral-900 text-[#c85a32] shadow-xs"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200",
          )}
          aria-current={activeTab === "akun" ? "page" : undefined}
        >
          <User className="size-4" />
          <span>Akun & Bantuan</span>
        </button>
      </nav>

      {/* 3. Tab Contents */}

      {/* TAB 1: RIWAYAT PESANAN */}
      {activeTab === "pesanan" && (
        <section aria-label="Riwayat Pesanan Saya" className="space-y-4">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {orderStatusFilters.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setOrderFilter(st)}
                className={cn(
                  "min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer border",
                  orderFilter === st
                    ? "bg-[#c85a32] border-[#c85a32] text-white shadow-xs"
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700",
                )}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-2 border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 p-8 text-center">
              <CardContent className="flex flex-col items-center justify-center p-0 space-y-3">
                <div className="size-14 rounded-full bg-[#c85a32]/10 flex items-center justify-center text-[#c85a32]">
                  <ShoppingBag className="size-7" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Belum Ada Pesanan{" "}
                    {orderFilter !== "Semua" ? `(${orderFilter})` : ""}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
                    {orderFilter === "Semua"
                      ? "Anda belum melakukan pemesanan. Pilih stan favorit Anda dan cicipi hidangan lezat hari ini."
                      : `Tidak ada pesanan berstatus ${orderFilter}. Ubah filter untuk melihat riwayat lainnya.`}
                  </p>
                </div>
                <Link
                  href="/#customer-product-explorer"
                  className="min-h-[44px] h-10 mt-2 px-4 rounded-xl bg-[#c85a32] hover:bg-[#b04f2c] text-white text-xs font-semibold inline-flex items-center justify-center cursor-pointer shadow-xs transition-colors"
                >
                  Mulai Pesan Menu
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const hasReviewed = reviewedOrderIds.has(order.id);
                return (
                  <Card
                    key={order.id}
                    className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5 shadow-xs transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
                  >
                    {/* Top Row: ID, Pickup Code & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                          #{order.id}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">
                          •
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {order.createdAt}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.pickupCode && (
                          <span className="px-2 py-0.5 rounded-md bg-[#c85a32]/10 text-[#c85a32] font-mono font-bold text-xs">
                            Kode: {order.pickupCode}
                          </span>
                        )}
                        {getOrderStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Tenant Information */}
                    <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      <Store className="size-3.5 text-[#c85a32]" />
                      <span>{order.tenantNames.join(", ")}</span>
                      {order.tableNumber && (
                        <span className="text-neutral-500 dark:text-neutral-400 font-normal">
                          (Meja {order.tableNumber})
                        </span>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 my-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${item.productName}-${idx}`}
                          className="flex items-center justify-between py-2 text-xs"
                        >
                          <div className="flex-1 pr-3">
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                              {item.quantity}x {item.productName}
                            </span>
                            {item.notes && (
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic mt-0.5">
                                Catatan: {item.notes}
                              </p>
                            )}
                          </div>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 shrink-0">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer: Total & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          Total Pembayaran ({order.paymentMethod}):
                        </span>
                        <span className="text-sm font-bold text-[#c85a32]">
                          {formatRupiah(order.total)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {order.status === "Siap Diambil" && (
                          <Button
                            size="sm"
                            onClick={() => setActivePickupOrder(order)}
                            className="min-h-[44px] h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                          >
                            <QrCode className="size-3.5 mr-1.5" />
                            Kode Pengambilan
                          </Button>
                        )}

                        {order.status === "Selesai" && (
                          <>
                            {hasReviewed ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-xs py-1 px-2.5 gap-1"
                              >
                                <CheckCircle2 className="size-3" />
                                Sudah Diulas
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenReviewDialog(order)}
                                className="min-h-[44px] h-9 px-3.5 rounded-xl border-[#c85a32]/40 text-[#c85a32] hover:bg-[#c85a32]/10 text-xs font-semibold cursor-pointer"
                              >
                                <Star className="size-3.5 mr-1.5 fill-[#c85a32]" />
                                Beri Ulasan
                              </Button>
                            )}
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => reorder(order)}
                          className="min-h-[44px] h-9 px-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium cursor-pointer"
                        >
                          <RotateCcw className="size-3.5 mr-1.5" />
                          Pesan Lagi
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: RIWAYAT REVIEW */}
      {activeTab === "ulasan" && (
        <section aria-label="Riwayat Ulasan Pelanggan" className="space-y-4">
          {/* Header Row: Filter & Prompt if unreviewed order exists */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Rating Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {ratingFilters.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRatingFilter(r)}
                  className={cn(
                    "min-h-[44px] px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer border flex items-center gap-1",
                    ratingFilter === r
                      ? "bg-[#c85a32] border-[#c85a32] text-white shadow-xs"
                      : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700",
                  )}
                >
                  {r === "Semua" ? (
                    "Semua Rating"
                  ) : (
                    <>
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span>{r} Bintang</span>
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Quick action to review completed order */}
            {completedOrders.length > 0 && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 self-end sm:self-center">
                {reviews.length} ulasan terbit
              </span>
            )}
          </div>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-2 border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 p-8 text-center">
              <CardContent className="flex flex-col items-center justify-center p-0 space-y-3">
                <div className="size-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Star className="size-7 fill-amber-500 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Belum Ada Ulasan{" "}
                    {ratingFilter !== "Semua"
                      ? `(${ratingFilter} Bintang)`
                      : ""}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
                    Bagikan pengalaman kuliner Anda kepada pengunjung lain. Ulas
                    pesanan yang telah selesai untuk membantu kemajuan stan UMKM
                    food court.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setActiveTab("pesanan");
                    setOrderFilter("Selesai");
                  }}
                  className="min-h-[44px] h-10 mt-2 rounded-xl bg-[#c85a32] hover:bg-[#b04f2c] text-white text-xs font-semibold cursor-pointer"
                >
                  Lihat Pesanan untuk Diulas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <Card
                  key={rev.id}
                  className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5 shadow-xs space-y-3"
                >
                  {/* Review Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-[#c85a32]/10 text-[#c85a32] flex items-center justify-center font-bold text-xs">
                        <Store className="size-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-none">
                          {rev.tenantName}
                        </h2>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 block">
                          {rev.boothNumber} • {rev.createdAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rev.badge && (
                        <Badge
                          variant="secondary"
                          className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-medium"
                        >
                          {rev.badge}
                        </Badge>
                      )}
                      {/* Star Display */}
                      <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "size-3.5",
                              star <= rev.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-neutral-300 dark:text-neutral-700",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed pl-1">
                    "{rev.comment}"
                  </p>

                  {/* Aspects / Tags */}
                  {rev.aspects && rev.aspects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                      {rev.aspects.map((asp) => (
                        <span
                          key={asp}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        >
                          #{asp}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tenant Official Reply */}
                  {rev.reply && (
                    <div className="mt-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                          <MessageSquare className="size-3 text-[#c85a32]" />
                          Tanggapan dari {rev.reply.tenantName}
                        </span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          {rev.reply.repliedAt}
                        </span>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-400 italic leading-normal pl-4">
                        {rev.reply.message}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: AKUN & BANTUAN */}
      {activeTab === "akun" && (
        <section aria-label="Detail Akun dan Bantuan" className="space-y-6">
          {/* Account Detail Card */}
          <Card className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs">
            <CardHeader className="p-0 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
              <CardTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <User className="size-4 text-[#c85a32]" />
                Rincian Data Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/50">
                  <span className="text-neutral-500 dark:text-neutral-400 block mb-1">
                    Nama Lengkap
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    {resolvedName}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/50">
                  <span className="text-neutral-500 dark:text-neutral-400 block mb-1">
                    Alamat Email
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm truncate block">
                    {resolvedEmail}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/50">
                  <span className="text-neutral-500 dark:text-neutral-400 block mb-1">
                    Nomor WhatsApp / Kontak
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    {phone}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/50">
                  <span className="text-neutral-500 dark:text-neutral-400 block mb-1">
                    Peran Aplikasi
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    Pelanggan Food Court (Customer)
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={handleOpenEditProfile}
                  className="min-h-[44px] h-10 px-4 rounded-xl bg-[#c85a32] hover:bg-[#b04f2c] text-white text-xs font-semibold cursor-pointer"
                >
                  <Edit3 className="size-3.5 mr-1.5" />
                  Perbarui Informasi Kontak
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Food Court Information & Guide */}
          <Card className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs">
            <CardHeader className="p-0 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
              <CardTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <HelpCircle className="size-4 text-[#c85a32]" />
                Panduan & Bantuan Pengunjung
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-700/50 space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Bagaimana alur pengambilan makanan di stan?
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Setelah pesanan Anda berstatus "Siap Diambil", kunjungi stan
                  tenant bersangkutan dan tunjukkan Kode Pengambilan 4-digit
                  atau QR Code pada staf kasir stan.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-700/50 space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Apakah bisa memesan menu dari stan berbeda dalam satu kali
                  bayar?
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Ya, keranjang belanja Tenantify mendukung Multi-Tenant
                  Checkout. Pesanan Anda akan otomatis diteruskan ke
                  masing-masing stan secara paralel.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-700/50 space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Bagaimana jika makanan tidak sesuai pesanan?
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Silakan langsung mendatangi booth tenant bersangkutan dengan
                  memperlihatkan riwayat pesanan digital ini kepada staf tenant
                  untuk penyelesaian langsung di lokasi.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 4. Review Dialog Modal */}
      <Dialog
        open={!!reviewOrder}
        onOpenChange={(open) => {
          if (!open) {
            setReviewOrder(null);
            setModerationError(null);
          }
        }}
      >
        <DialogContent className="max-w-md p-6 rounded-2xl bg-white dark:bg-neutral-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Star className="size-5 fill-amber-500 text-amber-500" />
              Beri Ulasan Stan
            </DialogTitle>
          </DialogHeader>

          {reviewOrder && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 text-xs">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  {reviewOrder.tenantNames.join(", ")}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 block mt-0.5">
                  Pesanan #{reviewOrder.id} ({reviewOrder.items.length} item
                  hidangan)
                </span>
              </div>

              {/* Star Rating Picker */}
              <div className="space-y-1.5 text-center">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                  Rating Pengalaman Anda
                </label>
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      aria-label={`Beri ${star} bintang`}
                    >
                      <Star
                        className={cn(
                          "size-7 transition-transform active:scale-90",
                          star <= reviewRating
                            ? "fill-amber-500 text-amber-500"
                            : "text-neutral-300 dark:text-neutral-700",
                        )}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 block">
                  {reviewRating === 5 &&
                    "Sangat Puas: Rasa Lezat & Layanan Cepat"}
                  {reviewRating === 4 && "Puas: Makanan Enak & Layanan Baik"}
                  {reviewRating === 3 && "Cukup: Perlu Sedikit Peningkatan"}
                  {reviewRating === 2 && "Kurang: Tidak Sesuai Harapan"}
                  {reviewRating === 1 && "Kecewa: Perlu Perbaikan Menyeluruh"}
                </span>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <label
                  htmlFor="review-comment"
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block"
                >
                  Tulis Ulasan Anda
                </label>
                <Textarea
                  id="review-comment"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan rasa masakan, porsi, kebersihan booth, atau keramahan staf..."
                  className="text-xs resize-none rounded-xl border-neutral-300 dark:border-neutral-700 focus-visible:ring-[#c85a32]"
                />
                <span className="text-[11px] text-neutral-400 block text-right">
                  {reviewComment.trim().length} karakter (minimal 5)
                </span>
              </div>

              {/* Moderation Error Alert */}
              {moderationError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">
                      Catatan Pemeriksaan Ulasan:
                    </span>
                    <span>{moderationError}</span>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewOrder(null)}
                  disabled={isSubmittingReview}
                  className="min-h-[44px] h-10 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={
                    isSubmittingReview || reviewComment.trim().length < 5
                  }
                  className="min-h-[44px] h-10 rounded-xl bg-[#c85a32] hover:bg-[#b04f2c] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isSubmittingReview ? "Memeriksa Ulasan..." : "Kirim Ulasan"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. Edit Profile Dialog Modal */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl bg-white dark:bg-neutral-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Edit3 className="size-5 text-[#c85a32]" />
              Ubah Informasi Profil
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-name"
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block"
              >
                Nama Tampilan
              </label>
              <Input
                id="edit-name"
                type="text"
                value={editNameInput}
                onChange={(e) => setEditNameInput(e.target.value)}
                placeholder="Nama Anda"
                required
                className="text-xs rounded-xl min-h-[44px] border-neutral-300 dark:border-neutral-700 focus-visible:ring-[#c85a32]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="edit-phone"
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block"
              >
                Nomor WhatsApp / Telepon
              </label>
              <Input
                id="edit-phone"
                type="tel"
                value={editPhoneInput}
                onChange={(e) => setEditPhoneInput(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="text-xs rounded-xl min-h-[44px] border-neutral-300 dark:border-neutral-700 focus-visible:ring-[#c85a32]"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditProfileOpen(false)}
                className="min-h-[44px] h-10 rounded-xl text-xs font-medium cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="min-h-[44px] h-10 rounded-xl bg-[#c85a32] hover:bg-[#b04f2c] text-white text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Pickup Code Dialog Modal */}
      <Dialog
        open={!!activePickupOrder}
        onOpenChange={(open) => {
          if (!open) setActivePickupOrder(null);
        }}
      >
        <DialogContent className="max-w-sm p-6 rounded-2xl bg-white dark:bg-neutral-900 text-center">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Kode Pengambilan Pesanan
            </DialogTitle>
          </DialogHeader>

          {activePickupOrder && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#c85a32]/10 border border-[#c85a32]/30 space-y-1">
                <span className="text-xs text-neutral-600 dark:text-neutral-300 block">
                  Tunjukkan kode ini kepada kasir stan:
                </span>
                <span className="font-mono text-3xl font-extrabold text-[#c85a32] tracking-widest block py-2">
                  {activePickupOrder.pickupCode}
                </span>
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
                  {activePickupOrder.tenantNames.join(", ")}
                </span>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Pesanan #{activePickupOrder.id} • {activePickupOrder.orderType}
              </p>

              <Button
                onClick={() => setActivePickupOrder(null)}
                className="w-full min-h-[44px] h-10 rounded-xl bg-[#c85a32] hover:bg-[#b04f2c] text-white text-xs font-semibold cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
