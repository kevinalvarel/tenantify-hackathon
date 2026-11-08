"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  Star,
  Store,
  UtensilsCrossed,
  SlidersHorizontal,
  X,
  Fish,
  Flame,
  Hamburger,
  Cookie,
  CupSoda,
  ChevronUp,
} from "lucide-react";
import { CustomerProduct, Tenant } from "@/types/customer";
import { formatRupiah, cn } from "@/lib/utils";
import { useCustomer } from "@/context/customer-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
};

const categories = [
  "Semua",
  "Sushi & Roll",
  "Paling Laris",
  "Makanan Berat",
  "Makanan Ringan",
  "Minuman",
] as const;

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Semua: UtensilsCrossed,
  "Sushi & Roll": Fish,
  "Paling Laris": Flame,
  "Makanan Berat": Hamburger,
  "Makanan Ringan": Cookie,
  Minuman: CupSoda,
};

function AsanohaDecoration() {
  return (
    <div className="hidden xl:block absolute -left-2 top-24 pointer-events-none select-none z-0">
      <svg
        width="64"
        height="160"
        viewBox="0 0 64 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#55824c]/75 dark:text-[#7bb571]/50"
      >
        <path
          d="M0 0 C45 0, 64 45, 64 80 C64 115, 45 160, 0 160 Z"
          fill="currentColor"
          fillOpacity="0.07"
        />
        {/* Geometric Japanese Asanoha Leaf Lines */}
        <g stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7">
          <path d="M0 24 L52 24 M0 56 L62 56 M0 80 L64 80 M0 104 L62 104 M0 136 L52 136" />
          <path d="M12 0 L52 80 L12 160" />
          <path d="M34 0 L62 56 L34 112 L6 160" />
          <path d="M0 40 L46 80 L0 120" />
          <path d="M18 0 L0 34 M40 0 L0 80 M58 24 L0 136" />
          <path d="M0 24 L58 136 M0 80 L40 160 M0 126 L18 160" />
        </g>
      </svg>
    </div>
  );
}

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
      className="fixed bottom-6 right-6 z-40 size-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
    >
      <ChevronUp className="size-5 stroke-[2.5]" />
    </button>
  );
}

function ProductImage({ product }: { product: CustomerProduct }) {
  return (
    <div className="relative w-full h-36 sm:h-44 md:h-48 rounded-2xl overflow-hidden border border-border/40 shadow-2xs">
      <TenantifyPlaceholder size="md" subtitle={product.category} />
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
  onOpenDetail,
}: {
  product: CustomerProduct;
  onAddToCart: (product: CustomerProduct) => void;
  onOpenDetail: (product: CustomerProduct) => void;
}) {
  return (
    <div
      onClick={() => onOpenDetail(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(product);
        }
      }}
      className="group relative flex flex-col items-center text-center p-4 sm:p-6 rounded-3xl hover:bg-neutral-50/90 dark:hover:bg-neutral-900/50 transition-all duration-300 cursor-pointer select-none"
    >
      {/* Centered Food Photo with Generous Breathing Room */}
      <div className="w-full flex items-center justify-center mb-3">
        <ProductImage product={product} />
      </div>

      {/* Dish Name: Bold, Centered, Crisp */}
      <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug line-clamp-2 min-h-[2.75rem] flex items-center justify-center group-hover:text-primary transition-colors">
        {product.name}
      </h4>

      {/* Dish Description: Muted Gray, Centered, Clean Font */}
      <p className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 text-center leading-relaxed font-normal line-clamp-3 min-h-[3.25rem] mt-2 mb-4 max-w-[280px]">
        {product.description}
      </p>

      {/* Simple Price & Add Action with Upper Border Separator */}
      <div className="mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center gap-3 w-full">
        <span className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-neutral-100">
          {formatRupiah(product.price)}
        </span>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
            toast.success(`"${product.name}" ditambahkan ke keranjang.`);
          }}
          className="h-8 px-4 rounded-full text-xs font-semibold gap-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>Tambah</span>
        </Button>
      </div>
    </div>
  );
}

function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: {
  product: CustomerProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: CustomerProduct, qty: number, notes?: string) => void;
}) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ProductDetailModalContent
        key={product.id}
        product={product}
        onClose={onClose}
        onAddToCart={onAddToCart}
      />
    </Dialog>
  );
}

