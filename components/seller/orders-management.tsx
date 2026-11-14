"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Search,
  Printer,
  ShoppingBag,
  Store,
  Smartphone,
  Check,
  X,
  AlertCircle,
  BellRing,
} from "lucide-react";
import { Order, OrderStatus, OrderType } from "@/types/seller";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type OrdersManagementProps = {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
};

const statusTabs: { label: string; value: OrderStatus | "Semua" }[] = [
  { label: "Semua", value: "Semua" },
  { label: "Pesanan Masuk", value: "Masuk" },
  { label: "Sedang Diproses", value: "Diproses" },
  { label: "Siap Diambil", value: "Siap Diambil" },
  { label: "Selesai", value: "Selesai" },
  { label: "Dibatalkan", value: "Dibatalkan" },
];

export function OrdersManagement({
  orders,
  onUpdateOrderStatus,
}: OrdersManagementProps) {
  const [activeTab, setActiveTab] = useState<OrderStatus | "Semua">("Semua");
  const [typeFilter, setTypeFilter] = useState<OrderType | "Semua">("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "Semua" || order.status === activeTab;
    const matchesType = typeFilter === "Semua" || order.type === typeFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.tableNumber && order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesType && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Masuk":
        return (
          <Badge variant="default" className="bg-amber-600 hover:bg-amber-600 gap-1 text-white">
            <AlertCircle className="size-3" />
            Pesanan Masuk
          </Badge>
        );
      case "Diproses":
        return (
          <Badge variant="secondary" className="gap-1 border-primary/30 text-primary">
            <ChefHat className="size-3" />
            Sedang Disiapkan
          </Badge>
        );
      case "Siap Diambil":
        return (
          <Badge variant="outline" className="gap-1 text-blue-600 border-blue-500/30">
            <BellRing className="size-3" />
            Siap Diambil
          </Badge>
        );
      case "Selesai":
        return (
          <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-500/30">
            <CheckCircle2 className="size-3" />
            Selesai
          </Badge>
        );
      case "Dibatalkan":
        return (
          <Badge variant="destructive" className="gap-1">
            <X className="size-3" />
            Dibatalkan
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: OrderType) => {
    if (type === "Online Order") {
      return (
        <Badge variant="secondary" className="text-[10px] gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20">
          <Smartphone className="size-3" />
          Aplikasi Online
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] gap-1">
        <Store className="size-3" />
        POS Kasir
      </Badge>
    );
  };

  const pendingIncomingCount = orders.filter((o) => o.status === "Masuk").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Alert Banner Notifikasi Pesanan Masuk */}
      {pendingIncomingCount > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 animate-pulse">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Terdapat {pendingIncomingCount} Pesanan Masuk Baru!
              </p>
              <p className="text-[11px] text-muted-foreground">
                Pesanan customer menunggu konfirmasi dari UMKM Anda untuk segera diproses.
              </p>
            </div>
          </div>
          <Button
            size="xs"
            onClick={() => setActiveTab("Masuk")}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0 cursor-pointer"
          >
            Lihat Pesanan ({pendingIncomingCount})
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari ID order, nama, atau meja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-1">
            <Button
              variant={typeFilter === "Semua" ? "default" : "outline"}
              size="xs"
              onClick={() => setTypeFilter("Semua")}
              className="text-xs"
            >
              Semua Tipe
            </Button>
            <Button
              variant={typeFilter === "Online Order" ? "default" : "outline"}
              size="xs"
              onClick={() => setTypeFilter("Online Order")}
              className="text-xs"
            >
              Online
            </Button>
            <Button
              variant={typeFilter === "POS Kasir" ? "default" : "outline"}
              size="xs"
              onClick={() => setTypeFilter("POS Kasir")}
              className="text-xs"
            >
              POS Kasir
            </Button>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b pb-2 scrollbar-none">
        {statusTabs.map((tab) => {
          const count =
            tab.value === "Semua"
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;

          return (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "ghost"}
              size="xs"
              onClick={() => setActiveTab(tab.value)}
              className="rounded-full text-xs gap-1.5"
            >
              <span>{tab.label}</span>
              <span
                className={`size-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  activeTab === tab.value
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Orders Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            className={`border transition-all flex flex-col justify-between ${
              order.status === "Masuk"
                ? "border-amber-500/40 bg-amber-500/5 shadow-xs"
                : order.status === "Diproses"
                ? "border-primary/40 bg-card"
                : "bg-card"
            }`}
          >
            <CardHeader className="p-3.5 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-foreground">
                    #{order.id}
                  </span>
                  {getTypeBadge(order.type)}
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="mt-1 flex items-baseline justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {order.customerName}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{order.tableNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {order.createdAt}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3.5 pt-0 flex flex-col gap-2.5">
              {/* Items List */}
              <div className="bg-muted/40 rounded-lg p-2.5 flex flex-col gap-1 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <span className="font-semibold text-foreground">
                        {item.quantity}x {item.productName}
                      </span>
                      {item.notes && (
                        <p className="text-[10px] text-primary italic">Note: {item.notes}</p>
                      )}
                    </div>
                    <span className="text-muted-foreground font-mono">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total & Payment details */}
              <div className="flex items-center justify-between text-xs pt-1 border-t">
                <div>
                  <span className="text-muted-foreground text-[11px]">Total ({order.paymentMethod}):</span>
                  <p className="font-bold text-sm text-primary">{formatRupiah(order.total)}</p>
                </div>

                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                  Lunas
                </Badge>
              </div>

              {/* Status Action Buttons */}
              <div className="flex gap-1.5 pt-1">
                {order.status === "Masuk" && (
                  <>
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => onUpdateOrderStatus(order.id, "Diproses")}
                      className="flex-1 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer active:scale-95 transition-all shadow-xs"
                    >
                      <Check className="size-3.5" />
                      Konfirmasi Pesanan
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onUpdateOrderStatus(order.id, "Dibatalkan")}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs font-semibold gap-1 cursor-pointer active:scale-95 transition-all"
                    >
                      <X className="size-3.5" />
                      Tolak Pesanan
                    </Button>
                  </>
                )}

                {order.status === "Diproses" && (
                  <>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        onUpdateOrderStatus(order.id, "Siap Diambil");
                      }}
                      className="flex-1 gap-1 border-blue-500/30 text-blue-600 hover:bg-blue-500/10 text-xs font-semibold cursor-pointer"
                    >
                      <BellRing className="size-3.5" />
                      Siap Diambil
                    </Button>
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => {
                        onUpdateOrderStatus(order.id, "Selesai");
                      }}
                      className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      <Check className="size-3.5" />
                      Selesai
                    </Button>
                  </>
                )}

                {order.status === "Siap Diambil" && (
                  <Button
                    size="xs"
                    variant="default"
                    onClick={() => {
                      onUpdateOrderStatus(order.id, "Selesai");
                    }}
                    className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Check className="size-3.5" />
                    Selesaikan Pesanan
                  </Button>
                )}

                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setSelectedOrderForDetail(order)}
                  className="px-2"
                  title="Lihat Detail & Cetak"
                >
                  <Printer className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <ShoppingBag className="size-10 mb-2 opacity-40" />
            <p className="text-sm font-semibold">Tidak ada pesanan.</p>
            <p className="text-xs">Pesanan dari POS kasir atau aplikasi online akan tampil di sini.</p>
          </div>
        )}
      </div>

      {/* DETAIL TIKET / KITCHEN RECEIPT DIALOG */}
      {selectedOrderForDetail && (
        <Dialog
          open={!!selectedOrderForDetail}
          onOpenChange={(open) => !open && setSelectedOrderForDetail(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-bold">Tiket Dapur & Pesanan</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-dashed font-mono text-xs text-foreground">
              <div className="text-center border-b pb-2">
                <p className="font-bold text-sm">TIKET PESANAN DAPUR</p>
                <p className="text-xs font-semibold">#{selectedOrderForDetail.id}</p>
                <p className="text-[11px] text-muted-foreground">
                  {selectedOrderForDetail.type} — {selectedOrderForDetail.tableNumber}
                </p>
                <p className="text-[10px] text-muted-foreground">{selectedOrderForDetail.createdAt}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                  Nama Pelanggan: {selectedOrderForDetail.customerName}
                </p>
                <div className="divide-y border-y py-2 flex flex-col gap-1.5">
                  {selectedOrderForDetail.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1">
                      <div>
                        <p className="font-bold text-sm">
                          {item.quantity}x {item.productName}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-primary font-normal">
                            ** Catatan: {item.notes} **
                          </p>
                        )}
                      </div>
                      <span className="font-medium text-xs">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-1 font-bold text-xs">
                <span>TOTAL TAGIHAN:</span>
                <span className="text-primary">{formatRupiah(selectedOrderForDetail.total)}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Printer className="size-3.5" />
                Cetak Tiket
              </Button>
              <div className="flex gap-1.5 items-center">
                {selectedOrderForDetail.status === "Masuk" && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onUpdateOrderStatus(selectedOrderForDetail.id, "Diproses");
                        setSelectedOrderForDetail(null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-semibold cursor-pointer"
                    >
                      <Check className="size-3.5" />
                      Konfirmasi Pesanan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onUpdateOrderStatus(selectedOrderForDetail.id, "Dibatalkan");
                        setSelectedOrderForDetail(null);
                      }}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs gap-1 font-semibold cursor-pointer"
                    >
                      <X className="size-3.5" />
                      Tolak Pesanan
                    </Button>
                  </>
                )}
                {selectedOrderForDetail.status === "Diproses" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onUpdateOrderStatus(selectedOrderForDetail.id, "Siap Diambil");
                        setSelectedOrderForDetail(null);
                      }}
                      className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 text-xs gap-1 font-semibold cursor-pointer"
                    >
                      <BellRing className="size-3.5" />
                      Siap Diambil
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onUpdateOrderStatus(selectedOrderForDetail.id, "Selesai");
                        setSelectedOrderForDetail(null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-semibold cursor-pointer"
                    >
                      <Check className="size-3.5" />
                      Selesai
                    </Button>
                  </>
                )}
                {selectedOrderForDetail.status === "Siap Diambil" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      onUpdateOrderStatus(selectedOrderForDetail.id, "Selesai");
                      setSelectedOrderForDetail(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-semibold cursor-pointer"
                  >
                    <Check className="size-3.5" />
                    Selesaikan Pesanan
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrderForDetail(null)}
                >
                  Tutup
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
