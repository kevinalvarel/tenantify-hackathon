"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  RotateCcw,
  Store,
  QrCode,
  ShoppingBag,
  MessageSquarePlus,
  Star,
  ShieldAlert,
} from "lucide-react";
import { CustomerOrder, CustomerOrderStatus } from "@/types/customer";
import type { CommentClassificationResult } from "@/lib/ai-client";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type CustomerOrdersHistoryProps = {
  orders: CustomerOrder[];
  onReorder: (order: CustomerOrder) => void;
};

const statusFilters = ["Semua", "Berjalan", "Selesai", "Dibatalkan"] as const;

export function CustomerOrdersHistory({
  orders,
  onReorder,
}: CustomerOrdersHistoryProps) {
  const [selectedFilter, setSelectedFilter] =
    useState<(typeof statusFilters)[number]>("Semua");
  const [activeCodeDialogOrder, setActiveCodeDialogOrder] =
    useState<CustomerOrder | null>(null);
  const [reviewOrder, setReviewOrder] = useState<CustomerOrder | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [moderationOutcome, setModerationOutcome] = useState<{
    accepted: boolean;
    moderation: CommentClassificationResult;
  } | null>(null);
  const [submittedReviews, setSubmittedReviews] = useState<
    Record<
      string,
      {
        rating: number;
        comment: string;
        badge: string;
      }
    >
  >({});

  const openReviewDialog = (order: CustomerOrder) => {
    setReviewOrder(order);
    setReviewRating(5);
    setReviewComment("");
    setModerationOutcome(null);
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder || !reviewComment.trim()) {
      toast.error("Tulis ulasan Anda terlebih dahulu.");
      return;
    }

    setIsSubmittingReview(true);
    setModerationOutcome(null);

    try {
      const res = await fetch("/api/reviews/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentText: reviewComment.trim(),
          commentId: `cmt-${reviewOrder.id}`,
          tenantId: reviewOrder.tenantNames[0],
          rating: reviewRating,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses ulasan.");
      }

      setModerationOutcome(data);

      if (data.accepted) {
        const badge =
          data.moderation?.dashboard_badge || data.moderation?.category || "Terkirim";
        setSubmittedReviews((prev) => ({
          ...prev,
          [reviewOrder.id]: {
            rating: reviewRating,
            comment: reviewComment.trim(),
            badge,
          },
        }));
        toast.success(`Ulasan terkirim (${badge})`);
      } else {
        toast.error("Ulasan otomatis ditolak oleh filter AI NLU.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim ulasan.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === "Semua") return true;
    if (selectedFilter === "Berjalan") {
      return (
        order.status === "Diterima" ||
        order.status === "Disiapkan" ||
        order.status === "Siap Diambil"
      );
    }
    return order.status === selectedFilter;
  });

  const getStatusBadge = (status: CustomerOrderStatus) => {
    switch (status) {
      case "Diterima":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 text-amber-600 gap-1"
          >
            <Clock className="size-3" />
            Menunggu Konfirmasi
          </Badge>
        );
      case "Disiapkan":
        return (
          <Badge
            variant="secondary"
            className="border-primary/30 text-primary gap-1"
          >
            <ChefHat className="size-3" />
            Sedang Dimasak
          </Badge>
        );
      case "Siap Diambil":
        return (
          <Badge
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1 animate-pulse"
          >
            <BellRing className="size-3" />
            Siap Diambil di Booth!
          </Badge>
        );
      case "Selesai":
        return (
          <Badge
            variant="outline"
            className="text-emerald-700 dark:text-emerald-400 gap-1 border-emerald-500/30"
          >
            <CheckCircle2 className="size-3" />
            Selesai
          </Badge>
        );
      case "Dibatalkan":
        return <Badge variant="destructive">Dibatalkan</Badge>;
    }
  };

  // Step tracker helper
  const getStepIndex = (status: CustomerOrderStatus) => {
    switch (status) {
      case "Diterima":
        return 1;
      case "Disiapkan":
        return 2;
      case "Siap Diambil":
        return 3;
      case "Selesai":
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Filter Tabs */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {statusFilters.map((tab) => {
            const count =
              tab === "Semua"
                ? orders.length
                : tab === "Berjalan"
                  ? orders.filter(
                      (o) =>
                        o.status === "Diterima" ||
                        o.status === "Disiapkan" ||
                        o.status === "Siap Diambil",
                    ).length
                  : orders.filter((o) => o.status === tab).length;

            return (
              <Button
                key={tab}
                variant={selectedFilter === tab ? "default" : "ghost"}
                size="xs"
                onClick={() => setSelectedFilter(tab)}
                className="rounded-full text-xs gap-1.5"
              >
                <span>{tab}</span>
                <span
                  className={`size-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    selectedFilter === tab
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        {filteredOrders.map((order) => {
          const currentStep = getStepIndex(order.status);
          const isOngoing =
            order.status === "Diterima" ||
            order.status === "Disiapkan" ||
            order.status === "Siap Diambil";

          return (
            <Card
              key={order.id}
              className={`border transition-all ${
                order.status === "Siap Diambil"
                  ? "border-emerald-500/50 bg-emerald-500/5 shadow-xs"
                  : isOngoing
                    ? "border-primary/30 bg-card"
                    : "bg-card"
              }`}
            >
              <CardHeader className="p-4 pb-3 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-foreground">
                      #{order.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {order.createdAt}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono font-bold text-primary"
                    >
                      Kode: {order.pickupCode}
                    </Badge>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Progress bar tracker for ongoing orders */}
                {isOngoing && (
                  <div className="mt-3 pt-2 border-t">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1.5">
                      <span
                        className={
                          currentStep >= 1 ? "text-primary font-bold" : ""
                        }
                      >
                        1. Diterima
                      </span>
                      <span
                        className={
                          currentStep >= 2 ? "text-primary font-bold" : ""
                        }
                      >
                        2. Disiapkan
                      </span>
                      <span
                        className={
                          currentStep >= 3 ? "text-emerald-600 font-bold" : ""
                        }
                      >
                        3. Siap Diambil
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-4 flex flex-col gap-3">
                {/* Tenants & Items info */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Store className="size-3.5 text-primary" />
                    <span>Tenant:</span>
                    <strong className="text-foreground">
                      {order.tenantNames.join(" & ")}
                    </strong>
                    {order.tableNumber && (
                      <span className="ml-2 font-medium text-foreground bg-muted px-2 py-0.5 rounded-md">
                        {order.tableNumber}
                      </span>
                    )}
                  </div>

                  <div className="divide-y border rounded-xl p-3 bg-muted/20 flex flex-col gap-1.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start text-xs py-1"
                      >
                        <div>
                          <p className="font-bold text-foreground">
                            {item.quantity}x {item.productName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Dari: {item.tenantName}
                          </p>
                          {item.notes && (
                            <p className="text-[10px] text-primary italic">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-muted-foreground">
                          {formatRupiah(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer: Total & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t">
                  <div>
                    <span className="text-[11px] text-muted-foreground">
                      Total Pembayaran ({order.paymentMethod}):
                    </span>
                    <p className="text-base font-bold text-primary">
                      {formatRupiah(order.total)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReviewDialog(order)}
                      className="gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <MessageSquarePlus className="size-3.5" />
                      {submittedReviews[order.id] ? "Ulas Lagi" : "Beri Ulasan"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveCodeDialogOrder(order)}
                      className="gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <QrCode className="size-3.5" />
                      Kode Pengambilan
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onReorder(order);
                        toast.success(
                          "Menu dari pesanan ini dimasukkan kembali ke keranjang!",
                        );
                      }}
                      className="gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      Pesan Lagi
                    </Button>
                  </div>
                </div>

                {submittedReviews[order.id] && (
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" />
                        Ulasan Anda ({submittedReviews[order.id].rating}/5)
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-semibold"
                      >
                        {submittedReviews[order.id].badge}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      &ldquo;{submittedReviews[order.id].comment}&rdquo;
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            <ShoppingBag className="size-10 mb-2 opacity-40" />
            <p className="text-sm font-semibold text-foreground">
              Belum Ada Riwayat Pesanan
            </p>
            <p className="text-xs max-w-sm mt-0.5">
              Pesanan kuliner yang Anda buat di bazaar akan tercatat di sini
              lengkap dengan pemantauan status real-time.
            </p>
          </div>
        )}
      </div>

      {/* MODAL KODE PENGAMBILAN */}
      {activeCodeDialogOrder && (
        <Dialog
          open={!!activeCodeDialogOrder}
          onOpenChange={(open) => !open && setActiveCodeDialogOrder(null)}
        >
          <DialogContent className="sm:max-w-sm text-center">
            <DialogHeader>
              <DialogTitle className="text-center font-bold">
                Kode Pengambilan Pesanan
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center gap-3 p-4 bg-muted/40 rounded-xl border">
              <span className="text-xs text-muted-foreground font-medium">
                Tunjukkan kode ini ke petugas booth tenant
              </span>
              <p className="text-4xl font-extrabold font-mono text-primary tracking-widest my-1">
                {activeCodeDialogOrder.pickupCode}
              </p>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <p>Order ID: #{activeCodeDialogOrder.id}</p>
                <p>Tenant: {activeCodeDialogOrder.tenantNames.join(", ")}</p>
                {activeCodeDialogOrder.tableNumber && (
                  <p className="font-semibold text-foreground">
                    Antar ke: {activeCodeDialogOrder.tableNumber}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="default"
                className="w-full"
                onClick={() => setActiveCodeDialogOrder(null)}
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL ULASAN & MODERASI AI NLU */}
      {reviewOrder && (
        <Dialog
          open={!!reviewOrder}
          onOpenChange={(open) => !open && setReviewOrder(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-bold">
                Beri Ulasan Pesanan #{reviewOrder.id}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              <div className="text-xs text-muted-foreground">
                Tenant:{" "}
                <strong className="text-foreground">
                  {reviewOrder.tenantNames.join(", ")}
                </strong>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground block">
                  Rating Anda
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer transition-transform active:scale-95"
                      aria-label={`Beri ${star} bintang`}
                    >
                      <Star
                        className={`size-6 ${
                          star <= reviewRating
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="order-review-comment"
                  className="text-xs font-semibold text-foreground block"
                >
                  Komentar & Saran
                </label>
                <Textarea
                  id="order-review-comment"
                  placeholder="Tulis pengalaman Anda tentang rasa, porsi, atau pelayanan tenant..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="resize-none h-24 text-xs"
                />
              </div>

              {moderationOutcome && (
                <div
                  className={`rounded-xl border p-3 text-xs space-y-1 ${
                    moderationOutcome.accepted
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    {moderationOutcome.accepted ? (
                      <CheckCircle2 className="size-4 shrink-0" />
                    ) : (
                      <ShieldAlert className="size-4 shrink-0" />
                    )}
                    <span>
                      {moderationOutcome.moderation.dashboard_badge ||
                        moderationOutcome.moderation.category}
                    </span>
                  </p>
                  <p className="text-[11px] opacity-90">
                    {moderationOutcome.moderation.moderation_reason}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setReviewOrder(null)}
              >
                Tutup
              </Button>
              <Button
                type="button"
                disabled={isSubmittingReview || !reviewComment.trim()}
                onClick={handleSubmitReview}
              >
                {isSubmittingReview ? "Memeriksa NLU..." : "Kirim Ulasan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
