"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Minus,
  PackagePlus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Archive,
} from "lucide-react";
import { Product } from "@/types/seller";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";

type StockManagementProps = {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onToggleActive: (productId: string) => void;
  onAddProduct: (newProduct: Product) => void;
};

const stockFilters = ["Semua Status", "Tersedia (>10)", "Menipis (1-10)", "Habis (0)"] as const;

function generateNewProductId() {
  return `prod-${Date.now()}`;
}

function generateDefaultSku() {
  return `SKU-${Date.now().toString().slice(-4)}`;
}

export function StockManagement({
  products,
  onUpdateStock,
  onToggleActive,
  onAddProduct,
}: StockManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof stockFilters)[number]>("Semua Status");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // New product form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Product["category"]>("Makanan");
  const [newPrice, setNewPrice] = useState<number>(20000);
  const [newStock, setNewStock] = useState<number>(20);
  const [newSku, setNewSku] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "Tersedia (>10)") return p.stock > 10;
    if (statusFilter === "Menipis (1-10)") return p.stock > 0 && p.stock <= 10;
    if (statusFilter === "Habis (0)") return p.stock === 0;

    return true;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Nama produk tidak boleh kosong.");
      return;
    }

    const createdProduct: Product = {
      id: generateNewProductId(),
      sku: newSku.trim() || generateDefaultSku(),
      name: newName.trim(),
      category: newCategory,
      price: Number(newPrice) || 0,
      stock: Number(newStock) || 0,
      description: newDescription.trim() || undefined,
      isActive: true,
    };

    onAddProduct(createdProduct);
    toast.success(`Produk "${createdProduct.name}" berhasil ditambahkan ke katalog.`);
    setShowAddDialog(false);

    // Reset form
    setNewName("");
    setNewSku("");
    setNewPrice(20000);
    setNewStock(20);
    setNewDescription("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Controls: Search, Filter, Add Product Button */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama, SKU, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {stockFilters.map((filter) => (
              <Button
                key={filter}
                variant={statusFilter === filter ? "default" : "outline"}
                size="xs"
                onClick={() => setStatusFilter(filter)}
                className="whitespace-nowrap text-xs"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setShowAddDialog(true)}
          size="sm"
          className="gap-1.5 shrink-0"
        >
          <PackagePlus className="size-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Stock Table */}
      <Card className="border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">SKU</TableHead>
                <TableHead>Nama Menu & Kategori</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>Status Stok</TableHead>
                <TableHead className="text-center">Sisa Stok</TableHead>
                <TableHead className="text-center">Quick Stock Edit</TableHead>
                <TableHead className="text-right">Tampil di POS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= 10;

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-sm text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatRupiah(product.price)}
                    </TableCell>
                    <TableCell>
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="size-3" />
                          Habis
                        </Badge>
                      ) : isLowStock ? (
                        <Badge variant="secondary" className="gap-1 border-amber-500/30 text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="size-3" />
                          Menipis ({product.stock})
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          Tersedia
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold text-sm">
                      {product.stock} unit
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          disabled={product.stock <= 0}
                          onClick={() => onUpdateStock(product.id, Math.max(0, product.stock - 1))}
                          title="Kurang 1 stok"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => onUpdateStock(product.id, product.stock + 1)}
                          title="Tambah 1 stok"
                        >
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => onUpdateStock(product.id, product.stock + 5)}
                          className="h-6 px-1.5 text-[10px]"
                          title="Tambah 5 stok cepat"
                        >
                          +5
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => onUpdateStock(product.id, product.stock + 10)}
                          className="h-6 px-1.5 text-[10px]"
                          title="Tambah 10 stok cepat"
                        >
                          +10
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={product.isActive ? "secondary" : "ghost"}
                        size="xs"
                        onClick={() => onToggleActive(product.id)}
                        className={`text-xs ${
                          product.isActive
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {product.isActive ? "Aktif" : "Nonaktif"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <Archive className="size-8 mx-auto mb-2 opacity-50" />
                    Tidak ada produk yang sesuai dengan filter pencarian stok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIALOG: TAMBAH PRODUK BARU */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateProduct}>
            <DialogHeader>
              <DialogTitle className="font-bold">Tambah Menu & Stok Baru</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-4">
              <Field>
                <FieldLabel htmlFor="prod-name">Nama Produk / Menu *</FieldLabel>
                <Input
                  id="prod-name"
                  placeholder="Contoh: Es Kopi Susu Aren"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="prod-sku">Kode SKU</FieldLabel>
                  <Input
                    id="prod-sku"
                    placeholder="Otomatis jika kosong"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="prod-category">Kategori</FieldLabel>
                  <select
                    id="prod-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Product["category"])}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none"
                  >
                    <option value="Makanan" className="bg-popover text-foreground">Makanan</option>
                    <option value="Minuman" className="bg-popover text-foreground">Minuman</option>
                    <option value="Camilan" className="bg-popover text-foreground">Camilan</option>
                    <option value="Paket Hemat" className="bg-popover text-foreground">Paket Hemat</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="prod-price">Harga Jual (Rp) *</FieldLabel>
                  <Input
                    id="prod-price"
                    type="number"
                    min="0"
                    step="1000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="prod-stock">Stok Awal (Unit) *</FieldLabel>
                  <Input
                    id="prod-stock"
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="prod-desc">Deskripsi Singkat</FieldLabel>
                <Input
                  id="prod-desc"
                  placeholder="Bahan, cita rasa, atau porsi..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </Field>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                Simpan & Pasarkan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
