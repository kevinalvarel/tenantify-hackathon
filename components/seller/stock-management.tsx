"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  type TProductInput,
} from "@/validations/product-validation";
import {
  createProductAction,
  deleteProductAction,
} from "@/servers/seller-server";
import {
  uploadProductImageAction,
  deleteBlobAction,
} from "@/servers/blob-server";
import {
  Search,
  Plus,
  Minus,
  PackagePlus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Archive,
  ImagePlus,
  X,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Product } from "@/types/seller";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment";
import { Spinner } from "@/components/ui/spinner";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";

type StockManagementProps = {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onToggleActive: (productId: string) => void;
  onAddProduct: (newProduct: Product) => void;
  onDeleteProduct?: (
    productId: string
  ) => Promise<{ success: boolean; message: string }> | void;
};

const stockFilters = [
  "Semua Status",
  "Tersedia (>10)",
  "Menipis (1-10)",
  "Habis (0)",
] as const;

function formatFileSize(bytes?: number) {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StockManagement({
  products,
  onUpdateStock,
  onToggleActive,
  onAddProduct,
  onDeleteProduct,
}: StockManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof stockFilters)[number]>("Semua Status");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Attachment & Image Upload state (prepared for Object Storage)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "Makanan",
      price: 20000,
      stock: 20,
      description: "",
      image: "",
    },
  });

  const imagePreview = watch("image");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Hanya berkas gambar (PNG, JPG, WebP) yang didukung.");
      setUploadState("error");
      toast.error("Format berkas harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran gambar melebihi batas 5MB.");
      setUploadState("error");
      toast.error("Ukuran gambar maksimal 5MB.");
      return;
    }

    // Hapus blob sebelumnya jika user memilih ulang foto
    const previousUrl = watch("image");
    if (previousUrl && previousUrl.includes("blob.vercel-storage.com")) {
      deleteBlobAction(previousUrl).catch(console.error);
    }

    setImageFile(file);
    setUploadError(null);
    setUploadState("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadProductImageAction(formData);

      if (!res.success || !res.url) {
        setUploadState("error");
        setUploadError(res.error || "Gagal mengunggah foto ke Blob storage.");
        toast.error(res.error || "Gagal mengunggah foto ke Blob storage.");
        return;
      }

      setValue("image", res.url, { shouldValidate: true, shouldDirty: true });
      setUploadState("done");
      toast.success("Foto produk berhasil diunggah ke Vercel Blob.");
    } catch (err) {
      console.error("Gagal mengunggah gambar:", err);
      setUploadState("error");
      setUploadError("Terjadi kendala jaringan saat mengunggah foto.");
      toast.error("Gagal mengunggah foto ke Blob storage.");
    }
  };

  const handleRemoveImage = () => {
    const currentUrl = watch("image");
    if (currentUrl && currentUrl.includes("blob.vercel-storage.com")) {
      deleteBlobAction(currentUrl).catch(console.error);
    }
    setImageFile(null);
    setValue("image", "", { shouldValidate: true, shouldDirty: true });
    setUploadState("idle");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    reset();
    handleRemoveImage();
  };

  const onFormSubmit = async (data: TProductInput) => {
    try {
      const res = await createProductAction(data);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      if (res.product) {
        onAddProduct(res.product);
      }
      toast.success(res.message);
      handleCloseDialog();
    } catch (error) {
      console.error("Gagal menambahkan produk:", error);
      toast.error("Terjadi kesalahan saat menambahkan produk ke database.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      if (onDeleteProduct) {
        const res = await onDeleteProduct(productToDelete.id);
        if (res && !res.success) {
          toast.error(res.message);
          setIsDeleting(false);
          return;
        }
      } else {
        const res = await deleteProductAction(productToDelete.id);
        if (!res.success) {
          toast.error(res.message);
          setIsDeleting(false);
          return;
        }
      }
      toast.success(`Menu "${productToDelete.name}" berhasil dihapus.`);
      setProductToDelete(null);
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      toast.error("Terjadi kesalahan saat menghapus produk.");
    } finally {
      setIsDeleting(false);
    }
  };

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
                <TableHead className="text-center">Tampil di POS</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
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
                      <div className="flex items-center gap-2.5">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="size-8 rounded-md object-cover border shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-bold text-sm text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.category}
                          </p>
                        </div>
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
                        <Badge
                          variant="secondary"
                          className="gap-1 border-amber-500/30 text-amber-700 dark:text-amber-400"
                        >
                          <AlertTriangle className="size-3" />
                          Menipis ({product.stock})
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 text-emerald-700 dark:text-emerald-400"
                        >
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
                          onClick={() =>
                            onUpdateStock(
                              product.id,
                              Math.max(0, product.stock - 1),
                            )
                          }
                          title="Kurang 1 stok"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() =>
                            onUpdateStock(product.id, product.stock + 1)
                          }
                          title="Tambah 1 stok"
                        >
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() =>
                            onUpdateStock(product.id, product.stock + 5)
                          }
                          className="h-6 px-1.5 text-[10px]"
                          title="Tambah 5 stok cepat"
                        >
                          +5
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() =>
                            onUpdateStock(product.id, product.stock + 10)
                          }
                          className="h-6 px-1.5 text-[10px]"
                          title="Tambah 10 stok cepat"
                        >
                          +10
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
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
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setProductToDelete(product)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title={`Hapus ${product.name}`}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Hapus {product.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-32 text-center text-muted-foreground"
                  >
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
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog();
          } else {
            setShowAddDialog(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <DialogHeader>
              <DialogTitle className="font-bold">
                Tambah Menu & Stok Baru
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3.5 py-4">
              {/* Nama Produk */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="prod-name">
                  Nama Produk / Menu *
                </FieldLabel>
                <Input
                  id="prod-name"
                  placeholder="Contoh: Es Kopi Susu Aren"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                {errors.name?.message && (
                  <FieldError>{errors.name.message}</FieldError>
                )}
              </Field>

              {/* Foto Produk / Lampiran Object Storage */}
              <Field data-invalid={!!errors.image}>
                <FieldLabel htmlFor="prod-image">Foto Produk / Menu</FieldLabel>
                <input
                  id="prod-image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {uploadState === "idle" ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed border-input hover:border-primary/50 hover:bg-muted/40 transition-colors cursor-pointer text-center group w-full"
                  >
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ImagePlus className="size-4" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-foreground">
                        Pilih foto produk untuk Vercel Blob
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Format PNG, JPG, WebP (maksimal 5MB)
                      </span>
                    </div>
                  </button>
                ) : (
                  <Attachment
                    state={uploadState}
                    className="w-full justify-between items-center p-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <AttachmentMedia
                        variant={uploadState === "done" ? "image" : "icon"}
                        className="size-11 rounded-lg shrink-0 overflow-hidden"
                      >
                        {uploadState === "uploading" ? (
                          <Spinner className="size-5 text-primary" />
                        ) : uploadState === "done" && imagePreview ? (
                          <img
                            src={imagePreview}
                            alt={imageFile?.name || "Preview Foto"}
                            className="size-full object-cover"
                          />
                        ) : (
                          <AlertCircle className="size-5 text-destructive" />
                        )}
                      </AttachmentMedia>

                      <AttachmentContent className="min-w-0 flex-1">
                        <AttachmentTitle className="text-xs font-semibold text-foreground truncate">
                          {uploadState === "uploading"
                            ? "Mengunggah ke Vercel Blob..."
                            : uploadState === "error"
                              ? "Gagal mengunggah foto"
                              : imageFile?.name || "Foto Produk"}
                        </AttachmentTitle>
                        <AttachmentDescription className="text-[11px] text-muted-foreground truncate">
                          {uploadState === "uploading"
                            ? "Mengirim berkas ke Vercel Blob Storage..."
                            : uploadState === "error"
                              ? uploadError ||
                                "Terjadi kesalahan saat mengunggah berkas."
                              : `${formatFileSize(imageFile?.size)} • Tersimpan di Vercel Blob`}
                        </AttachmentDescription>
                      </AttachmentContent>
                    </div>

                    <AttachmentActions>
                      {uploadState === "error" ? (
                        <AttachmentAction
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => fileInputRef.current?.click()}
                          title="Coba pilih ulang gambar"
                        >
                          <ImagePlus className="size-3.5" />
                        </AttachmentAction>
                      ) : null}
                      <AttachmentAction
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={handleRemoveImage}
                        title="Hapus foto"
                        className="cursor-pointer"
                      >
                        <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                      </AttachmentAction>
                    </AttachmentActions>
                  </Attachment>
                )}
                {errors.image?.message && (
                  <FieldError>{errors.image.message}</FieldError>
                )}
              </Field>

              {/* SKU & Kategori */}
              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!errors.sku}>
                  <FieldLabel htmlFor="prod-sku">Kode SKU</FieldLabel>
                  <Input
                    id="prod-sku"
                    placeholder="Otomatis jika kosong"
                    {...register("sku")}
                    aria-invalid={!!errors.sku}
                  />
                  {errors.sku?.message && (
                    <FieldError>{errors.sku.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.category}>
                  <FieldLabel htmlFor="prod-category">Kategori *</FieldLabel>
                  <select
                    id="prod-category"
                    {...register("category")}
                    aria-invalid={!!errors.category}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option
                      value="Makanan"
                      className="bg-popover text-foreground"
                    >
                      Makanan
                    </option>
                    <option
                      value="Minuman"
                      className="bg-popover text-foreground"
                    >
                      Minuman
                    </option>
                    <option
                      value="Camilan"
                      className="bg-popover text-foreground"
                    >
                      Camilan
                    </option>
                    <option
                      value="Paket Hemat"
                      className="bg-popover text-foreground"
                    >
                      Paket Hemat
                    </option>
                  </select>
                  {errors.category?.message && (
                    <FieldError>{errors.category.message}</FieldError>
                  )}
                </Field>
              </div>

              {/* Harga & Stok */}
              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!errors.price}>
                  <FieldLabel htmlFor="prod-price">
                    Harga Jual (Rp) *
                  </FieldLabel>
                  <Input
                    id="prod-price"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="20000"
                    {...register("price", { valueAsNumber: true })}
                    aria-invalid={!!errors.price}
                  />
                  {errors.price?.message && (
                    <FieldError>{errors.price.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.stock}>
                  <FieldLabel htmlFor="prod-stock">
                    Stok Awal (Unit) *
                  </FieldLabel>
                  <Input
                    id="prod-stock"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="20"
                    {...register("stock", { valueAsNumber: true })}
                    aria-invalid={!!errors.stock}
                  />
                  {errors.stock?.message && (
                    <FieldError>{errors.stock.message}</FieldError>
                  )}
                </Field>
              </div>

              {/* Deskripsi */}
              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="prod-desc">Deskripsi Singkat</FieldLabel>
                <Textarea
                  id="prod-desc"
                  placeholder="Bahan, cita rasa, porsi, atau catatan penting..."
                  rows={3}
                  {...register("description")}
                  aria-invalid={!!errors.description}
                />
                {errors.description?.message && (
                  <FieldError>{errors.description.message}</FieldError>
                )}
              </Field>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleCloseDialog}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploadState === "uploading"}
                className="gap-2"
              >
                {isSubmitting && <Spinner className="size-4" />}
                {isSubmitting ? "Menyimpan..." : "Simpan & Pasarkan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG KONFIRMASI HAPUS PRODUK */}
      <Dialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setProductToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Hapus Menu Produk?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm pt-1">
              Apakah Anda yakin ingin menghapus{" "}
              <strong className="text-foreground">{productToDelete?.name}</strong>{" "}
              ({productToDelete?.sku}) dari katalog stan? Semua data stok dan foto
              terkait akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setProductToDelete(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="gap-2"
            >
              {isDeleting && <Spinner className="size-4" />}
              {isDeleting ? "Menghapus..." : "Ya, Hapus Produk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
