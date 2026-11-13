"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Star,
  Store,
  UtensilsCrossed,
  SlidersHorizontal,
  X,
  ChevronUp,
} from "lucide-react";
import { CustomerProduct, Tenant } from "@/types/customer";
import { formatRupiah, cn } from "@/lib/utils";
import { slugify } from "@/lib/slug";
import { useCustomer } from "@/context/customer-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TenantifyPlaceholder } from "@/components/customer/tenantify-placeholder";

type ProductExplorerProps = {
  products: CustomerProduct[];
  tenants: Tenant[];
  onAddToCart: (product: CustomerProduct) => void;
  selectedTenantId?: string;
  onSelectTenant?: (id: string) => void;
};

const filterTabs = [
  "Semua",
  "Nasi & Lauk",
  "Mie & Pasta",
  "Minuman",
  "Camilan & Roti",
  "Paket Hemat",
  "Menu Favorit",
] as const;

function FloatingScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className="fixed bottom-20 md:bottom-6 right-6 z-40 size-11 rounded-full bg-[#c85a32] hover:bg-[#b34a24] text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
    >
      <ChevronUp className="size-5 stroke-[2.5]" />
    </button>
  );
}

function ProductCardImage({ product }: { product: CustomerProduct }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
      {product.image && !imgError ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
        />
      ) : (
        <TenantifyPlaceholder size="md" subtitle={product.category} />
      )}

      {/* Floating Rating Pill */}
      <span className="absolute top-3 right-3 bg-white/95 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-900 dark:text-neutral-100 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
        <Star className="size-3.5 fill-[#c85a32] text-[#c85a32]" />
        <span>{product.rating}</span>
      </span>

      {/* Discount Tag */}
      {product.originalPrice && product.originalPrice > product.price && (
        <span className="absolute top-3 left-3 bg-[#c85a32] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-md">
          Hemat {formatRupiah(product.originalPrice - product.price)}
        </span>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: CustomerProduct;
  onAddToCart: (product: CustomerProduct) => void;
}) {
  const productSlug = product.slug || slugify(product.name);

  return (
    <Link
      href={`/customer/product/${productSlug}`}
      className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between border border-neutral-200/80 dark:border-neutral-800 hover:border-[#c85a32]/40 cursor-pointer select-none"
    >
      <div>
        <ProductCardImage product={product} />

        <div className="p-4 sm:p-5 space-y-2">
          <p className="text-xs text-[#c85a32] font-bold flex items-center gap-1">
            <Store className="size-3 shrink-0" />
            <span className="truncate">{product.tenantName}</span>
          </p>
          <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-[#c85a32] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed font-normal">
            {product.description}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80 mt-2">
        <div className="pt-2">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through block">
              {formatRupiah(product.originalPrice)}
            </span>
          )}
          <p className="text-base sm:text-lg font-extrabold text-[#c85a32]">
            {formatRupiah(product.price)}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
            toast.success(
              `"${product.name}" berhasil ditambahkan ke keranjang!`,
            );
          }}
          className="flex items-center gap-1.5 bg-[#c85a32] hover:bg-[#b34a24] text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#c85a32]/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="size-4 stroke-[2.5]" />
          <span>Tambah</span>
        </button>
      </div>
    </Link>
  );
}

