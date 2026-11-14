"use client";

import { useState, useMemo } from "react";
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
  RefreshCw,
  Coffee,
  Croissant,
  Package,
  MoveHorizontal,
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

type MenuShafConfig = {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  categories: string[];
};

/**
 * Shaf (baris) menu untuk tampilan mobile. Produk dikelompokkan ke kategori
 * yang lebih ramah dibaca, lalu setiap shaf digeser secara horizontal.
 */
const menuShafConfigs: MenuShafConfig[] = [
  {
    key: "makanan-berat",
    title: "Makanan Berat",
    icon: UtensilsCrossed,
    categories: ["Makanan Berat", "Makanan", "Nusantara", "Mie & Pasta"],
  },
  {
    key: "minuman",
    title: "Minuman",
    icon: Coffee,
    categories: ["Minuman", "Kopi & Teh", "Minuman Segar"],
  },
  {
    key: "cemilan",
    title: "Cemilan",
    icon: Croissant,
    categories: ["Camilan", "Camilan & Roti", "Makanan Penutup"],
  },
  {
    key: "paket-hemat",
    title: "Paket Hemat",
    icon: Package,
    categories: ["Paket Hemat", "Katering Box"],
  },
];

const fallbackShaf: MenuShafConfig = {
  key: "lainnya",
  title: "Menu Lainnya",
  icon: UtensilsCrossed,
  categories: [],
};

function getMenuShafKey(product: CustomerProduct) {
  const primaryCategory = product.category?.toLowerCase().trim();
  const primaryMatch = menuShafConfigs.find((shaf) =>
    shaf.categories.some(
      (category) => category.toLowerCase() === primaryCategory,
    ),
  );
  if (primaryMatch) return primaryMatch.key;

  // Sebagian produk hanya punya kategori dari sistem lama (mcdCategory).
  const secondaryCategory = product.mcdCategory?.toLowerCase().trim();
  const secondaryMatch = menuShafConfigs.find((shaf) =>
    shaf.categories.some(
      (category) => category.toLowerCase() === secondaryCategory,
    ),
  );

  return secondaryMatch?.key ?? fallbackShaf.key;
}

function ProductCardImage({ product }: { product: CustomerProduct }) {
  const [imgError, setImgError] = useState(false);
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div className="relative h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
      {product.image && !imgError ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized={product.image.startsWith("http")}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn(
            "object-cover group-hover:scale-105 transition-transform duration-500",
            isOutOfStock && "grayscale opacity-60",
          )}
          onError={() => setImgError(true)}
        />
      ) : (
        <TenantifyPlaceholder size="md" subtitle={product.category} />
      )}

      {/* Out of Stock Overlay / Stock Indicator */}
      {isOutOfStock ? (
        <span className="absolute top-3 left-3 bg-red-600/95 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1">
          Stok Habis
        </span>
      ) : product.stock !== undefined && product.stock <= 5 ? (
        <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
          Sisa {product.stock}
        </span>
      ) : product.stock !== undefined && product.stock > 0 ? (
        <span className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
          Stok {product.stock}
        </span>
      ) : null}

      {/* Floating Rating Pill */}
      <span className="absolute top-3 right-3 bg-white/95 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-900 dark:text-neutral-100 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
        <Star className="size-3.5 fill-[#c85a32] text-[#c85a32]" />
        <span>
          {product.rating > 0 ? Number(product.rating).toFixed(1) : "5.0"}
        </span>
      </span>

      {/* Discount Tag */}
      {product.originalPrice && product.originalPrice > product.price && (
        <span className="absolute bottom-3 left-3 bg-[#c85a32] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-md">
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
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <Link
      href={`/customer/product/${productSlug}`}
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between border border-neutral-200/80 dark:border-neutral-800 hover:border-[#c85a32]/40 cursor-pointer select-none",
        isOutOfStock && "opacity-80",
      )}
    >
      <div>
        <ProductCardImage product={product} />

        <div className="p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-[#c85a32] font-bold flex items-center gap-1 min-w-0">
              <Store className="size-3 shrink-0" />
              <span className="truncate">{product.tenantName}</span>
            </p>
            {product.category && (
              <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md shrink-0">
                {product.category}
              </span>
            )}
          </div>
          <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-[#c85a32] transition-colors line-clamp-1 capitalize">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed font-normal">
            {product.description ||
              `Menu hidangan istimewa dari ${product.tenantName}.`}
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
          {product.stock !== undefined && (
            <p
              className={cn(
                "text-[10px] font-medium mt-0.5",
                isOutOfStock
                  ? "text-red-500 font-bold"
                  : "text-neutral-400 dark:text-neutral-500",
              )}
            >
              {isOutOfStock ? "Stok habis" : `Tersedia ${product.stock} porsi`}
            </p>
          )}
        </div>

        {isOutOfStock ? (
          <button
            type="button"
            disabled
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex items-center gap-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-not-allowed select-none"
          >
            <span>Habis</span>
          </button>
        ) : (
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
        )}
      </div>
    </Link>
  );
}

