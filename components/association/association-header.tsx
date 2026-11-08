"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  UserX,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";

type AssociationHeaderProps = {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalRevenue: number;
  occupancyRate: number;
  totalBooths: number;
  occupiedBooths: number;
  areaName?: string;
  areaAddress?: string;
};

export function AssociationHeader({
  totalTenants,
  activeTenants,
  inactiveTenants,
  totalRevenue,
  occupancyRate,
  totalBooths,
  occupiedBooths,
  areaName = "Area Bazaar",
  areaAddress = "Alamat area belum diatur",
}: AssociationHeaderProps) {
  const [isAreaOpen, setIsAreaOpen] = useState(true);

  const toggleAreaStatus = () => {
    const next = !isAreaOpen;
    setIsAreaOpen(next);
    if (next) {
      toast.success("Area Bazaar diaktifkan. Semua tenant dapat bertransaksi.");
    } else {
      toast.warning("Area Bazaar dinonaktifkan sementara.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner & Area Management Identity */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {areaName}
              </h1>
              <Badge variant={isAreaOpen ? "default" : "destructive"}>
                {isAreaOpen ? "Bazaar Beroperasi" : "Bazaar Tutup"}
              </Badge>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex text-[11px]"
              >
                Association (Pengelola)
              </Badge>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="size-3.5" />
              {areaAddress}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleAreaStatus}
            className="text-xs"
          >
            {isAreaOpen ? "Tutup Area Sementara" : "Buka Area Sekarang"}
          </Button>
          <Button
            size="sm"
            render={<Link href="/dashboard/association/register-seller" />}
            className="gap-1.5 text-xs"
            nativeButton={false}
          >
            <Plus className="size-3.5" />
            Registrasi Pedagang
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* Card 1: Total Tenants */}
        <Card className="p-3">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Tenant Terdaftar
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <p className="text-lg font-bold text-foreground">
                  {totalTenants}
                </p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ({activeTenants} aktif)
                </span>
              </div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Tenant Nonaktif */}
        <Card className="p-3">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Tenant Nonaktif
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <p className="text-lg font-bold text-foreground">
                  {inactiveTenants}
                </p>
                {inactiveTenants > 0 && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    perlu ditinjau
                  </span>
                )}
              </div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserX className="size-4" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Okupansi Booth */}
        <Card className="p-3">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Okupansi Booth
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <p className="text-lg font-bold text-foreground">
                  {occupancyRate}%
                </p>
                <span className="text-xs text-muted-foreground">
                  ({occupiedBooths}/{totalBooths} booth)
                </span>
              </div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <ShieldCheck className="size-4" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Estimasi Omzet Area */}
        <Card className="p-3">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Estimasi Omzet Area (Bulan Ini)
              </p>
              <p className="text-lg font-bold text-foreground mt-0.5 truncate">
                {formatRupiah(totalRevenue)}
              </p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Alias untuk kompatibilitas ke belakang
export const ProviderHeader = AssociationHeader;
