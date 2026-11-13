"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AreaZone, BoothSlot } from "@/types/association";
import type { LayoutActionResult } from "@/servers/association-server";
import type { TCreateBooth, TUpdateBooth } from "@/validations/association-layout";

type BoothFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zones: AreaZone[];
  booth: BoothSlot | null;
  defaultZoneId?: string;
  onCreate: (input: TCreateBooth) => Promise<LayoutActionResult>;
  onUpdate: (input: TUpdateBooth) => Promise<LayoutActionResult>;
};

export function BoothFormDialog({
  open,
  onOpenChange,
  zones,
  booth,
  defaultZoneId,
  onCreate,
  onUpdate,
}: BoothFormDialogProps) {
  const isEdit = Boolean(booth);
  const initialZone = booth
    ? zones.find((item) => item.code === booth.zoneCode)
    : zones.find((item) => item.id === defaultZoneId) || zones[0];
  const [zoneId, setZoneId] = useState(initialZone?.id || "");
  const [boothNumber, setBoothNumber] = useState(booth?.boothNumber || "");
  const [size, setSize] = useState(booth?.size || "");
  const [price, setPrice] = useState(
    booth ? String(booth.priceMonthly) : ""
  );
  const [status, setStatus] = useState<"available" | "reserved">(
    booth?.status === "reserved" ? "reserved" : "available"
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const occupiedByTenant = Boolean(booth?.tenantId);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const base = {
      zoneId,
      boothNumber,
      size,
      priceMonthly: price || 0,
    };

    const result =
      isEdit && booth
        ? await onUpdate({ ...base, id: booth.id, status })
        : await onCreate(base);

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah booth" : "Tambah booth"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perubahan langsung memperbarui daftar stan dan denah."
              : "Booth baru masuk ke zona yang dipilih dan tampil di denah."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="space-y-1">
            <Label htmlFor="booth-zone" className="text-xs">
              Zona
            </Label>
            <select
              id="booth-zone"
              value={zoneId}
              onChange={(event) => setZoneId(event.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border border-input bg-transparent px-2.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.code} - {zone.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="booth-number" className="text-xs">
                Nomor booth
              </Label>
              <Input
                id="booth-number"
                value={boothNumber}
                onChange={(event) => setBoothNumber(event.target.value)}
                className="h-9 text-xs font-mono"
                placeholder="A-01"
                maxLength={20}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="booth-size" className="text-xs">
                Ukuran
              </Label>
              <Input
                id="booth-size"
                value={size}
                onChange={(event) => setSize(event.target.value)}
                className="h-9 text-xs"
                placeholder="3x3 m"
                maxLength={20}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="booth-price" className="text-xs">
              Sewa per bulan (Rp)
            </Label>
            <Input
              id="booth-price"
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="h-9 text-xs"
              placeholder="Isi harga sewa"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="booth-status" className="text-xs">
              Status
            </Label>
            {occupiedByTenant ? (
              <p className="rounded-md border bg-muted/40 px-2.5 py-2 text-[11px] text-muted-foreground">
                Booth ini terhubung ke tenant, status mengikuti tenant dan
                tidak bisa diubah manual.
              </p>
            ) : (
              <select
                id="booth-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "available" | "reserved")
                }
                className="h-9 w-full cursor-pointer rounded-md border border-input bg-transparent px-2.5 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="available">Tersedia</option>
                <option value="reserved">Dipesan</option>
              </select>
            )}
          </div>

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
              {isSubmitting
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan perubahan"
                  : "Tambah booth"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
