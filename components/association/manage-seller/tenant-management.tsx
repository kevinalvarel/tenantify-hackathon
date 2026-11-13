"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  MapPin,
  X,
} from "lucide-react";
import { AssociationTenant, TenantStatus } from "@/types/association";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TenantDetailDialog } from "@/components/association/tenant-detail-dialog";

type TenantManagementProps = {
  tenants: AssociationTenant[];
  onToggleStatus: (tenantId: string) => void;
  onDeleteTenant: (tenantId: string) => void;
  onSelectTenant?: (tenant: AssociationTenant) => void;
};

const statusFilterOptions: { key: TenantStatus | "all"; label: string }[] = [
  { key: "all", label: "Semua Status" },
  { key: "active", label: "Aktif" },
  { key: "inactive", label: "Nonaktif" },
];

const ASSOCIATION_CATEGORIES = [
  "Semua",
  "Makanan",
  "Minuman",
  "Kopi & Pastry",
  "Fashion",
  "Kerajinan",
] as const;

export function TenantManagement({
  tenants,
  onToggleStatus,
  onDeleteTenant,
  onSelectTenant,
}: TenantManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "all">("all");
  const [localSelectedTenant, setLocalSelectedTenant] =
    useState<AssociationTenant | null>(null);

  const handleInspectTenant = (tenant: AssociationTenant) => {
    if (onSelectTenant) {
      onSelectTenant(tenant);
    } else {
      setLocalSelectedTenant(tenant);
    }
  };

  // Filtered list
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.boothNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.zone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "Semua" || tenant.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" || tenant.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari tenant, nama pemilik, atau blok stan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          >
            {ASSOCIATION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs/Buttons */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
            {statusFilterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`text-[11px] font-medium px-2 py-1 rounded-md transition-all ${
                  statusFilter === opt.key
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            nativeButton={false}
            size="sm"
            render={<Link href="/dashboard/association/register-seller" />}
            className="gap-1.5 text-xs h-9"
          >
            <Plus className="size-3.5" />
            Registrasi Pedagang
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="shadow-xs overflow-hidden border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[280px] text-xs">
                    Tenant / Usaha
                  </TableHead>
                  <TableHead className="text-xs">Kategori & Zona</TableHead>
                  <TableHead className="text-xs">Nomor Stan</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Omzet Bulanan</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-xs text-muted-foreground"
                    >
                      Tidak ada tenant yang cocok dengan kriteria pencarian.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id} className="text-xs group">
                      {/* Name & Owner */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                            {tenant.avatar}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground leading-tight">
                              {tenant.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {tenant.owner} • {tenant.phone}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category & Zone */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <Badge
                            variant="secondary"
                            className="w-fit text-[10px] h-4 px-1"
                          >
                            {tenant.category}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {tenant.zone}
                          </span>
                        </div>
                      </TableCell>

                      {/* Booth Number */}
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <MapPin className="size-3 text-muted-foreground" />
                          {tenant.boothNumber}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {tenant.status === "active" ? (
                          <Badge
                            variant="default"
                            className="text-[10px] h-5 gap-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="size-2.5" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 gap-1 text-muted-foreground"
                          >
                            <XCircle className="size-2.5" />
                            Nonaktif
                          </Badge>
                        )}
                      </TableCell>

                      {/* Monthly Revenue */}
                      <TableCell className="font-medium">
                        {tenant.status === "active"
                          ? formatRupiah(tenant.monthlyRevenue).split(",")[0]
                          : "-"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => handleInspectTenant(tenant)}
                            title="Lihat Detail Profil"
                          >
                            <Eye className="size-3.5 text-muted-foreground" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={`size-7 ${
                              tenant.status === "active"
                                ? "text-muted-foreground hover:text-destructive"
                                : "text-emerald-600 hover:text-emerald-700"
                            }`}
                            onClick={() => onToggleStatus(tenant.id)}
                            title={
                              tenant.status === "active"
                                ? "Nonaktifkan Tenant"
                                : "Aktifkan Tenant"
                            }
                          >
                            <Power className="size-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => onDeleteTenant(tenant.id)}
                            title="Hapus Tenant"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!onSelectTenant && (
        <TenantDetailDialog
          tenant={localSelectedTenant}
          open={!!localSelectedTenant}
          onOpenChange={(open) => !open && setLocalSelectedTenant(null)}
          onToggleStatus={onToggleStatus}
          onDeleteTenant={onDeleteTenant}
        />
      )}
    </div>
  );
}
