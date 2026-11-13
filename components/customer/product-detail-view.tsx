"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Store,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Heart,
  Share2,
} from "lucide-react";
import { useCustomer } from "@/context/customer-context";
import { getProductBySlug, demoProducts } from "@/data/customer-demo";
import { formatRupiah, cn } from "@/lib/utils";
import { TenantifyPlaceholder } from "@/components/customer/tenantify-placeholder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ProductDetailView({ slug }: { slug: string }) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCustomer();

  const product = getProductBySlug(slug);

  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [imgError, setImgError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-neutral-900/60 rounded-3xl border border-neutral-200 dark:border-neutral-800 my-6 shadow-sm font-poppins [&_*]:font-poppins"
        style={{ fontFamily: '"Poppins", sans-serif' }}
      >
        <div className="size-16 rounded-full bg-[#ffdbcf] text-[#c85a32] flex items-center justify-center mb-4">
          <Store className="size-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
          Menu Tidak Ditemukan
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mt-2 mb-6">
          Maaf, hidangan dengan slug <span className="font-semibold text-neutral-800 dark:text-neutral-200">"{slug}"</span> tidak ditemukan atau sudah tidak tersedia.
        </p>
        <Button
          onClick={() => router.push("/customer#pilihan-menu")}
          className="bg-[#c85a32] hover:bg-[#b34a24] text-white rounded-full font-bold px-6 py-2.5 shadow-md cursor-pointer"
        >
          <ArrowLeft className="size-4 mr-2" />
          Kembali ke Pilihan Menu
        </Button>
      </div>
    );
  }

  // Other products from same tenant
  const tenantOtherProducts = demoProducts
    .filter((p) => p.tenantId === product.tenantId && p.id !== product.id)
    .slice(0, 3);

  // Recommendations from same category
  const relatedProducts = demoProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        p.tenantId !== product.tenantId &&
        (p.category === product.category || p.mcdCategory === product.mcdCategory)
    )
    .slice(0, 3);

  const handleAddToCart = (openCart = false) => {
    addToCart(product, qty, notes.trim() || undefined);
    toast.success(
      `"${product.name}" (${qty}x) ditambahkan ke keranjang!`,
      {
        description: notes.trim() ? `Catatan: ${notes.trim()}` : undefined,
      }
    );
    if (openCart) {
      setIsCartOpen(true);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Tautan menu disalin ke clipboard!");
    }
  };

  const subtotal = product.price * qty;

  return (
    <div
      className="space-y-8 max-w-7xl mx-auto pb-24 sm:pb-12 font-poppins [&_*]:font-poppins"
      style={{ fontFamily: '"Poppins", sans-serif' }}
    >
      {/* 1. Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
          <Link
            href="/customer"
            className="hover:text-[#c85a32] transition-colors font-medium"
          >
            Beranda
          </Link>
          <ChevronRight className="size-3.5 text-neutral-400" />
          <Link
            href="/customer#pilihan-menu"
            className="hover:text-[#c85a32] transition-colors font-medium"
          >
            Pilihan Menu
          </Link>
          <ChevronRight className="size-3.5 text-neutral-400" />
          <span className="text-neutral-900 dark:text-neutral-100 font-bold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/customer#pilihan-menu")}
          className="rounded-full text-xs font-semibold border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-[#c85a32] hover:border-[#c85a32] cursor-pointer"
        >
          <ArrowLeft className="size-3.5 mr-1.5" />
          Kembali ke Menu
        </Button>
      </div>

      {/* 2. Main Product Showcase Container */}
      <div className="bg-white dark:bg-neutral-900/90 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-8 lg:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Product Image & Badges (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square sm:aspect-4/3 lg:aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-md">
              {product.image && !imgError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <TenantifyPlaceholder size="lg" subtitle={product.category} />
              )}

              {/* Floating Rating Pill */}
              <div className="absolute top-4 left-4 bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-900 dark:text-white px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                <Star className="size-4 fill-[#c85a32] text-[#c85a32]" />
                <span>{product.rating}</span>
                <span className="text-neutral-400 font-normal">
                  ({product.soldCount || 100}+ terjual)
                </span>
              </div>

              {/* Discount Tag */}
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-4 right-4 bg-[#c85a32] text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                  Hemat {formatRupiah(product.originalPrice - product.price)}
                </div>
              )}

              {/* Action Buttons Overlay */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFavorite(!isFavorite);
                    toast.success(
                      isFavorite
                        ? "Dihapus dari menu favorit"
                        : "Ditambahkan ke menu favorit!"
                    );
                  }}
                  className="size-10 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md flex items-center justify-center text-neutral-700 dark:text-neutral-200 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label="Favoritkan menu"
                >
                  <Heart
                    className={cn(
                      "size-5 transition-colors",
                      isFavorite
                        ? "fill-rose-500 text-rose-500"
                        : "text-neutral-600 dark:text-neutral-300"
                    )}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="size-10 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md flex items-center justify-center text-neutral-700 dark:text-neutral-200 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label="Bagikan menu"
                >
                  <Share2 className="size-5 text-neutral-600 dark:text-neutral-300" />
                </button>
              </div>
            </div>

            {/* Tenant Stall Information Card */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-750">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#ffdbcf] text-[#c85a32] flex items-center justify-center font-bold text-sm shrink-0">
                  <Store className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {product.tenantName}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="size-3 text-[#c85a32]" />
                    <span>{product.boothNumber}</span>
                  </p>
                </div>
              </div>

              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="size-3 mr-1" />
                Buka
              </Badge>
            </div>
          </div>

          {/* Right Column: Details, Description, Customization & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Pricing Block */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#c85a32]">
                  {formatRupiah(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm sm:text-base text-neutral-400 line-through">
                    {formatRupiah(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-neutral-200/80 dark:bg-neutral-800" />

              {/* Full Description */}
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Deskripsi Menu
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                  {product.description}
                </p>
              </div>

              {/* Nutrition Facts (if available) */}
              {product.nutrition && (
                <div className="pt-2 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Informasi Nilai Gizi (Estimasi)
                  </h4>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                      <div className="text-[10px] sm:text-xs text-neutral-400 font-medium">
                        Energi
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {product.nutrition.calories} kkal
                      </div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                      <div className="text-[10px] sm:text-xs text-neutral-400 font-medium">
                        Protein
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {product.nutrition.protein}g
                      </div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                      <div className="text-[10px] sm:text-xs text-neutral-400 font-medium">
                        Karbo
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {product.nutrition.carbs}g
                      </div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                      <div className="text-[10px] sm:text-xs text-neutral-400 font-medium">
                        Lemak
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {product.nutrition.fat}g
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Notes Input */}
              <div className="space-y-2 pt-2">
                <label
                  htmlFor="product-notes"
                  className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between"
                >
                  <span>Catatan untuk Tenant</span>
                  <span className="text-[11px] font-normal text-neutral-400">
                    Opsional
                  </span>
                </label>
                <Textarea
                  id="product-notes"
                  placeholder="Contoh: Sambal dipisah, bumbu hitam banyakin, jangan terlalu pedas, dll."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none h-20 text-xs sm:text-sm rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-[#c85a32]"
                />
              </div>
            </div>

            {/* Desktop Action Area: Quantity & Add to Cart */}
            <div className="pt-6 border-t border-neutral-200/80 dark:border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Quantity Control */}
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    Jumlah:
                  </span>
                  <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-full bg-neutral-50 dark:bg-neutral-800 p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={qty <= 1}
                      onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                      className="size-8 rounded-full cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-10 text-center font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      {qty}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setQty((prev) => prev + 1)}
                      className="size-8 rounded-full cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Subtotal Display */}
                <div className="text-right">
                  <div className="text-[11px] text-neutral-400 font-medium">
                    Total Harga
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#c85a32]">
                    {formatRupiah(subtotal)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  className="h-12 rounded-2xl bg-[#ffdbcf] hover:bg-[#ffcdbd] text-[#c85a32] font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="size-4 stroke-[2.5]" />
                  <span>+ Keranjang ({qty})</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="h-12 rounded-2xl bg-[#c85a32] hover:bg-[#b34a24] text-white font-bold text-sm shadow-md shadow-[#c85a32]/25 hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Pesan Sekarang</span>
                  <ChevronRight className="size-4 stroke-[2.5]" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Menu Lainnya dari Tenant Ini */}
      {tenantOtherProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c85a32]">
                DARI TENANT YANG SAMA
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                Menu Lain di {product.tenantName}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tenantOtherProducts.map((other) => (
              <Link
                key={other.id}
                href={`/customer/product/${other.slug}`}
                className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 p-4 hover:border-[#c85a32]/40 hover:shadow-lg transition-all duration-300 group flex gap-4 cursor-pointer"
              >
                <div className="relative size-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                  {other.image ? (
                    <Image
                      src={other.image}
                      alt={other.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <TenantifyPlaceholder size="sm" subtitle={other.category} />
                  )}
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-[#c85a32] transition-colors truncate">
                      {other.name}
                    </h4>
                    <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                      {other.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-extrabold text-xs text-[#c85a32]">
                      {formatRupiah(other.price)}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-[#c85a32] flex items-center">
                      Lihat <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 4. Rekomendasi Menu Pilihan Lainnya */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c85a32]">
                REKOMENDASI KULINER
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                Pilihan Serupa Kategori {product.category}
              </h3>
            </div>
            <Link
              href="/customer#pilihan-menu"
              className="text-xs font-bold text-[#c85a32] hover:text-[#b34a24] flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/customer/product/${rel.slug}`}
                className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 p-4 hover:border-[#c85a32]/40 hover:shadow-lg transition-all duration-300 group flex gap-4 cursor-pointer"
              >
                <div className="relative size-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                  {rel.image ? (
                    <Image
                      src={rel.image}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <TenantifyPlaceholder size="sm" subtitle={rel.category} />
                  )}
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <span className="text-[10px] font-bold text-[#c85a32] block truncate">
                      {rel.tenantName}
                    </span>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-[#c85a32] transition-colors truncate mt-0.5">
                      {rel.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-extrabold text-xs text-[#c85a32]">
                      {formatRupiah(rel.price)}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-[#c85a32] flex items-center">
                      Lihat <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. Mobile Sticky Bottom Action Bar */}
      <div className="fixed sm:hidden bottom-0 inset-x-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-3 z-40 shadow-xl flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-neutral-400 font-medium">
            Total ({qty} item)
          </div>
          <div className="text-base font-extrabold text-[#c85a32]">
            {formatRupiah(subtotal)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-full bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5">
            <button
              type="button"
              disabled={qty <= 1}
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="size-7 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-6 text-center text-xs font-bold">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((prev) => prev + 1)}
              className="size-7 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300"
            >
              <Plus className="size-3" />
            </button>
          </div>

          <Button
            type="button"
            onClick={() => handleAddToCart(false)}
            className="h-10 px-4 rounded-xl bg-[#c85a32] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag className="size-3.5 stroke-[2.5]" />
            <span>+ Keranjang</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