export function ProductExplorer({
  products,
  tenants,
  onAddToCart,
  selectedTenantId: externalTenantId,
  onSelectTenant: externalSetTenant,
}: ProductExplorerProps) {
  const { selectedCategory, setSelectedCategory } = useCustomer();
  const [searchQuery, setSearchQuery] = useState("");
  const [internalTenantId, setInternalTenantId] = useState<string>("all");
  const selectedTenantId =
    externalTenantId !== undefined ? externalTenantId : internalTenantId;
  const setSelectedTenantId = externalSetTenant || setInternalTenantId;

  const [sortBy, setSortBy] = useState<
    "default" | "price-low" | "price-high" | "rating" | "popular"
  >("default");

  // Filtering
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesTenant =
        selectedTenantId === "all" || p.tenantId === selectedTenantId;

      let matchesCategory =
        selectedCategory === "Semua" || selectedCategory === "";

      if (!matchesCategory) {
        if (
          selectedCategory === "Nasi & Lauk" ||
          selectedCategory === "Makanan Berat"
        ) {
          matchesCategory =
            p.category === "Makanan Berat" ||
            p.category === "Nusantara" ||
            p.mcdCategory === "Makanan Berat" ||
            p.mcdCategory === "Nusantara" ||
            p.name.toLowerCase().includes("nasi") ||
            p.name.toLowerCase().includes("bebek") ||
            p.name.toLowerCase().includes("ayam") ||
            p.name.toLowerCase().includes("sate");
        } else if (selectedCategory === "Mie & Pasta") {
          matchesCategory =
            p.category === "Mie & Pasta" ||
            p.mcdCategory === "Mie & Pasta" ||
            p.name.toLowerCase().includes("mie") ||
            p.name.toLowerCase().includes("seblak") ||
            p.name.toLowerCase().includes("kwetiau");
        } else if (
          selectedCategory === "Minuman" ||
          selectedCategory === "Kopi & Teh"
        ) {
          matchesCategory =
            p.category === "Minuman" ||
            p.category === "Kopi & Teh" ||
            p.mcdCategory === "Minuman" ||
            p.mcdCategory === "Kopi & Teh" ||
            p.name.toLowerCase().includes("kopi") ||
            p.name.toLowerCase().includes("teh") ||
            p.name.toLowerCase().includes("matcha");
        } else if (selectedCategory === "Camilan & Roti") {
          matchesCategory =
            p.category === "Camilan & Roti" ||
            p.category === "Camilan" ||
            p.mcdCategory === "Camilan" ||
            p.name.toLowerCase().includes("dimsum") ||
            p.name.toLowerCase().includes("toast") ||
            p.name.toLowerCase().includes("croffle") ||
            p.name.toLowerCase().includes("cilok") ||
            p.name.toLowerCase().includes("cuanki");
        } else if (selectedCategory === "Paket Hemat") {
          matchesCategory =
            p.category === "Paket Hemat" ||
            p.category === "Katering Box" ||
            p.mcdCategory === "Paket Hemat" ||
            p.name.toLowerCase().includes("paket") ||
            p.name.toLowerCase().includes("katering");
        } else if (selectedCategory === "Menu Favorit") {
          matchesCategory =
            (p.originalPrice !== undefined && p.originalPrice > p.price) ||
            !!p.isPopular;
        } else if (selectedCategory === "Nusantara") {
          matchesCategory =
            p.category === "Nusantara" ||
            p.mcdCategory === "Nusantara" ||
            p.name.toLowerCase().includes("bebek") ||
            p.name.toLowerCase().includes("ayam") ||
            p.name.toLowerCase().includes("seblak") ||
            p.name.toLowerCase().includes("sate") ||
            p.name.toLowerCase().includes("mie aceh");
        } else {
          matchesCategory =
            p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            Boolean(
              p.mcdCategory &&
              p.mcdCategory
                .toLowerCase()
                .includes(selectedCategory.toLowerCase()),
            );
        }
      }

      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTenant && matchesCategory && matchesSearch;
    });

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered = [...filtered].sort(
          (a, b) => (b.soldCount || 0) - (a.soldCount || 0),
        );
        break;
    }

    return filtered;
  }, [products, selectedTenantId, selectedCategory, searchQuery, sortBy]);

  const hasActiveFilters =
    selectedTenantId !== "all" ||
    selectedCategory !== "Semua" ||
    searchQuery !== "";

  return (
    <section
      id="pilihan-menu"
      aria-label="Pilihan Menu Makanan"
      className="py-10 sm:py-14 bg-neutral-100/70 dark:bg-neutral-900/40 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 max-w-7xl mx-auto w-full px-4 sm:px-6 my-4 shadow-xs"
    >
      <FloatingScrollToTop />

      <div className="space-y-6 sm:space-y-8">
        {/* Header Bar: Title on Top Left, Filtering Underneath */}
        <div className="flex flex-col items-start gap-2.5 w-full">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#c85a32]">
            PILIHAN MENU LENGKAP
          </span>

          {/* Category Filter Pills Underneath Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none w-full max-w-full justify-start">
            {filterTabs.map((tab) => {
              const isSelected =
                (tab === "Semua" && selectedCategory === "Semua") ||
                (tab === "Nasi & Lauk" &&
                  (selectedCategory === "Nasi & Lauk" ||
                    selectedCategory === "Makanan Berat")) ||
                selectedCategory === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedCategory(tab)}
                  className={cn(
                    "px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0",
                    isSelected
                      ? "bg-[#c85a32] text-white shadow-sm"
                      : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-[#c85a32] border border-neutral-200 dark:border-neutral-800",
                  )}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center bg-white dark:bg-neutral-900/90 p-3 sm:p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Cari hidangan atau tenant favorit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 text-xs sm:text-sm rounded-full bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-[#c85a32]"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-6 text-neutral-400 hover:text-foreground rounded-full"
                aria-label="Hapus pencarian"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(val) => {
                if (val) setSortBy(val as typeof sortBy);
              }}
            >
              <SelectTrigger className="h-10 rounded-full bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 gap-2 pl-3.5 pr-3 min-w-[160px] cursor-pointer">
                <SlidersHorizontal className="size-3.5 text-[#c85a32] shrink-0" />
                <SelectValue placeholder="Urutan Default" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-popover text-popover-foreground shadow-xl p-1 min-w-[170px]"
              >
                <SelectItem
                  value="default"
                  className="text-xs font-medium cursor-pointer rounded-xl py-2"
                >
                  Urutan Default
                </SelectItem>
                <SelectItem
                  value="popular"
                  className="text-xs font-medium cursor-pointer rounded-xl py-2"
                >
                  Paling Laris
                </SelectItem>
                <SelectItem
                  value="rating"
                  className="text-xs font-medium cursor-pointer rounded-xl py-2"
                >
                  Rating Tertinggi
                </SelectItem>
                <SelectItem
                  value="price-low"
                  className="text-xs font-medium cursor-pointer rounded-xl py-2"
                >
                  Harga Terendah
                </SelectItem>
                <SelectItem
                  value="price-high"
                  className="text-xs font-medium cursor-pointer rounded-xl py-2"
                >
                  Harga Tertinggi
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Summary */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs text-neutral-500 font-medium">
              Menampilkan {filteredProducts.length} menu pilihan
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedTenantId("all");
                setSelectedCategory("Semua");
                setSortBy("default");
              }}
              className="flex items-center gap-1 text-xs text-[#c85a32] hover:text-[#b34a24] font-bold transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        )}

        {/* Food Grid (3 columns on desktop matching user HTML) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 sm:p-16 text-center text-muted-foreground bg-white dark:bg-neutral-900/40">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#ffdbcf] text-[#c85a32] mb-3">
              <UtensilsCrossed className="size-6" />
            </div>
            <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Menu tidak ditemukan
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mt-1 leading-relaxed">
              Tidak ada produk yang cocok dengan kata kunci atau filter tenant
              yang Anda pilih.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedTenantId("all");
                setSelectedCategory("Semua");
                setSortBy("default");
              }}
              className="mt-4 gap-1.5 rounded-full text-xs font-semibold cursor-pointer border-[#c85a32] text-[#c85a32] hover:bg-[#c85a32] hover:text-white"
            >
              <X className="size-3.5" />
              Reset Semua Filter
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
