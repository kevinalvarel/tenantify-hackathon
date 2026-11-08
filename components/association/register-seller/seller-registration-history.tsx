"use client";

import { Eye, MapPin, Store } from "lucide-react";
import type { AssociationTenant } from "@/types/association";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SellerRegistrationHistoryProps = {
  tenants: AssociationTenant[];
  onSelectTenant: (tenant: AssociationTenant) => void;
};

export function SellerRegistrationHistory({
  tenants,
  onSelectTenant,
}: SellerRegistrationHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Terdaftar</CardTitle>
        <CardDescription>
          {tenants.length} tenant terdaftar di area Anda. Tenant baru muncul di
          urutan paling atas.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {tenants.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Store />
              </EmptyMedia>
              <EmptyTitle>Belum ada tenant terdaftar</EmptyTitle>
              <EmptyDescription>
                Daftarkan pedagang pertama lewat form di atas.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Tenant</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Zona / Booth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="pr-6 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          {tenant.avatar}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-semibold text-foreground">
                            {tenant.name}
                          </span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {tenant.owner} • {tenant.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {tenant.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        <span className="truncate">
                          {tenant.zone} • {tenant.boothNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tenant.status === "active" ? "default" : "outline"
                        }
                        className="text-[10px]"
                      >
                        {tenant.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tenant.joinedAt}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectTenant(tenant)}
                        className="text-xs"
                      >
                        <Eye className="size-3.5" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
