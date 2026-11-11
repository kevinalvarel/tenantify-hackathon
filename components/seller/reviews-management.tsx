"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Search, Send, Star, Store } from "lucide-react";
import type { SellerReview } from "@/types/seller";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ReviewsManagementProps = {
  reviews: SellerReview[];
};

const ratingTabs: (number | "Semua")[] = ["Semua", 5, 4, 3, 2, 1];

function RatingStars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "size-3.5",
            star <= rating
              ? "fill-amber-500 text-amber-500"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsManagement({ reviews }: ReviewsManagementProps) {
  const [items, setItems] = useState(reviews);
  const [activeRating, setActiveRating] = useState<number | "Semua">("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const averageRating = useMemo(
    () =>
      items.length === 0
        ? 0
        : items.reduce((sum, review) => sum + review.rating, 0) / items.length,
    [items],
  );

  const distribution = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((rating) => {
        const count = items.filter((review) => review.rating === rating).length;
        return {
          rating,
          count,
          percentage: items.length === 0 ? 0 : (count / items.length) * 100,
        };
      }),
    [items],
  );

  const filteredReviews = items.filter((review) => {
    const matchesRating =
      activeRating === "Semua" || review.rating === activeRating;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      review.customerName.toLowerCase().includes(query) ||
      review.comment.toLowerCase().includes(query);

    return matchesRating && matchesSearch;
  });

  const handleSendReply = (reviewId: string) => {
    const message = (drafts[reviewId] ?? "").trim();
    if (!message) return;

    const repliedAt = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());

    setItems((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, reply: { message, repliedAt } }
          : review,
      ),
    );
    setDrafts((prev) => ({ ...prev, [reviewId]: "" }));
    setReplyingTo(null);
    toast.success("Balasan berhasil dikirim.");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Rating summary */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex shrink-0 flex-col items-center gap-1 sm:w-40">
            <span className="text-4xl font-bold text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <RatingStars rating={Math.round(averageRating)} />
            <p className="text-xs text-muted-foreground">
              dari {items.length} ulasan
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            {distribution.map((entry) => (
              <div key={entry.rating} className="flex items-center gap-2">
                <span className="flex w-8 shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
                  {entry.rating}
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${entry.percentage}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and rating filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari nama pelanggan atau ulasan..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-8 text-xs"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {ratingTabs.map((tab) => {
            const count =
              tab === "Semua"
                ? items.length
                : items.filter((review) => review.rating === tab).length;

            return (
              <Button
                key={tab}
                variant={activeRating === tab ? "default" : "ghost"}
                size="xs"
                onClick={() => setActiveRating(tab)}
                className="shrink-0 gap-1.5 rounded-full text-xs"
              >
                <span className="flex items-center gap-1">
                  {tab === "Semua" ? "Semua" : `${tab}`}
                  {tab !== "Semua" && <Star className="size-3 fill-current" />}
                </span>
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
                    activeRating === tab
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="flex flex-col justify-between">
            <CardHeader className="p-3.5 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback className="text-xs font-semibold">
                      {review.avatarText}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-bold">
                      {review.customerName}
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground">
                      {review.createdAt}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  {review.rating}.0
                </Badge>
              </div>
              <RatingStars rating={review.rating} className="mt-1" />
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-2.5 p-3.5 pt-0">
              <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
                &ldquo;{review.comment}&rdquo;
              </p>

              {review.reply ? (
                <div className="rounded-lg border bg-muted/40 p-2.5">
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <Store className="size-3" />
                    Balasan Anda &middot; {review.reply.repliedAt}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                    {review.reply.message}
                  </p>
                </div>
              ) : replyingTo === review.id ? (
                <div className="flex flex-col gap-1.5">
                  <Textarea
                    value={drafts[review.id] ?? ""}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [review.id]: event.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Tulis balasan untuk pelanggan..."
                    className="min-h-14 text-xs"
                  />
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setReplyingTo(null)}
                    >
                      Batal
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => handleSendReply(review.id)}
                      disabled={!(drafts[review.id] ?? "").trim()}
                      className="gap-1"
                    >
                      <Send className="size-3" />
                      Kirim
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setReplyingTo(review.id)}
                  className="gap-1 self-start"
                >
                  <MessageSquare className="size-3" />
                  Balas ulasan
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredReviews.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <MessageSquare className="mb-2 size-10 opacity-40" />
            <p className="text-sm font-semibold">Tidak ada ulasan.</p>
            <p className="text-xs">
              Ulasan pelanggan yang sesuai filter akan tampil di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
