"use client";

import { useState } from "react";
import { Search, Archive, Save } from "lucide-react";
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
import { toast } from "sonner";

type PricingManagementProps = {
  products: Product[];
  onUpdatePrice: (productId: string, newPrice: number) => void;
};

const categoryFilters = [
  "Semua Kategori",
  "Makanan",
  "Minuman",
  "Camilan",
  "Paket Hemat",
] as const;

export function PricingManagement({
  products,
  onUpdatePrice,
}: PricingManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<(typeof categoryFilters)[number]>("Semua Kategori");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "Semua Kategori" || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleSave = (product: Product) => {
    const rawValue = drafts[product.id] ?? String(product.price);
    const newPrice = Number(rawValue);

    if (!rawValue.trim() || !Number.isInteger(newPrice) || newPrice < 0) {
      toast.error("Harga harus berupa angka bulat dan tidak boleh negatif.");
      return;
    }

    onUpdatePrice(product.id, newPrice);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
    toast.success(
      `Harga "${product.name}" diperbarui menjadi ${formatRupiah(newPrice)}.`
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama atau SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {categoryFilters.map((filter) => (
              <Button
                key={filter}
                variant={categoryFilter === filter ? "default" : "outline"}
                size="xs"
                onClick={() => setCategoryFilter(filter)}
                className="whitespace-nowrap text-xs"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Card className="border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">SKU</TableHead>
                <TableHead>Nama Menu & Kategori</TableHead>
                <TableHead>Harga Saat Ini</TableHead>
                <TableHead>Harga Baru</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const draftValue =
                  drafts[product.id] ?? String(product.price);
                const isDirty = draftValue !== String(product.price);

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {product.name}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-[10px]">
                          {product.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatRupiah(product.price)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="500"
                        value={draftValue}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [product.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && isDirty) {
                            handleSave(product);
                          }
                        }}
                        aria-label={`Harga baru ${product.name}`}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={isDirty ? "default" : "ghost"}
                        size="xs"
                        disabled={!isDirty}
                        onClick={() => handleSave(product)}
                        className="gap-1 text-xs"
                      >
                        <Save className="size-3" />
                        Simpan
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <Archive className="size-8 mx-auto mb-2 opacity-50" />
                    Belum ada produk yang bisa diatur harganya. Tambahkan
                    produk lewat halaman Pengaturan Stok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
