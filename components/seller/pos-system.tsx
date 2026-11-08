"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  QrCode,
  Banknote,
  Utensils,
  Coffee,
  Sandwich,
  Package,
  CheckCircle2,
  Printer,
  ShoppingBag,
} from "lucide-react";
import { Product, CartItem, Order, PaymentMethod, ProductCategory } from "@/types/seller";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type PosSystemProps = {
  products: Product[];
  onCompleteTransaction: (newOrder: Order, itemsSold: { productId: string; qty: number }[]) => void;
};

const categories: ProductCategory[] = ["Semua", "Makanan", "Minuman", "Camilan", "Paket Hemat"];

function generateOrderId() {
  return `POS-${Date.now().toString().slice(-4)}`;
}

export function PosSystem({ products, onCompleteTransaction }: PosSystemProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dineType, setDineType] = useState<"Dine-in" | "Takeaway">("Dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [cashGiven, setCashGiven] = useState<number>(50000);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Filter products by category, search, and active state
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error(`Stok ${product.name} telah habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.warning(`Jumlah telah mencapai batas sisa stok (${product.stock})`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              toast.warning(`Maksimal stok tersedia adalah ${item.product.stock}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = 0; // Dapat dikonfigurasi
  const total = subtotal + tax;
  const change = paymentMethod === "Tunai" ? Math.max(0, cashGiven - total) : 0;

  // Process payment
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Keranjang belanja masih kosong.");
      return;
    }

    if (paymentMethod === "Tunai" && cashGiven < total) {
      toast.error("Nominal uang tunai kurang dari total tagihan.");
      return;
    }

    const orderId = generateOrderId();
    const newOrder: Order = {
      id: orderId,
      customerName: customerName || "Pelanggan Kasir",
      tableNumber: dineType === "Dine-in" ? tableNumber : "Bawa Pulang (Takeaway)",
      type: "POS Kasir",
      items: cart.map((item) => ({
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        notes: item.notes,
      })),
      subtotal,
      tax,
      total,
      status: "Selesai",
      paymentMethod,
      isPaid: true,
      createdAt: "Baru saja",
    };

    const itemsSold = cart.map((item) => ({
      productId: item.product.id,
      qty: item.quantity,
    }));

    onCompleteTransaction(newOrder, itemsSold);
    setCompletedOrder(newOrder);
    setShowReceiptDialog(true);
    clearCart();
    toast.success(`Transaksi ${orderId} berhasil diproses!`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Minuman":
        return <Coffee className="size-4" />;
      case "Makanan":
        return <Utensils className="size-4" />;
      case "Camilan":
        return <Sandwich className="size-4" />;
      default:
        return <Package className="size-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* LEFT: Product Catalog (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari menu atau kode SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Categories pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="xs"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap rounded-full px-3 text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const inCart = cart.find((i) => i.product.id === product.id);

            return (
              <Card
                key={product.id}
                className={`relative flex flex-col justify-between transition-all hover:border-primary/50 ${
                  isOutOfStock ? "opacity-60 bg-muted/30" : "bg-card"
                }`}
              >
                <CardContent className="p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-1">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      {getCategoryIcon(product.category)}
                    </span>
                    <Badge
                      variant={
                        isOutOfStock
                          ? "destructive"
                          : product.stock <= 5
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {isOutOfStock ? "Habis" : `Sisa ${product.stock}`}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-xs leading-snug line-clamp-2 text-foreground">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{product.sku}</p>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      {formatRupiah(product.price)}
                    </span>

                    <Button
                      size="icon-xs"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product)}
                      variant={inCart ? "default" : "secondary"}
                      className="size-6 rounded-md"
                      title="Tambah ke Kasir"
                    >
                      {inCart ? (
                        <span className="font-bold text-[10px]">{inCart.quantity}</span>
                      ) : (
                        <Plus className="size-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <ShoppingBag className="size-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Tidak ada menu yang sesuai.</p>
            <p className="text-xs">Coba ubah kata kunci pencarian atau kategori.</p>
          </div>
        )}
      </div>

      {/* RIGHT: POS Cart / Checkout Panel (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="border shadow-xs">
          <CardContent className="p-4 flex flex-col gap-4">
            {/* Header POS Cart */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                <h2 className="font-bold text-sm text-foreground">Tagihan Kasir</h2>
              </div>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={clearCart}
                  className="text-destructive text-xs hover:bg-destructive/10"
                >
                  Kosongkan
                </Button>
              )}
            </div>

            {/* Order Settings (Dine in / Takeaway & Table) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex rounded-lg bg-muted p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setDineType("Dine-in")}
                  className={`flex-1 rounded-md text-xs py-1 font-medium transition-all ${
                    dineType === "Dine-in"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground"
                  }`}
                >
                  Dine-In
                </button>
                <button
                  type="button"
                  onClick={() => setDineType("Takeaway")}
                  className={`flex-1 rounded-md text-xs py-1 font-medium transition-all ${
                    dineType === "Takeaway"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground"
                  }`}
                >
                  Bungkus
                </button>
              </div>

              {dineType === "Dine-in" ? (
                <Input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Nomor Meja"
                  className="h-8 text-xs"
                />
              ) : (
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama Pembeli"
                  className="h-8 text-xs"
                />
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex flex-col divide-y max-h-[260px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Belum ada item dipilih. Klik tanda (+) pada menu untuk menambahkan.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-foreground">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatRupiah(item.product.price)} x {item.quantity} ={" "}
                        <span className="font-medium text-foreground">
                          {formatRupiah(item.product.price * item.quantity)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="icon-xs"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, -1)}
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
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="size-6"
                      >
                        <Plus className="size-2.5" />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => removeFromCart(item.product.id)}
                        className="size-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Price Summary */}
            <div className="border-t pt-3 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} item)</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Pajak Restoran (PB1)</span>
                <span>Termasuk (Rp 0)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground border-t pt-1.5">
                <span>Total Tagihan</span>
                <span className="text-primary text-base font-extrabold">{formatRupiah(total)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="flex flex-col gap-2 border-t pt-3">
              <label className="text-xs font-semibold text-foreground">Metode Pembayaran</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
                    paymentMethod === "QRIS"
                      ? "border-primary bg-primary/5 text-primary font-bold ring-1 ring-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <QrCode className="size-4" />
                  QRIS
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Tunai")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
                    paymentMethod === "Tunai"
                      ? "border-primary bg-primary/5 text-primary font-bold ring-1 ring-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Banknote className="size-4" />
                  Tunai
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Debit / Transfer")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
                    paymentMethod === "Debit / Transfer"
                      ? "border-primary bg-primary/5 text-primary font-bold ring-1 ring-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CreditCard className="size-4" />
                  Debit
                </button>
              </div>

              {/* Cash denomination quick buttons */}
              {paymentMethod === "Tunai" && (
                <div className="flex flex-col gap-1.5 mt-2 bg-muted/40 p-2.5 rounded-lg border">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Uang Diterima:</span>
                    <Input
                      type="number"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(Number(e.target.value))}
                      className="w-28 h-7 text-xs text-right font-semibold"
                    />
                  </div>
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setCashGiven(total)}
                      className="text-[10px] h-6 px-1.5"
                    >
                      Uang Pas
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setCashGiven(50000)}
                      className="text-[10px] h-6 px-1.5"
                    >
                      50k
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setCashGiven(100000)}
                      className="text-[10px] h-6 px-1.5"
                    >
                      100k
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold pt-1 border-t">
                    <span>Kembalian:</span>
                    <span className={change < 0 ? "text-destructive" : "text-emerald-600 font-extrabold"}>
                      {formatRupiah(change)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Action Button */}
            <Button
              className="w-full font-bold gap-2 py-5"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              <CheckCircle2 className="size-4" />
              Selesaikan Transaksi ({formatRupiah(total)})
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* RECEIPT PREVIEW DIALOG */}
      {completedOrder && (
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center font-bold">Struk Pembayaran Kasir</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-dashed font-mono text-xs text-foreground">
              <div className="text-center border-b pb-2">
                <p className="font-bold text-sm">TENANTIFY</p>
                <p className="text-[10px] text-muted-foreground mt-1">Order #{completedOrder.id}</p>
                <p className="text-[10px] text-muted-foreground">{completedOrder.createdAt}</p>
              </div>

              <div className="flex justify-between text-[11px]">
                <span>Tipe: {completedOrder.tableNumber}</span>
                <span>Metode: {completedOrder.paymentMethod}</span>
              </div>

              <div className="divide-y border-y py-1.5 flex flex-col gap-1">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <div>
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.quantity} x {formatRupiah(item.price)}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatRupiah(item.quantity * item.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1 pt-1 font-bold">
                <div className="flex justify-between text-xs">
                  <span>TOTAL:</span>
                  <span className="text-primary">{formatRupiah(completedOrder.total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Status:</span>
                  <span className="text-emerald-600">LUNAS</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-muted-foreground pt-2 border-t">
                Terima kasih telah berkunjung ke Tenantify!
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="gap-1.5"
              >
                <Printer className="size-3.5" />
                Cetak Struk
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowReceiptDialog(false)}
              >
                Transaksi Baru
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
