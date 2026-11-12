"use client";

import { useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  Send,
} from "lucide-react";
import type { Promotion, PromotionType } from "@/types/seller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type PromotionsManagementProps = {
  promotions: Promotion[];
};

type FormErrors = {
  title?: string;
  message?: string;
  startDate?: string;
  endDate?: string;
};

const promotionTypes: PromotionType[] = ["Info", "Diskon", "Pengumuman"];

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatPeriod(startDate: string, endDate: string) {
  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
  if (startDate) return `Mulai ${formatDate(startDate)}`;
  if (endDate) return `Hingga ${formatDate(endDate)}`;
  return "Periode belum diatur";
}

export function PromotionsManagement({
  promotions,
}: PromotionsManagementProps) {
  const [items, setItems] = useState(promotions);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<PromotionType>("Info");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!title.trim()) nextErrors.title = "Judul promosi wajib diisi.";
    if (!message.trim()) nextErrors.message = "Isi pesan wajib diisi.";
    if (!startDate) nextErrors.startDate = "Tanggal mulai wajib diisi.";
    if (!endDate) nextErrors.endDate = "Tanggal berakhir wajib diisi.";
    if (startDate && endDate && endDate < startDate) {
      nextErrors.endDate = "Tanggal berakhir tidak boleh sebelum tanggal mulai.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const sentAt = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    setItems((prev) => [
      {
        id: `promo-${Date.now()}`,
        title: title.trim(),
        message: message.trim(),
        type,
        startDate,
        endDate,
        status: "Terkirim",
        sentAt,
      },
      ...prev,
    ]);

    setTitle("");
    setMessage("");
    setType("Info");
    setStartDate("");
    setEndDate("");
    setErrors({});
    toast.success("Notifikasi promosi terkirim (simulasi).");
  };

  const periodLabel = formatPeriod(startDate, endDate);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Buat Promosi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="promo-title">Judul promosi</Label>
                <Input
                  id="promo-title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (errors.title) {
                      setErrors((prev) => ({ ...prev, title: undefined }));
                    }
                  }}
                  placeholder="Contoh: Diskon 15% Paket Hemat"
                  maxLength={60}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? "promo-title-error" : undefined}
                  className="h-11 sm:h-8"
                />
                {errors.title && (
                  <p id="promo-title-error" className="text-xs text-destructive">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Tipe promosi</Label>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tipe promosi">
                  {promotionTypes.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      variant={type === option ? "default" : "outline"}
                      aria-pressed={type === option}
                      onClick={() => setType(option)}
                      className="h-10 sm:h-7"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="promo-message">Isi pesan</Label>
                  <span className="text-[11px] text-muted-foreground">
                    {message.length}/200
                  </span>
                </div>
                <Textarea
                  id="promo-message"
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    if (errors.message) {
                      setErrors((prev) => ({ ...prev, message: undefined }));
                    }
                  }}
                  placeholder="Tulis pemberitahuan singkat untuk pembeli..."
                  maxLength={200}
                  rows={4}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={
                    errors.message ? "promo-message-error" : undefined
                  }
                  className="min-h-24 text-base sm:text-sm"
                />
                {errors.message && (
                  <p id="promo-message-error" className="text-xs text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="promo-start">Tanggal mulai</Label>
                  <Input
                    id="promo-start"
                    type="date"
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                      if (errors.startDate) {
                        setErrors((prev) => ({ ...prev, startDate: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(errors.startDate)}
                    aria-describedby={
                      errors.startDate ? "promo-start-error" : undefined
                    }
                    className="h-11 sm:h-8"
                  />
                  {errors.startDate && (
                    <p id="promo-start-error" className="text-xs text-destructive">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="promo-end">Tanggal berakhir</Label>
                  <Input
                    id="promo-end"
                    type="date"
                    value={endDate}
                    onChange={(event) => {
                      setEndDate(event.target.value);
                      if (errors.endDate) {
                        setErrors((prev) => ({ ...prev, endDate: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(errors.endDate)}
                    aria-describedby={
                      errors.endDate ? "promo-end-error" : undefined
                    }
                    className="h-11 sm:h-8"
                  />
                  {errors.endDate && (
                    <p id="promo-end-error" className="text-xs text-destructive">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="h-11 gap-1.5 sm:h-8">
                <Send className="size-4" />
                Kirim Notifikasi
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="self-start lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              Pratinjau Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="rounded-xl border bg-background p-3">
              <div className="flex items-start gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bell className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-xs font-semibold">
                      {title.trim() || "Judul promosi"}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      Sekarang
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-3 text-xs text-muted-foreground">
                    {message.trim() ||
                      "Isi pesan promosi akan tampil di sini."}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <CalendarDays className="size-3" />
                      {periodLabel}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {type}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tampilan perkiraan notifikasi in-app. Pengiriman masih simulasi.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Megaphone className="size-4 text-primary" />
              Riwayat Promosi
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {items.length} promosi
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          {items.map((promotion) => (
            <div
              key={promotion.id}
              className="flex flex-col gap-1.5 rounded-lg border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{promotion.title}</p>
                <Badge variant="outline" className="shrink-0">
                  {promotion.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {promotion.message}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3" />
                  {formatPeriod(promotion.startDate, promotion.endDate)}
                </span>
                <span>{promotion.sentAt}</span>
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10px]"
                >
                  <CheckCircle2 className="size-3" />
                  {promotion.status}
                </Badge>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              <Megaphone className="mb-2 size-10 opacity-40" />
              <p className="text-sm font-semibold">Belum ada promosi.</p>
              <p className="text-xs">
                Promosi yang Anda kirim akan tampil di sini.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
