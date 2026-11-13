"use client";

import { useState } from "react";
import {
  Building2,
  CreditCard,
  CheckCircle2,
  Clock,
  Receipt,
  Copy,
  Store,
  Printer,
  Check,
} from "lucide-react";
import { RentInvoice, RentPaymentHistoryItem } from "@/types/seller";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

type RentPaymentSystemProps = {
  invoices: RentInvoice[];
  paymentHistory: RentPaymentHistoryItem[];
  onPayInvoice: (
    invoiceId: string,
    method: string
  ) => Promise<{ success: boolean; receiptNumber: string; message: string }>;
};

// shortcut: payment settles without a gateway, wire a real payment provider before production.
const PAYMENT_METHODS = [
  {
    id: "Transfer Bank",
    name: "Transfer Bank",
    description:
      "Transfer ke rekening resmi pengelola area, lalu catat pembayaran di sini.",
    icon: <CreditCard className="size-4" />,
  },
  {
    id: "Tunai",
    name: "Tunai di Pengelola",
    description:
      "Bayar langsung ke pengelola area. Pengelola memverifikasi dari sisinya.",
    icon: <Building2 className="size-4" />,
  },
];

export function RentPaymentSystem({
  invoices,
  paymentHistory,
  onPayInvoice,
}: RentPaymentSystemProps) {
  // Modal states
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] =
    useState<RentInvoice | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("Transfer Bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Receipt modal state
  const [receiptData, setReceiptData] = useState<{
    invoiceNumber: string;
    receiptNumber: string;
    period: string;
    associationName: string;
    boothNumber: string;
    boothSize: string;
    amount: number;
    baseRent: number;
    maintenanceFee: number;
    electricityFee: number;
    paidAt: string;
    paymentMethod: string;
  } | null>(null);

  // Active current unpaid invoice (highest priority)
  const currentUnpaidInvoice = invoices.find(
    (inv) => inv.status === "unpaid" || inv.status === "overdue"
  );
  const paidInvoicesCount = invoices.filter(
    (inv) => inv.status === "paid"
  ).length;
  const activeInvoice = currentUnpaidInvoice ?? invoices[0];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    toast.success("Nomor rekening berhasil disalin ke clipboard!");
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleConfirmPayment = async () => {
    const invoice = selectedInvoiceToPay;
    if (!invoice) return;

    setIsProcessing(true);
    const result = await onPayInvoice(invoice.id, selectedMethod);
    setIsProcessing(false);

    if (!result.success) {
      toast.error(
        result.message || "Gagal memproses pembayaran. Silakan coba kembali."
      );
      return;
    }

    toast.success(`Pembayaran sewa ${invoice.period} berhasil dicatat!`);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeFormatted = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setReceiptData({
      invoiceNumber: invoice.invoiceNumber,
      receiptNumber: result.receiptNumber,
      period: invoice.period,
      associationName: invoice.associationName,
      boothNumber: invoice.boothNumber,
      boothSize: invoice.boothSize,
      amount: invoice.totalAmount,
      baseRent: invoice.baseRent,
      maintenanceFee: invoice.maintenanceFee,
      electricityFee: invoice.electricityFee,
      paidAt: `${dateFormatted}, ${timeFormatted} WIB`,
      paymentMethod: selectedMethod,
    });

    setSelectedInvoiceToPay(null);
  };

  const handleInspectHistoricalReceipt = (item: RentPaymentHistoryItem) => {
    const matchedInvoice = invoices.find((inv) => inv.id === item.invoiceId);
    setReceiptData({
      invoiceNumber: matchedInvoice?.invoiceNumber || item.invoiceId,
      receiptNumber: item.receiptNumber,
      period: item.period,
      associationName: item.associationName,
      boothNumber: item.boothNumber,
      boothSize: matchedInvoice?.boothSize || "-",
      amount: item.amount,
      baseRent: matchedInvoice?.baseRent ?? 0,
      maintenanceFee: matchedInvoice?.maintenanceFee ?? 0,
      electricityFee: matchedInvoice?.electricityFee ?? 0,
      paidAt: item.paidAt,
      paymentMethod: item.paymentMethod,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Overview */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Pembayaran Sewa Stan Komersial
                </h2>
                <Badge variant="outline" className="text-[11px]">
                  {activeInvoice?.boothNumber || "Stan belum diatur"}
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <Building2 className="size-3.5 text-primary" />
                Pengelola:{" "}
                {activeInvoice?.associationName || "Belum ada data pengelola"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={currentUnpaidInvoice ? "destructive" : "default"}
              className="text-xs h-6 px-2.5 font-medium"
            >
              {currentUnpaidInvoice
                ? "Tagihan Menunggu Pembayaran"
                : invoices.length === 0
                  ? "Belum Ada Tagihan"
                  : "Semua Tagihan Sewa Lunas"}
            </Badge>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
          <div className="p-3 rounded-lg bg-muted/40 border">
            <p className="text-xs font-medium text-muted-foreground">
              Nomor Stan & Ukuran
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {activeInvoice
                ? `${activeInvoice.boothNumber} (Ukuran ${activeInvoice.boothSize})`
                : "-"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border">
            <p className="text-xs font-medium text-muted-foreground">
              Biaya Sewa Bulanan
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {activeInvoice
                ? `${formatRupiah(activeInvoice.totalAmount)} / bulan`
                : "-"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border">
            <p className="text-xs font-medium text-muted-foreground">
              Riwayat Transaksi Lunas
            </p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {paidInvoicesCount} Periode Telah Terbayar
            </p>
          </div>
        </div>
      </div>

      {/* Active Bill Card */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            Tagihan Sewa Berjalan
          </h3>
          {currentUnpaidInvoice && (
            <span className="text-xs text-muted-foreground">
              Jatuh tempo: {currentUnpaidInvoice.dueDate}
            </span>
          )}
        </div>

        {currentUnpaidInvoice ? (
          <Card className="p-5 border-amber-500/30 bg-amber-500/5 shadow-xs overflow-hidden relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-background">
                    {currentUnpaidInvoice.invoiceNumber}
                  </Badge>
                  <Badge variant="destructive" className="text-xs">
                    Perlu Dibayar
                  </Badge>
                </div>

                <div className="mt-1">
                  <h4 className="text-base font-bold text-foreground">
                    Sewa Stan Periode {currentUnpaidInvoice.period}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ditagihkan oleh {currentUnpaidInvoice.associationName} untuk
                    operasional stan fisik di zona kuliner bazaar.
                  </p>
                </div>

                {/* Itemized breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-amber-500/20 text-xs">
                  <div>
                    <span className="text-muted-foreground">
                      Sewa Pokok Stan:
                    </span>
                    <p className="font-semibold text-foreground">
                      {formatRupiah(currentUnpaidInvoice.baseRent)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Iuran Kebersihan:
                    </span>
                    <p className="font-semibold text-foreground">
                      {formatRupiah(currentUnpaidInvoice.maintenanceFee)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Utilitas Listrik:
                    </span>
                    <p className="font-semibold text-foreground">
                      {formatRupiah(currentUnpaidInvoice.electricityFee)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Total and Pay Button */}
              <div className="flex flex-col md:items-end justify-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-amber-500/20">
                <span className="text-xs font-medium text-muted-foreground">
                  Total Tagihan Bulan Ini
                </span>
                <span className="text-2xl font-black text-foreground">
                  {formatRupiah(currentUnpaidInvoice.totalAmount)}
                </span>
                <Button
                  onClick={() => setSelectedInvoiceToPay(currentUnpaidInvoice)}
                  className="gap-2 mt-1 w-full md:w-auto"
                >
                  <CreditCard className="size-4" />
                  Bayar Sewa Sekarang
                </Button>
              </div>
            </div>
          </Card>
        ) : invoices.length === 0 ? (
          <Card className="p-6 border-dashed text-center">
            <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Receipt className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Belum Ada Tagihan Sewa
              </h4>
              <p className="text-xs text-muted-foreground max-w-md">
                Tagihan sewa akan muncul di sini setelah pengelola bazaar menerbitkannya.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6 border-dashed border-emerald-500/30 bg-emerald-500/5 text-center">
            <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Semua Tagihan Sewa Anda Lunas!
              </h4>
              <p className="text-xs text-muted-foreground max-w-md">
                Tidak ada tagihan sewa stan aktif yang tertunda untuk periode ini.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment History Table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            Riwayat Pembayaran Sewa
          </h3>
          <span className="text-xs text-muted-foreground">
            {paymentHistory.length} transaksi tercatat
          </span>
        </div>

        <Card className="shadow-xs overflow-hidden border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">No. Kuitansi</TableHead>
                    <TableHead className="text-xs">Periode Sewa</TableHead>
                    <TableHead className="text-xs">Tanggal Pembayaran</TableHead>
                    <TableHead className="text-xs">Metode</TableHead>
                    <TableHead className="text-xs">Jumlah</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-xs text-muted-foreground"
                      >
                        Belum ada riwayat pembayaran sewa yang tercatat.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paymentHistory.map((item) => (
                      <TableRow key={item.id} className="text-xs group">
                        <TableCell className="font-mono font-medium text-foreground">
                          {item.receiptNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {item.period}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {item.associationName} ({item.boothNumber})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.paidAt}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] h-4">
                            {item.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {formatRupiah(item.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className="text-[10px] h-5 gap-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="size-2.5" />
                            Lunas
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInspectHistoricalReceipt(item)}
                            className="text-xs h-7 gap-1"
                          >
                            <Receipt className="size-3 text-muted-foreground" />
                            Lihat Kuitansi
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
      </div>

      {/* Pay Invoice Dialog */}
      <Dialog
        open={!!selectedInvoiceToPay}
        onOpenChange={(open) => !open && setSelectedInvoiceToPay(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Pembayaran Sewa Stan
            </DialogTitle>
            <DialogDescription className="text-xs">
              Selesaikan pembayaran sewa stan untuk periode{" "}
              {selectedInvoiceToPay?.period} ke pihak Association.
            </DialogDescription>
          </DialogHeader>

          {selectedInvoiceToPay && (
            <div className="flex flex-col gap-4 mt-2">
              {/* Invoice Summary Box */}
              <div className="p-3 rounded-lg border bg-muted/40 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Penerima (Asosiasi):</span>
                  <span className="font-medium text-foreground">
                    {selectedInvoiceToPay.associationName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Stan Disewa:</span>
                  <span className="font-medium text-foreground">
                    {selectedInvoiceToPay.boothNumber} (
                    {selectedInvoiceToPay.boothSize})
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t text-sm font-bold text-foreground">
                  <span>Total Tagihan:</span>
                  <span className="text-primary">
                    {formatRupiah(selectedInvoiceToPay.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Methods Choice */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-foreground">
                  Pilih Saluran Pembayaran:
                </label>

                <div className="flex flex-col gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-xs"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {method.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">
                              {method.name}
                            </span>
                            {isSelected && (
                              <Badge
                                variant="default"
                                className="text-[10px] h-4 px-1.5"
                              >
                                Terpilih
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Channel Detail Panel */}
              {selectedMethod === "Transfer Bank" && (
                <div className="p-3 rounded-xl border bg-muted/40 flex flex-col gap-2">
                  {selectedInvoiceToPay.bankAccountNumber ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            Rekening Tujuan (
                            {selectedInvoiceToPay.bankName || "Bank"})
                          </p>
                          <p className="text-sm font-mono font-bold text-foreground">
                            {selectedInvoiceToPay.bankAccountNumber}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCopyText(
                              selectedInvoiceToPay.bankAccountNumber || ""
                            )
                          }
                          className="text-xs h-7 gap-1"
                        >
                          {copiedAccount ? (
                            <>
                              <Check className="size-3 text-emerald-600" />
                              Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              Salin
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Atas Nama:{" "}
                        {selectedInvoiceToPay.bankAccountHolder ||
                          selectedInvoiceToPay.associationName}
                      </p>
                    </>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Pengelola area belum mengatur nomor rekening. Hubungi{" "}
                      {selectedInvoiceToPay.associationName} untuk instruksi
                      transfer.
                    </p>
                  )}
                </div>
              )}

              {selectedMethod === "Tunai" && (
                <div className="p-3 rounded-xl border bg-muted/40">
                  <p className="text-[11px] text-muted-foreground">
                    Bayar langsung ke {selectedInvoiceToPay.associationName}.
                    Catat pembayaran di sini setelah uang diterima.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoiceToPay(null)}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="text-xs gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="size-3.5 animate-spin" />
                      Memverifikasi Pembayaran...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      Konfirmasi Bayar {formatRupiah(selectedInvoiceToPay.totalAmount)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Digital Receipt Dialog */}
      <Dialog
        open={!!receiptData}
        onOpenChange={(open) => !open && setReceiptData(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Receipt className="size-4 text-emerald-600" />
              Tanda Terima Resmi Pembayaran Sewa
            </DialogTitle>
            <DialogDescription className="text-xs">
              Bukti sah transaksi pembayaran stan bazaar di ekosistem Tenantify.
            </DialogDescription>
          </DialogHeader>

          {receiptData && (
            <div className="flex flex-col gap-4 mt-1">
              {/* Receipt Paper Design */}
              <div className="p-4 rounded-xl border bg-card shadow-xs flex flex-col gap-3 relative overflow-hidden">
                {/* Stamp LUNAS */}
                <div className="absolute right-4 top-4 border-2 border-emerald-600/40 text-emerald-600 px-2 py-0.5 rounded font-black text-xs tracking-wider transform rotate-12 select-none">
                  LUNAS / PAID
                </div>

                {/* Header Info */}
                <div className="pb-3 border-b flex flex-col gap-1">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    No. Kuitansi: {receiptData.receiptNumber}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {receiptData.associationName}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Stan: {receiptData.boothNumber} ({receiptData.boothSize}) • Periode:{" "}
                    {receiptData.period}
                  </span>
                </div>

                {/* Details Breakdown */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sewa Pokok Stan:</span>
                    <span className="font-medium text-foreground">
                      {formatRupiah(receiptData.baseRent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Iuran Kebersihan & Keamanan:</span>
                    <span className="font-medium text-foreground">
                      {formatRupiah(receiptData.maintenanceFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Utilitas Listrik:</span>
                    <span className="font-medium text-foreground">
                      {formatRupiah(receiptData.electricityFee)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-sm text-foreground">
                    <span>Total Lunas:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(receiptData.amount)}
                    </span>
                  </div>
                </div>

                {/* Metadata footer */}
                <div className="pt-2 border-t flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                  <p>Waktu Pembayaran: {receiptData.paidAt}</p>
                  <p>Metode: {receiptData.paymentMethod}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info("Mempersiapkan dokumen kuitansi cetak...");
                    window.print();
                  }}
                  className="text-xs gap-1.5"
                >
                  <Printer className="size-3.5" />
                  Cetak Kuitansi
                </Button>
                <Button
                  size="sm"
                  onClick={() => setReceiptData(null)}
                  className="text-xs"
                >
                  Selesai
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
