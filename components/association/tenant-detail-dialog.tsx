"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Package,
  Power,
  Trash2,
  Star,
} from "lucide-react";
import { AssociationTenant } from "@/types/association";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/association/layout/confirm-delete-dialog";
import type { LayoutActionResult } from "@/servers/association-server";
import { toast } from "sonner";

type TenantDetailDialogProps = {
  tenant: AssociationTenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleStatus: (tenantId: string) => void;
  onDeleteTenant: (tenantId: string) => Promise<LayoutActionResult>;
};

export function TenantDetailDialog({
  tenant,
  open,
  onOpenChange,
  onToggleStatus,
  onDeleteTenant,
}: TenantDetailDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!tenant) return null;

  const handleDeleteConfirm = async () => {
    const result = await onDeleteTenant(tenant.id);
    if (!result.success) {
      toast.error(result.message);
      return false;
    }
    toast.success(result.message);
    onOpenChange(false);
    return true;
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-base">
              {tenant.avatar}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {tenant.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px]">
                  {tenant.category}
                </Badge>
                <Badge
                  variant={tenant.status === "active" ? "default" : "outline"}
                  className="text-[10px]"
                >
                  {tenant.status === "active" ? "Aktif Beroperasi" : "Nonaktif"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 text-xs">
          {/* Deskripsi Usaha */}
          {tenant.description && (
            <div className="bg-muted/40 p-3 rounded-lg border">
              <p className="text-muted-foreground italic">
                &ldquo;{tenant.description}&rdquo;
              </p>
            </div>
          )}

          {/* Grid Informasi Kontak & Penempatan */}
          <div className="grid grid-cols-2 gap-3 bg-card p-3 rounded-lg border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Pemilik Usaha
              </p>
              <p className="font-medium text-foreground mt-0.5">{tenant.owner}</p>
            </div>

            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Bergabung Sejak
              </p>
              <p className="font-medium text-foreground mt-0.5">{tenant.joinedAt}</p>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{tenant.email}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-3.5 text-primary shrink-0" />
              <span>{tenant.phone}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span>
                {tenant.zone} • {tenant.boothNumber}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Star className="size-3.5 fill-amber-500 text-amber-500 shrink-0" />
              <span className="font-semibold text-foreground">
                {tenant.rating.toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          {/* Statistik Performa Singkat */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">Katalog Menu</span>
                <Package className="size-3.5 text-primary" />
              </div>
              <p className="text-base font-bold text-foreground mt-1">
                {tenant.totalProducts} Produk
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">Omzet Rata-rata</span>
                <TrendingUp className="size-3.5 text-emerald-600" />
              </div>
              <p className="text-base font-bold text-foreground mt-1">
                {formatRupiah(tenant.monthlyRevenue).split(",")[0]}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t pt-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="text-xs w-full sm:w-auto gap-1"
          >
            <Trash2 className="size-3.5" />
            Hapus Tenant
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant={tenant.status === "active" ? "outline" : "default"}
              size="sm"
              onClick={() => onToggleStatus(tenant.id)}
              className="text-xs gap-1.5"
            >
              <Power className="size-3.5" />
              {tenant.status === "active" ? "Nonaktifkan" : "Aktifkan"}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Tutup
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {confirmOpen && (
      <ConfirmDeleteDialog
        open
        onOpenChange={(next) => !next && setConfirmOpen(false)}
        title="Hapus tenant?"
        description={`Tenant "${tenant.name}" beserta produk, pesanan, dan tagihan sewanya akan dihapus permanen.`}
        confirmLabel="Hapus tenant"
        onConfirm={handleDeleteConfirm}
      />
    )}
    </>
  );
}