function ProductDetailModalContent({
  product,
  onClose,
  onAddToCart,
}: {
  product: CustomerProduct;
  onClose: () => void;
  onAddToCart: (product: CustomerProduct, qty: number, notes?: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    onAddToCart(product, qty, notes.trim() || undefined);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      {/* Modal Image Area */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <TenantifyPlaceholder size="lg" subtitle={product.category} />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <Badge className="bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-semibold border-none">
            <Store className="size-3 mr-1 text-amber-400" />
            {product.tenantName}
          </Badge>
        </div>
      </div>

      {/* Modal Body */}
      <div className="p-5 sm:p-6 flex flex-col gap-4">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-foreground">
              {product.name}
            </DialogTitle>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{product.boothNumber}</p>
        </DialogHeader>

        {/* Description */}
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
          {product.description}
        </p>

        {/* Notes Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="special-notes"
            className="text-xs font-semibold text-foreground"
          >
            Catatan Khusus (opsional)
          </label>
          <Textarea
            id="special-notes"
            placeholder="Contoh: Saus dipisah, tanpa bawang, dll."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none h-18 text-xs rounded-xl"
          />
        </div>

        {/* Quantity and Add Button */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 border border-border/80 rounded-full px-2 py-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={qty <= 1}
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="size-6 rounded-full"
            >
              <Minus className="size-3" />
            </Button>
            <span className="text-xs font-bold w-5 text-center">{qty}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setQty((prev) => prev + 1)}
              className="size-6 rounded-full"
            >
              <Plus className="size-3" />
            </Button>
          </div>

          <Button
            onClick={handleAdd}
            className="rounded-full px-5 h-9 text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-md active:scale-95"
          >
            <span>Tambah • {formatRupiah(product.price * qty)}</span>
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

function TenantFilterBar({
  tenants,
  selectedTenantId,
  onSelect,
}: {
  tenants: Tenant[];
  selectedTenantId: string;
  onSelect: (id: string) => void;
}) {
  if (tenants.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full max-w-full min-w-0">
      <Button
        type="button"
        variant={selectedTenantId === "all" ? "default" : "secondary"}
        size="sm"
        onClick={() => onSelect("all")}
        className={cn(
          "rounded-full px-3.5 h-8 gap-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 shrink-0",
          selectedTenantId === "all"
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
            : "bg-neutral-100/80 dark:bg-neutral-900 text-foreground hover:bg-neutral-200/60 dark:hover:bg-neutral-800 border-none",
        )}
      >
        <Store className="size-3.5 shrink-0" />
        <span>Semua Tenant</span>
      </Button>

      {tenants.map((tenant) => {
        const isSelected = selectedTenantId === tenant.id;
        return (
          <Button
            key={tenant.id}
            type="button"
            variant={isSelected ? "default" : "secondary"}
            size="sm"
            onClick={() => onSelect(tenant.id)}
            className={cn(
              "rounded-full px-3 h-8 gap-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 shrink-0",
              isSelected
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs"
                : "bg-neutral-100/80 dark:bg-neutral-900 text-foreground hover:bg-neutral-200/60 dark:hover:bg-neutral-800 border-none",
            )}
          >
            <Avatar className="size-4 shrink-0 border-none">
              <AvatarFallback className="text-[8px] font-bold">
                {tenant.avatarText.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>{tenant.name}</span>
          </Button>
        );
      })}
    </div>
  );
}

export function ProductExplorer({
  products,
  tenants,
  onAddToCart,
}: ProductExplorerProps) {
  const { selectedCategory, setSelectedCategory } = useCustomer();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "default" | "price-low" | "price-high" | "rating" | "popular"
  >("default");
  const [selectedDetailProduct, setSelectedDetailProduct] =
    useState<CustomerProduct | null>(null);

  // Filtering
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesTenant =
        selectedTenantId === "all" || p.tenantId === selectedTenantId;

      let matchesCategory = selectedCategory === "Semua";
      if (!matchesCategory) {
        if (selectedCategory === "Sushi & Roll") {
          matchesCategory =
            p.mcdCategory === "Sushi & Roll" ||
            p.category === "Sushi & Roll" ||
            p.name.toLowerCase().includes("roll") ||
            p.name.toLowerCase().includes("tataki");
        } else if (selectedCategory === "Minuman") {
          matchesCategory =
            p.category === "Minuman" ||
            p.mcdCategory === "Minuman" ||
            p.mcdCategory === "McCafe";
        } else if (selectedCategory === "Makanan Ringan") {
          matchesCategory =
            p.category === "Camilan" ||
            p.category === "Makanan Penutup" ||
            p.mcdCategory === "Camilan" ||
            p.mcdCategory === "Makanan Penutup" ||
            p.category === "Makanan Ringan" ||
            p.category === "Snack";
        } else if (selectedCategory === "Makanan Berat") {
          matchesCategory =
            p.category === "Makanan Berat" ||
            p.mcdCategory === "Makanan Berat" ||
            p.category === "Ayam" ||
            p.category === "Daging Sapi" ||
            p.category === "Ikan" ||
            p.category === "Makanan";
        } else if (selectedCategory === "Paling Laris") {
          matchesCategory = !!p.isPopular || (p.soldCount || 0) > 1000;
        } else {
          matchesCategory =
            p.category === selectedCategory ||
            p.mcdCategory === selectedCategory;
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
    <div
      id="explore-catalog"
      className="relative flex flex-col gap-8 sm:gap-10 pt-6 sm:pt-8 pb-16 w-full max-w-full min-w-0"
    >
      {/* Decorative Asanoha Accent Matching Reference Image */}
      <AsanohaDecoration />

      {/* Floating Scroll to Top Button Matching Reference Image */}
      <FloatingScrollToTop />

      {/* Header Section: Simple, Centered */}
      <div className="relative z-10 text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Pilihan Menu
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal max-w-md mx-auto">
          Pilihan hidangan lezat dan segar dari aneka tenant bazaar kami
        </p>
      </div>

      {/* SEARCH + FILTERS: Sleek & Simple */}
      <div className="relative z-10 flex flex-col gap-3.5 max-w-4xl mx-auto w-full">
        {/* Search bar & Sort dropdown */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Cari hidangan atau tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-9 text-sm rounded-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xs focus-visible:ring-1 focus-visible:ring-neutral-400"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 size-6 text-neutral-400 hover:text-foreground rounded-full"
                aria-label="Hapus kata kunci pencarian"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(val) => {
                if (val) setSortBy(val as typeof sortBy);
              }}
            >
              <SelectTrigger
                className="h-9 rounded-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/50 shadow-2xs gap-2 pl-3.5 pr-3 min-w-[150px] cursor-pointer"
                aria-label="Urutkan menu"
              >
                <SlidersHorizontal className="size-3.5 text-neutral-400 shrink-0" />
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

        {/* Minimalist Category Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
          {categories.map((cat) => {
            const isSelected =
              (cat === "Semua" && selectedCategory === "Semua") ||
              selectedCategory === cat;
            const IconComponent = categoryIcons[cat] || UtensilsCrossed;

            return (
              <Button
                key={cat}
                type="button"
                variant={isSelected ? "default" : "secondary"}
                size="sm"
                onClick={() =>
                  setSelectedCategory(cat === "Semua" ? "Semua" : cat)
                }
                className={cn(
                  "rounded-full px-3.5 h-8 gap-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 shrink-0 border-none",
                  isSelected
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs"
                    : "bg-neutral-100/90 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800",
                )}
              >
                <IconComponent
                  className={cn(
                    "size-3.5 shrink-0 transition-colors",
                    isSelected
                      ? "text-white dark:text-neutral-900"
                      : "text-neutral-500 dark:text-neutral-400",
                  )}
                />
                <span>{cat}</span>
              </Button>
            );
          })}
        </div>

        {/* Tenant Filter Row */}
        <div className="flex items-center justify-start sm:justify-center">
          <TenantFilterBar
            tenants={tenants}
            selectedTenantId={selectedTenantId}
            onSelect={setSelectedTenantId}
          />
        </div>
      </div>

      {/* PRODUCT GRID: Clean, Minimalist, 4 Columns on Desktop */}
      <div className="relative z-10 w-full mt-6 sm:mt-10">
        {hasActiveFilters && (
          <div className="flex items-center justify-between mb-6 px-2">
            <span className="text-xs text-neutral-500 font-medium">
              Menampilkan {filteredProducts.length} menu
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedTenantId("all");
                setSelectedCategory("Semua");
                setSortBy("default");
              }}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors"
            >
              <X className="size-3" />
              Reset Filter
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onOpenDetail={(prod) => setSelectedDetailProduct(prod)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-16 text-center text-muted-foreground bg-neutral-50/50 dark:bg-neutral-900/30">
            <div className="flex size-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mb-3">
              <UtensilsCrossed className="size-6 opacity-40" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Menu tidak ditemukan
            </p>
            <p className="text-xs max-w-sm mt-1 leading-relaxed">
              Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih.
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
              className="mt-4 gap-1.5 rounded-full text-xs"
            >
              <X className="size-3" />
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      {/* Item Detail & Customization Modal */}
      <ProductDetailModal
        product={selectedDetailProduct}
        isOpen={!!selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToCart={(product, qty, notes) => {
          for (let i = 0; i < qty; i++) {
            onAddToCart(product);
          }
          toast.success(
            `"${product.name}" (${qty}x) berhasil ditambahkan ke keranjang.${notes ? ` Catatan: ${notes}` : ""}`,
          );
        }}
      />
    </div>
  );
}
