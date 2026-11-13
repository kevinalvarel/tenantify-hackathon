"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LayoutActionResult } from "@/servers/association-server";
import type { TCreateZone } from "@/validations/association-layout";

const CATEGORY_OPTIONS = [
  "Makanan",
  "Minuman",
  "Kopi & Pastry",
  "Fashion",
  "Kerajinan",
];

function nextZoneCode(codes: string[]) {
  let highest = 0;
  for (const code of codes) {
    const match = /^Z([A-Z])$/i.exec(code.trim());
    if (match) {
      highest = Math.max(highest, match[1].toUpperCase().charCodeAt(0) - 64);
    }
  }
  if (highest >= 26) return `Z${highest + 1}`;
  return `Z${String.fromCharCode(65 + highest)}`;
}

function boothPreview(code: string, startNumber: number, count: number) {
  const prefix = code.trim().replace(/^Z/i, "") || "A";
  return Array.from({ length: Math.min(count, 3) }, (_, index) =>
    `${prefix}-${String(startNumber + index).padStart(2, "0")}`
  ).join(", ");
}

type ZoneFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCodes: string[];
  onSubmit: (input: TCreateZone) => Promise<LayoutActionResult>;
};

const EMPTY_FORM = {
  code: "",
  name: "",
  description: "",
  categoryFocus: "",
  boothCount: "0",
  startNumber: "1",
  size: "",
  priceMonthly: "",
};

export function ZoneFormDialog({
  open,
  onOpenChange,
  existingCodes,
  onSubmit,
}: ZoneFormDialogProps) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    code: nextZoneCode(existingCodes),
  }));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const boothCount = Number(form.boothCount) || 0;
  const startNumber = Number(form.startNumber) || 1;
  const preview = useMemo(
    () => boothPreview(form.code, startNumber, boothCount),
    [form.code, startNumber, boothCount]
  );

  const update = (key: keyof typeof EMPTY_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await onSubmit({
      code: form.code,
      name: form.name,
      description: form.description,
      categoryFocus: form.categoryFocus,
      boothCount: form.boothCount,
      startNumber: form.startNumber,
      size: form.size,
      priceMonthly: form.priceMonthly || 0,
    });

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah zona</DialogTitle>
          <DialogDescription>
            Zona baru langsung muncul di denah dan daftar stan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="zone-code" className="text-xs">
                Kode zona
              </Label>
              <Input
                id="zone-code"
                value={form.code}
                onChange={(event) => update("code", event.target.value)}
                className="h-9 text-xs font-mono uppercase"
                maxLength={8}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="zone-category" className="text-xs">
                Fokus kategori
              </Label>
              <select
                id="zone-category"
                value={form.categoryFocus}
                onChange={(event) =>
                  update("categoryFocus", event.target.value)
                }
                className="h-9 w-full cursor-pointer rounded-md border border-input bg-transparent px-2.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Tanpa fokus</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="zone-name" className="text-xs">
              Nama zona
            </Label>
            <Input
              id="zone-name"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              className="h-9 text-xs"
              placeholder="Contoh: Zona A (Kuliner & Minuman)"
              maxLength={80}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="zone-description" className="text-xs">
              Deskripsi
            </Label>
            <Textarea
              id="zone-description"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className="min-h-16 text-xs"
              placeholder="Keterangan singkat area"
              maxLength={160}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="zone-booth-count" className="text-xs">
                Jumlah booth
              </Label>
              <Input
                id="zone-booth-count"
                type="number"
                min={0}
                max={200}
                value={form.boothCount}
                onChange={(event) => update("boothCount", event.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="zone-start-number" className="text-xs">
                Nomor awal
              </Label>
              <Input
                id="zone-start-number"
                type="number"
                min={1}
                max={999}
                value={form.startNumber}
                onChange={(event) => update("startNumber", event.target.value)}
                className="h-9 text-xs"
                disabled={boothCount === 0}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="zone-size" className="text-xs">
                Ukuran booth
              </Label>
              <Input
                id="zone-size"
                value={form.size}
                onChange={(event) => update("size", event.target.value)}
                className="h-9 text-xs"
                placeholder="3x3 m"
                maxLength={20}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="zone-price" className="text-xs">
                Sewa per bulan (Rp)
              </Label>
              <Input
                id="zone-price"
                type="number"
                min={0}
                value={form.priceMonthly}
                onChange={(event) => update("priceMonthly", event.target.value)}
                className="h-9 text-xs"
                placeholder="Isi harga sewa"
                required
              />
            </div>
          </div>

          <p className="rounded-md border border-dashed bg-muted/40 px-2.5 py-2 text-[11px] text-muted-foreground">
            {boothCount > 0
              ? `Booth yang dibuat: ${preview}${boothCount > 3 ? `, dan ${boothCount - 3} lainnya` : ""}`
              : "Belum ada booth yang dibuat. Booth bisa ditambahkan setelah zona tersimpan."}
          </p>

          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="min-h-11 sm:min-h-8"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 sm:min-h-8"
            >
              <Plus className="size-4" aria-hidden="true" />
              {isSubmitting ? "Menyimpan..." : "Simpan zona"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
