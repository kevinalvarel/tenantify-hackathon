"use client";

import { useState } from "react";
import { Store, DollarSign, ShoppingBag, AlertTriangle, Clock, MapPin, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";

type SellerHeaderProps = {
  totalRevenue: number;
  totalOrders: number;
  lowStockCount: number;
  activeOrdersCount: number;
  storeName?: string;
  storeLocation?: string;
};

export function SellerHeader({
  totalRevenue,
  totalOrders,
  lowStockCount,
  activeOrdersCount,
  storeName = "Toko Anda",
  storeLocation = "Lokasi stan belum diatur",
}: SellerHeaderProps) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleStoreStatus = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      toast.success("Toko Anda sekarang AKTIF dan menerima pesanan.");
    } else {
      toast.warning("Toko ditutup sementara. Pesanan online dinonaktifkan.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner & Store Status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {storeName}
              </h1>
              <Badge variant={isOpen ? "default" : "destructive"}>
                {isOpen ? "Toko Buka" : "Toko Tutup"}
              </Badge>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="size-3.5" />
              {storeLocation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isOpen ? "outline" : "default"}
            size="sm"
            onClick={toggleStoreStatus}
            className="gap-1.5 text-xs"
          >
            <Power className="size-3.5" />
            {isOpen ? "Tutup Toko Sementara" : "Buka Toko Sekarang"}
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-3">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Omzet Hari Ini</p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {formatRupiah(totalRevenue)}
              </p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="size-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Transaksi Selesai</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{totalOrders} pesanan</p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <ShoppingBag className="size-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pesanan Aktif</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-lg font-bold text-foreground">{activeOrdersCount}</p>
                {activeOrdersCount > 0 && (
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="size-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Stok Menipis/Habis</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-lg font-bold text-foreground">{lowStockCount} item</p>
                {lowStockCount > 0 && (
                  <Badge variant="destructive" className="h-4 text-[10px] px-1.5">
                    Perhatian
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
