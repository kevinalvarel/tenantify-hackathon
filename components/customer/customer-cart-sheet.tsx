"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  QrCode,
  Wallet,
  Store,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { CustomerCartItem, CustomerOrder } from "@/types/customer";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type CustomerCartSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CustomerCartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (newOrder: CustomerOrder) => void;
};

function generateCustomerPickupCode() {
  return `TNT-${Date.now().toString().slice(-3)}`;
}

function generateCustomerOrderId() {
  return `ORD-${Date.now().toString().slice(-4)}`;
}

export function CustomerCartSheet({
  isOpen,
  onOpenChange,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
}: CustomerCartSheetProps) {
  const [orderType, setOrderType] = useState<"Dine-in (Makan di Tempat)" | "Takeaway (Bawa Pulang)">(
    "Dine-in (Makan di Tempat)"
  );
  const [tableNumber, setTableNumber] = useState("Meja 08");
  const [paymentMethod, setPaymentMethod] = useState<CustomerOrder["paymentMethod"]>("QRIS");
  const [successOrder, setSuccessOrder] = useState<CustomerOrder | null>(null);

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const platformFee = cart.length > 0 ? 1000 : 0;
  const total = subtotal + platformFee;

  // Distinct tenants in the cart
  const involvedTenants = Array.from(new Set(cart.map((i) => i.product.tenantName)));

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Keranjang belanja kosong.");
      return;
    }

    const pickupCode = generateCustomerPickupCode();
    const orderId = generateCustomerOrderId();

    const createdOrder: CustomerOrder = {
      id: orderId,
      pickupCode,
      orderType,
      tableNumber: orderType === "Dine-in (Makan di Tempat)" ? tableNumber : undefined,
      tenantNames: involvedTenants,
      items: cart.map((item) => ({
        productName: item.product.name,
        tenantName: item.product.tenantName,
        price: item.product.price,
        quantity: item.quantity,
        notes: item.notes,
      })),
      subtotal,
      platformFee,
      total,
      status: "Diterima",
      paymentMethod,
      createdAt: "Baru saja",
    };

    onCheckoutSuccess(createdOrder);
    setSuccessOrder(createdOrder);
    onClearCart();
    onOpenChange(false);
    toast.success(`Pesanan #${orderId} berhasil dibuat!`);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-base font-bold">
                <ShoppingBag className="size-4 text-primary" />
                Keranjang Kuliner Anda
              </SheetTitle>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onClearCart}
                  className="text-destructive text-xs hover:bg-destructive/10"
                >
                  Kosongkan
                </Button>
              )}
            </div>
            {involvedTenants.length > 1 && (
              <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                <Sparkles className="size-3.5 shrink-0" />
                <span>
                  Pesanan Lintas {involvedTenants.length} Tenant ({involvedTenants.join(", ")})
                </span>
              </p>
            )}
          </SheetHeader>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                <ShoppingBag className="size-12 mb-3 opacity-30" />
                <p className="text-sm font-semibold text-foreground">Keranjang Anda Kosong</p>
                <p className="text-xs mt-1">
                  Pilih menu favorit Anda dari berbagai tenant di bazaar untuk mulai memesan.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="rounded-xl border bg-card p-3 flex flex-col gap-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Store className="size-3 text-primary" />
                        {item.product.tenantName} ({item.product.boothNumber})
                      </span>
                      <h4 className="font-bold text-xs text-foreground truncate mt-0.5">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-semibold text-primary mt-0.5">
                        {formatRupiah(item.product.price)}
                      </p>
                    </div>

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => onRemoveItem(item.product.id)}
                      className="size-6 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2 mt-1">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Subtotal:{" "}
                      <strong className="text-foreground">
                        {formatRupiah(item.product.price * item.quantity)}
                      </strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="icon-xs"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="size-6"
                      >
                        <Minus className="size-2.5" />
                      </Button>
                      <span className="w-5 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon-xs"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="size-6"
                      >
                        <Plus className="size-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer & Checkout Controls */}
          {cart.length > 0 && (
            <div className="border-t bg-muted/20 p-4 flex flex-col gap-3">
              {/* Dine-in vs Takeaway Toggle */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-foreground">Metode Pengambilan</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType("Dine-in (Makan di Tempat)")}
                    className={`rounded-lg border p-2 text-xs font-medium text-center transition-all ${
                      orderType === "Dine-in (Makan di Tempat)"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Makan di Meja
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("Takeaway (Bawa Pulang)")}
                    className={`rounded-lg border p-2 text-xs font-medium text-center transition-all ${
                      orderType === "Takeaway (Bawa Pulang)"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Bawa Pulang
                  </button>
                </div>

                {orderType === "Dine-in (Makan di Tempat)" && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Nomor Meja Anda:
                    </span>
                    <Input
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Contoh: Meja 12"
                      className="h-8 text-xs font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-foreground">Metode Pembayaran</span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QRIS")}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border gap-1 transition-all ${
                      paymentMethod === "QRIS"
                        ? "border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <QrCode className="size-3.5" />
                    QRIS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("GoPay / OVO")}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border gap-1 transition-all ${
                      paymentMethod === "GoPay / OVO"
                        ? "border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Wallet className="size-3.5" />
                    E-Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Bayar di Tenant")}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border gap-1 transition-all ${
                      paymentMethod === "Bayar di Tenant"
                        ? "border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Store className="size-3.5" />
                    Di Booth
                  </button>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="flex flex-col gap-1 text-xs border-t pt-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} item)</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Biaya Layanan Aplikasi</span>
                  <span>{formatRupiah(platformFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-foreground border-t pt-1.5">
                  <span>Total Tagihan</span>
                  <span className="text-primary text-base font-extrabold">{formatRupiah(total)}</span>
                </div>
              </div>

              <Button
                className="w-full font-bold py-5 gap-2"
                onClick={handleCheckout}
              >
                <CheckCircle2 className="size-4" />
                Bayar Sekarang ({formatRupiah(total)})
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* SUCCESS CONFIRMATION MODAL & PICKUP CODE */}
      {successOrder && (
        <Dialog open={!!successOrder} onOpenChange={(open) => !open && setSuccessOrder(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <CheckCircle2 className="size-7" />
              </div>
              <DialogTitle className="text-center font-bold text-lg">
                Pesanan Berhasil Diterima!
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3 p-4 bg-muted/40 rounded-xl border text-center">
              <div>
                <p className="text-xs text-muted-foreground font-medium">KODE PENGAMBILAN PESANAN</p>
                <p className="text-3xl font-extrabold text-primary font-mono tracking-wider my-1">
                  {successOrder.pickupCode}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Tunjukkan kode ini ke booth tenant saat pesanan Anda siap diambil.
                </p>
              </div>

              <div className="border-t pt-2 flex flex-col gap-1 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Pesanan:</span>
                  <span className="font-mono font-bold">#{successOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipe:</span>
                  <span>{successOrder.orderType}</span>
                </div>
                {successOrder.tableNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lokasi Meja:</span>
                    <span className="font-semibold">{successOrder.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tenant:</span>
                  <span className="font-semibold truncate max-w-[200px]">
                    {successOrder.tenantNames.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t">
                  <span>Total Bayar:</span>
                  <span className="text-primary">{formatRupiah(successOrder.total)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="default"
                className="w-full"
                onClick={() => setSuccessOrder(null)}
              >
                Tutup & Pantau di Riwayat Pesanan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
