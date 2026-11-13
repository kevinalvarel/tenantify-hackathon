"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";
import type { RentInvoice, RentInvoiceStatus } from "@/types/seller";
import type { AssociationRentData } from "@/servers/rent-server";
import {
  createRentInvoiceAction,
  settleRentInvoiceAction,
} from "@/servers/rent-server";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Filter = RentInvoiceStatus | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "unpaid", label: "Belum dibayar" },
  { key: "paid", label: "Lunas" },
  { key: "overdue", label: "Terlambat" },
];

const SETTLE_METHODS = ["Transfer Bank", "Tunai"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return toIsoDate(date);
}

function StatusBadge({ status }: { status: RentInvoiceStatus }) {
  if (status === "paid") {
    return (
      <Badge className="text-[10px] h-5 gap-1 bg-emerald-600 hover:bg-emerald-600">
        <CheckCircle2 className="size-2.5" />
        Lunas
      </Badge>
    );
  }

  if (status === "overdue") {
    return (
      <Badge variant="destructive" className="text-[10px] h-5 gap-1">
        <AlertCircle className="size-2.5" />
        Terlambat
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-[10px] h-5 gap-1">
      <Clock className="size-2.5" />
      Belum dibayar
    </Badge>
  );
}

export function AssociationPayments({ data }: { data: AssociationRentData }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [issueOpen, setIssueOpen] = useState(false);
  const [detail, setDetail] = useState<RentInvoice | null>(null);
  const [settleMethod, setSettleMethod] = useState(SETTLE_METHODS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [form, setForm] = useState({
    tenantId: "",
    period: currentPeriod(),
    dueDate: defaultDueDate(),
    baseRent: "0",
    maintenanceFee: "0",
    electricityFee: "0",
  });

  const invoices = data.invoices;

  const summary = useMemo(() => {
    const reducer = (total: number, invoice: RentInvoice) =>
      total + invoice.totalAmount;

    return {
      total: invoices.reduce(reducer, 0),
      paid: invoices.filter((i) => i.status === "paid").reduce(reducer, 0),
      unpaid: invoices.filter((i) => i.status === "unpaid").reduce(reducer, 0),
      overdue: invoices.filter((i) => i.status === "overdue").reduce(reducer, 0),
      paidCount: invoices.filter((i) => i.status === "paid").length,
      unpaidCount: invoices.filter((i) => i.status === "unpaid").length,
      overdueCount: invoices.filter((i) => i.status === "overdue").length,
    };
  }, [invoices]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? invoices
        : invoices.filter((invoice) => invoice.status === filter),
    [filter, invoices]
  );

  const openIssueDialog = () => {
    const firstTenant = data.tenants[0];
    setForm({
      tenantId: firstTenant?.id ?? "",
      period: currentPeriod(),
      dueDate: defaultDueDate(),
      baseRent: String(firstTenant?.priceMonthly ?? 0),
      maintenanceFee: "0",
      electricityFee: "0",
    });
    setIssueOpen(true);
  };

  const handleTenantChange = (tenantId: string) => {
    const tenant = data.tenants.find((item) => item.id === tenantId);
    setForm((prev) => ({
      ...prev,
      tenantId,
      baseRent: String(tenant?.priceMonthly ?? 0),
    }));
  };

  const formTotal =
    Number(form.baseRent) +
    Number(form.maintenanceFee) +
    Number(form.electricityFee);

  const handleCreateInvoice = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsCreating(true);
    const result = await createRentInvoiceAction({
      tenantId: form.tenantId,
      period: form.period,
      dueDate: form.dueDate,
      baseRent: Number(form.baseRent),
      maintenanceFee: Number(form.maintenanceFee),
      electricityFee: Number(form.electricityFee),
    });
    setIsCreating(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setIssueOpen(false);
    router.refresh();
  };

  const handleSettle = async () => {
    if (!detail) return;
    setIsSettling(true);
    const result = await settleRentInvoiceAction(detail.id, settleMethod);
    setIsSettling(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setDetail(null);
    router.refresh();
  };

  if (data.error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col items-start gap-3 py-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertCircle className="size-4" />
            Data pembayaran tidak bisa dimuat
          </div>
          <p className="text-xs text-muted-foreground">{data.error}</p>
          <Button size="sm" variant="outline" onClick={() => router.refresh()}>
            Coba lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">
            Pembayaran Pedagang
          </h1>
          <p className="text-sm text-muted-foreground">
            Tagihan sewa stan, status pembayaran, dan verifikasi dari pedagang.
          </p>
        </div>
        <Button onClick={openIssueDialog} className="gap-1.5">
          <Plus className="size-4" />
          Terbitkan Tagihan
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Total tagihan
          </p>
          <p className="mt-1 text-lg font-bold">{formatRupiah(summary.total)}</p>
          <p className="text-[11px] text-muted-foreground">
            {invoices.length} tagihan tercatat
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Lunas</p>
          <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(summary.paid)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {summary.paidCount} tagihan
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Belum dibayar
          </p>
          <p className="mt-1 text-lg font-bold">{formatRupiah(summary.unpaid)}</p>
          <p className="text-[11px] text-muted-foreground">
            {summary.unpaidCount} tagihan
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Terlambat</p>
          <p className="mt-1 text-lg font-bold text-destructive">
            {formatRupiah(summary.overdue)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {summary.overdueCount} tagihan
          </p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b pb-2 scrollbar-none">
        {FILTERS.map((item) => {
          const count =
            item.key === "all"
              ? invoices.length
              : invoices.filter((invoice) => invoice.status === item.key).length;

          return (
            <Button
              key={item.key}
              variant={filter === item.key ? "default" : "ghost"}
              size="xs"
              onClick={() => setFilter(item.key)}
              className="rounded-full text-xs gap-1.5"
            >
              <span>{item.label}</span>
              <span className="size-4 rounded-full bg-black/10 text-[10px] flex items-center justify-center font-bold dark:bg-white/20">
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Pedagang</TableHead>
                  <TableHead className="text-xs">Periode</TableHead>
                  <TableHead className="text-xs">Jatuh Tempo</TableHead>
                  <TableHead className="text-xs">Nominal</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Pembayaran</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="size-6 text-muted-foreground" />
                        <p className="text-sm font-semibold">
                          Belum ada tagihan sewa
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Terbitkan tagihan pertama untuk pedagang aktif.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-20 text-center text-xs text-muted-foreground"
                    >
                      Tidak ada tagihan dengan status ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((invoice) => (
                    <TableRow key={invoice.id} className="text-xs">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {invoice.tenantName}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Stan {invoice.boothNumber} ({invoice.boothSize})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {invoice.period}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {invoice.invoiceNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.dueDate}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatRupiah(invoice.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.status === "paid"
                          ? `${invoice.paymentMethod || "-"} · ${
                              invoice.paidAt || "-"
                            }`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSettleMethod(SETTLE_METHODS[0]);
                            setDetail(invoice);
                          }}
                          className="text-xs h-7"
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Terbitkan Tagihan */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Wallet className="size-4 text-primary" />
              Terbitkan Tagihan Sewa
            </DialogTitle>
            <DialogDescription className="text-xs">
              Nominal sewa pokok terisi dari harga booth pedagang. Rincian lain
              bisa disesuaikan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invoice-tenant">Pedagang</Label>
              <select
                id="invoice-tenant"
                value={form.tenantId}
                onChange={(event) => handleTenantChange(event.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Pilih pedagang</option>
                {data.tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} · Stan {tenant.boothNumber}
                  </option>
                ))}
              </select>
              {data.tenants.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Belum ada pedagang aktif. Daftarkan pedagang terlebih dahulu.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invoice-period">Periode</Label>
                <Input
                  id="invoice-period"
                  type="month"
                  value={form.period}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, period: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invoice-due">Jatuh tempo</Label>
                <Input
                  id="invoice-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      dueDate: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invoice-base">Sewa pokok</Label>
                <Input
                  id="invoice-base"
                  type="number"
                  min={0}
                  step={1000}
                  value={form.baseRent}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      baseRent: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invoice-maintenance">Kebersihan</Label>
                <Input
                  id="invoice-maintenance"
                  type="number"
                  min={0}
                  step={1000}
                  value={form.maintenanceFee}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      maintenanceFee: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invoice-electricity">Listrik</Label>
                <Input
                  id="invoice-electricity"
                  type="number"
                  min={0}
                  step={1000}
                  value={form.electricityFee}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      electricityFee: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                Total tagihan
              </span>
              <span className="text-sm font-bold">{formatRupiah(formTotal)}</span>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIssueOpen(false)}
                disabled={isCreating}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating || !form.tenantId || formTotal <= 0}
              >
                {isCreating ? "Menerbitkan..." : "Terbitkan Tagihan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail & Verifikasi */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Receipt className="size-4 text-primary" />
              Tagihan {detail?.invoiceNumber}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {detail?.tenantName} · Stan {detail?.boothNumber} ·{" "}
              {detail?.period}
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/40 p-3 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sewa pokok</span>
                  <span className="font-medium text-foreground">
                    {formatRupiah(detail.baseRent)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Iuran kebersihan</span>
                  <span className="font-medium text-foreground">
                    {formatRupiah(detail.maintenanceFee)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Utilitas listrik</span>
                  <span className="font-medium text-foreground">
                    {formatRupiah(detail.electricityFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1.5 text-sm font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatRupiah(detail.totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={detail.status} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Jatuh tempo</span>
                <span className="font-medium text-foreground">
                  {detail.dueDate}
                </span>
              </div>

              {detail.status === "paid" ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Sudah lunas
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {detail.paymentMethod || "-"} · {detail.paidAt || "-"}
                  </p>
                  <p className="text-muted-foreground">
                    Kuitansi: {detail.receiptNumber || "-"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3">
                  <Label htmlFor="settle-method" className="text-xs">
                    Metode verifikasi
                  </Label>
                  <select
                    id="settle-method"
                    value={settleMethod}
                    onChange={(event) => setSettleMethod(event.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {SETTLE_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handleSettle}
                    disabled={isSettling}
                    className="mt-1 gap-1.5"
                  >
                    <CheckCircle2 className="size-3.5" />
                    {isSettling ? "Menyimpan..." : "Tandai Lunas"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