function CompactProductCard({
  product,
  onAddToCart,
}: {
  product: CustomerProduct;
  onAddToCart: (product: CustomerProduct) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const productSlug = product.slug || slugify(product.name);
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const hasDiscount =
    product.originalPrice !== undefined && product.originalPrice > product.price;

  return (
    <Link
      href={`/customer/product/${productSlug}`}
      className={cn(
        "group flex w-[37vw] min-w-[128px] max-w-[160px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-all duration-300 select-none hover:border-[#c85a32]/40 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900",
        isOutOfStock && "opacity-80",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {product.image && !imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            draggable={false}
            unoptimized={product.image.startsWith("http")}
            sizes="(max-width: 768px) 37vw, 160px"
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              isOutOfStock && "grayscale",
            )}
            onError={() => setImgError(true)}
          />
        ) : (
          <TenantifyPlaceholder size="xs" subtitle={product.category} />
        )}

        {/* Rating Pill */}
        <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-neutral-900 shadow-sm backdrop-blur-sm dark:bg-neutral-900/90 dark:text-neutral-100">
          <Star className="size-2.5 fill-amber-400 text-amber-400" />
          {product.rating > 0 ? Number(product.rating).toFixed(1) : "5.0"}
        </span>

        {isOutOfStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-red-600/95 py-1 text-center text-[10px] font-bold tracking-wide text-white uppercase">
            Stok Habis
          </span>
        ) : hasDiscount ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-[#c85a32] px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-white uppercase shadow-sm">
            Hemat {formatRupiah((product.originalPrice ?? 0) - product.price)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="line-clamp-2 min-h-[2.4rem] text-[12.5px] leading-snug font-bold text-neutral-900 capitalize transition-colors group-hover:text-[#c85a32] dark:text-neutral-100">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[1.8rem] text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {product.description || `Menu dari ${product.tenantName}.`}
        </p>

        <div className="mt-auto flex items-end justify-between gap-1.5 pt-2">
          <div className="min-w-0">
            {hasDiscount && (
              <span className="block truncate text-[9px] text-neutral-400 line-through dark:text-neutral-500">
                {formatRupiah(product.originalPrice ?? 0)}
              </span>
            )}
            <p className="truncate text-[13.5px] leading-tight font-extrabold text-[#c85a32]">
              {formatRupiah(product.price)}
            </p>
          </div>

          {isOutOfStock ? (
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
              —
            </span>
          ) : (
            <button
              type="button"
              aria-label={`Tambah ${product.name} ke keranjang`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product);
                toast.success(
                  `"${product.name}" berhasil ditambahkan ke keranjang!`,
                );
              }}
              className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full bg-[#c85a32] text-white shadow-md shadow-[#c85a32]/20 transition-all hover:bg-[#b34a24] active:scale-90"
            >
              <Plus className="size-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

function MobileMenuShaf({
  shaf,
  onAddToCart,
}: {
  shaf: MenuShafConfig & { products: CustomerProduct[] };
  onAddToCart: (product: CustomerProduct) => void;
}) {
  const Icon = shaf.icon;

  return (
    <section
      aria-label={`${shaf.title} - geser untuk melihat menu lainnya`}
      className="min-w-0"
    >
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#c85a32]/10 text-[#c85a32] dark:bg-[#c85a32]/15">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-extrabold text-neutral-900 dark:text-neutral-100">
            {shaf.title}
          </h3>
          <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
            {shaf.products.length} menu pilihan
          </p>
        </div>
      </div>

      <div
        role="region"
        aria-label={`Daftar menu ${shaf.title}`}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-proximity gap-2.5 overflow-x-auto overscroll-x-contain scrollbar-none scroll-px-4 px-4 pt-0.5 pb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]/50 sm:gap-3"
      >
        {shaf.products.map((product) => (
          <CompactProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}

export function ProductExplorer({
  products,
  onAddToCart,
  selectedTenantId: externalTenantId,
  onSelectTenant: externalSetTenant,
}: ProductExplorerProps) {
  const {
    selectedCategory,
    setSelectedCategory,
    leaveUmkm,
    refreshProducts,
    isLoadingProducts,
  } = useCustomer();
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

  // Kelompokkan hasil filter ke beberapa shaf kategori untuk tampilan mobile.
  const menuShafs = useMemo(() => {
    const buckets = new Map<string, CustomerProduct[]>();

    for (const product of filteredProducts) {
      const key = getMenuShafKey(product);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.push(product);
      } else {
        buckets.set(key, [product]);
      }
    }

    const shafs: Array<MenuShafConfig & { products: CustomerProduct[] }> =
      menuShafConfigs
        .map((shaf) => ({
          ...shaf,
          products: buckets.get(shaf.key) ?? [],
        }))
        .filter((shaf) => shaf.products.length > 0);

    const remaining = buckets.get(fallbackShaf.key) ?? [];
    if (remaining.length > 0) {
      shafs.push({ ...fallbackShaf, products: remaining });
    }

    return shafs;
  }, [filteredProducts]);

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

        {/* Mobile: shaf kategori dengan horizontal scroll independen */}
        {filteredProducts.length > 0 && (
          <div className="md:hidden">
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#c85a32]/15 bg-white/80 px-3 py-2 text-[11px] font-medium text-neutral-600 dark:border-[#c85a32]/20 dark:bg-neutral-900/70 dark:text-neutral-300">
              <MoveHorizontal className="size-4 shrink-0 text-[#c85a32]" />
              <span>Geser tiap baris untuk melihat menu lainnya.</span>
            </div>

            <div className="space-y-5">
              {menuShafs.map((shaf) => (
                <MobileMenuShaf
                  key={shaf.key}
                  shaf={shaf}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}

        {/* Desktop: Food Grid (3 columns matching user HTML) */}
        <div className="hidden gap-6 sm:gap-7 md:grid md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoadingProducts && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <RefreshCw className="size-8 text-[#c85a32] animate-spin mb-3" />
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              Menarik daftar menu terkini dari stan UMKM...
            </p>
          </div>
        )}

        {/* Empty State 1: Belum ada menu yang tersedia di UMKM ini */}
        {!isLoadingProducts && products.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-10 sm:p-16 text-center bg-white dark:bg-neutral-900/60 shadow-xs">
            <div className="size-16 rounded-3xl bg-[#c85a32]/10 text-[#c85a32] flex items-center justify-center mb-4">
              <UtensilsCrossed className="size-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
              Belum ada menu yang tersedia di UMKM ini
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mt-2 leading-relaxed">
              Pemilik stan UMKM ini belum mendisplay produk menu di etalase
              katalognya. Silakan cek kembali beberapa saat lagi atau beralih ke
              UMKM lainnya.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refreshProducts();
                  toast.info("Memperbarui menu produk dari database...");
                }}
                className="rounded-full text-xs font-semibold gap-1.5 cursor-pointer hover:border-[#c85a32] hover:text-[#c85a32]"
              >
                <RefreshCw className="size-3.5" />
                <span>Muat Ulang Menu</span>
              </Button>
              <Button
                size="sm"
                onClick={leaveUmkm}
                className="rounded-full bg-[#c85a32] hover:bg-[#b34a24] text-white text-xs font-bold px-5 shadow-sm cursor-pointer"
              >
                <span>Pilih UMKM Lain</span>
              </Button>
            </div>
          </div>
        )}

        {/* Empty State 2: Filter / Search tidak menemukan menu */}
        {!isLoadingProducts &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
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
