"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Flame,
  Store,
  Plus,
  Sparkles,
} from "lucide-react";
import { useCustomer } from "@/context/customer-context";
import { formatRupiah, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerProduct } from "@/types/customer";

export type FavoriteMenuItem = {
  id: string;
  name: string;
  tenantName: string;
  boothNumber: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  soldCount: number;
  description: string;
  image: string;
};

const favoriteMenus: FavoriteMenuItem[] = [
  {
    id: "fav-kwetiau-sapi",
    name: "Kwetiau Goreng Sapi",
    tenantName: "Solaria Food Express",
    boothNumber: "Booth A-02",
    category: "Makanan Berat",
    price: 45000,
    originalPrice: 50000,
    rating: 4.9,
    soldCount: 1420,
    description:
      "Kwetiau goreng kenyal dengan irisan daging sapi empuk, tauge segar, telur orak-arik, dan bumbu khas oriental yang gurih wangi.",
    image: "/images/favorites/kwetiau-goreng-sapi.jpg",
  },
  {
    id: "fav-express-teriyaki",
    name: "Express Bowl Ayam Teriyaki",
    tenantName: "Solaria Food Express",
    boothNumber: "Booth A-02",
    category: "Makanan Berat",
    price: 38000,
    originalPrice: 42000,
    rating: 4.8,
    soldCount: 1850,
    description:
      "Rice bowl lezat dengan irisan ayam katsu renyah berlumur saus teriyaki manis gurih, telur mata sapi setengah matang, dan taburan wijen.",
    image: "/images/favorites/express-bowl-teriyaki.jpg",
  },
  {
    id: "fav-nasi-cap-cay",
    name: "Nasi Cap Cay Seafood",
    tenantName: "Solaria Food Express",
    boothNumber: "Booth A-02",
    category: "Makanan Berat",
    price: 47000,
    originalPrice: 52000,
    rating: 4.9,
    soldCount: 980,
    description:
      "Perpaduan aneka sayuran segar renyah dengan udang segar dan cumi-cumi kuah kental gurih, disajikan hangat bersama nasi putih pulen.",
    image: "/images/favorites/nasi-cap-cay-seafood.jpg",
  },
  {
    id: "fav-nasgor-spesial",
    name: "Nasi Goreng Spesial",
    tenantName: "Solaria Food Express",
    boothNumber: "Booth A-02",
    category: "Makanan Berat",
    price: 42000,
    originalPrice: 48000,
    rating: 4.9,
    soldCount: 2310,
    description:
      "Nasi goreng legendaris beraroma sedap dipadukan dengan sate ayam saus kacang, telur mata sapi, kerupuk udang renyah, dan acar segar.",
    image: "/images/favorites/nasi-goreng-spesial.jpg",
  },
  {
    id: "fav-cordon-bleu",
    name: "Chicken Cordon Bleu",
    tenantName: "Solaria Food Express",
    boothNumber: "Booth A-02",
    category: "Makanan Barat",
    price: 52000,
    originalPrice: 58000,
    rating: 4.9,
    soldCount: 1120,
    description:
      "Dada ayam fillet berbalut tepung renyah keemasan dengan isian keju mozarella meleleh dan daging asap gurih, disajikan dengan kentang goreng.",
    image: "/images/favorites/chicken-cordon-bleu.jpg",
  },
  {
    id: "fav-mie-seafood",
    name: "Mie Goreng Seafood",
    tenantName: "Solaria Food Express",
    boothNumber: "Booth A-02",
    category: "Makanan Berat",
    price: 46000,
    originalPrice: 51000,
    rating: 4.8,
    soldCount: 890,
    description:
      "Mie telur kenyal dimasak dengan bumbu kecap manis gurih, potongan udang besar, cumi segar, telur, caisim, dan acar mentimun wortel.",
    image: "/images/favorites/mie-goreng-seafood.jpg",
  },
];

// Soft outline decorative doodle SVGs matching the reference image in primary orange theme
function MushroomDoodle() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="size-20 sm:size-28 stroke-primary/35 dark:stroke-primary/25 fill-none stroke-[1.8] pointer-events-none select-none"
    >
      {/* Big Mushroom */}
      <path d="M20 50 C20 28, 65 28, 65 50 Z" />
      <path d="M35 50 Q36 68 38 78 Q50 78 52 78 Q50 68 50 50" />
      <circle cx="36" cy="38" r="3" />
      <circle cx="50" cy="42" r="2.5" />
      {/* Small Mushroom */}
      <path d="M60 62 C60 48, 88 48, 88 62 Z" />
      <path d="M70 62 Q71 74 72 82 Q78 82 80 82 Q78 74 78 62" />
      <circle cx="74" cy="54" r="2" />
    </svg>
  );
}

function VegetableDoodle() {
  return (
    <svg
      viewBox="0 0 110 110"
      className="size-24 sm:size-32 stroke-primary/35 dark:stroke-primary/25 fill-none stroke-[1.8] pointer-events-none select-none"
    >
      {/* Lettuce / Cauliflower head with leaves */}
      <path d="M25 45 C15 35, 30 20, 45 25 C55 15, 75 22, 75 35 C88 38, 90 55, 80 65 C85 78, 68 85, 58 80 C48 90, 30 82, 32 70 C18 68, 15 52, 25 45 Z" />
      <path d="M42 35 C48 42, 58 40, 62 48" />
      <path d="M35 55 C45 52, 55 60, 68 56" />
      {/* Stem / Stalk */}
      <path d="M46 80 L35 102 M58 80 L62 102 M50 82 L48 102" />
    </svg>
  );
}

export function FavoriteMenuSlider() {
  const { addToCart, setIsCartOpen } = useCustomer();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState<FavoriteMenuItem | null>(null);

  // Touch gesture support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(favoriteMenus.length / itemsPerPage);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextPage();
    } else if (diff < -50) {
      prevPage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleAddToCartFromModal = (item: FavoriteMenuItem) => {
    const product: CustomerProduct = {
      id: item.id,
      tenantId: "tenant-solaria",
      tenantName: item.tenantName,
      boothNumber: item.boothNumber,
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      rating: item.rating,
      image: item.image,
      soldCount: item.soldCount,
      isPopular: true,
    };

    addToCart(product);
    toast.success(`"${item.name}" berhasil ditambahkan ke keranjang!`);
    setSelectedItem(null);
    setIsCartOpen(true);
  };

  return (
    <section
      aria-label="Favorite Menu"
      className="relative w-full rounded-2xl sm:rounded-3xl bg-neutral-50/70 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800/80 py-8 sm:py-10 px-4 sm:px-8 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Decorative Doodles in Corners (Orange Theme) */}
      <div className="absolute top-2 sm:top-3 right-3 sm:right-6 pointer-events-none">
        <MushroomDoodle />
      </div>
      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-4 pointer-events-none">
        <VegetableDoodle />
      </div>

      {/* Centered Heading */}
      <div className="relative z-10 text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Favorite Menu
        </h2>
      </div>

      {/* Slider Carousel Window */}
      <div className="relative z-10 w-full overflow-hidden py-2 sm:py-3 -my-2 sm:-my-3">
        <div
          className="flex w-full transition-transform duration-600 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transform: `translateX(-${currentPage * 100}%)`,
          }}
        >
          {Array.from({ length: totalPages }).map((_, pageIdx) => {
            const pageItems = favoriteMenus.slice(
              pageIdx * itemsPerPage,
              pageIdx * itemsPerPage + itemsPerPage
            );

            return (
              <div
                key={pageIdx}
                className="w-full min-w-full shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 px-1.5 sm:px-3 py-1"
              >
                {pageItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedItem(item);
                      }
                    }}
                    className="group relative flex flex-col items-center text-center bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl border-2 border-primary/60 hover:border-primary p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    {/* Floating 'Favorite' Badge (Orange Theme) */}
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full border-none shadow-xs flex items-center gap-1">
                        <Flame className="size-3 fill-current" />
                        Favorite
                      </Badge>
                    </div>

                    {/* Circular Orange Frame matching the theme */}
                    <div className="relative size-44 sm:size-52 md:size-56 rounded-full overflow-hidden border-4 border-primary/25 dark:border-primary/40 group-hover:border-primary/50 shadow-inner mb-4 bg-gradient-to-br from-[#fff7f2] via-primary/10 to-[#fdeee4] dark:from-primary/25 dark:via-primary/15 dark:to-neutral-900 transition-colors duration-200 flex items-center justify-center">
                      <div className="flex flex-col items-center justify-center text-center select-none px-4">
                        <span className="text-base sm:text-lg lg:text-xl font-black tracking-widest uppercase">
                          <span className="text-neutral-900 dark:text-white">TENANT</span>
                          <span className="text-primary">IFY</span>
                        </span>
                      </div>
                    </div>

                    {/* Dish Name */}
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Action Prompt */}
                    <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1 font-serif italic group-hover:text-primary transition-colors">
                      Click to see details
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slider Controls: Dot Pagination (matching screenshot, Orange Theme) */}
      <div className="relative z-10 mt-6 sm:mt-8 flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentPage(i)}
            aria-label={`Buka slide favorite menu ${i + 1}`}
            className={cn(
              "size-2.5 sm:size-3 rounded-full transition-all duration-300 cursor-pointer",
              currentPage === i
                ? "bg-primary scale-125 shadow-xs"
                : "bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
            )}
          />
        ))}
      </div>

      {/* Left / Right Chevron Controls for Quick Click */}
      <button
        type="button"
        onClick={prevPage}
        aria-label="Slide sebelumnya"
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-200 items-center justify-center border border-neutral-200 dark:border-neutral-700 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        type="button"
        onClick={nextPage}
        aria-label="Slide berikutnya"
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-200 items-center justify-center border border-neutral-200 dark:border-neutral-700 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Detail Modal Dialog when user clicks a dish */}
      {selectedItem && (
        <Dialog
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        >
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedItem.name}</DialogTitle>
            </DialogHeader>

            {/* Modal Header Image */}
            <div className="relative w-full h-56 sm:h-64 bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
              <Image
                src={selectedItem.image}
                alt={selectedItem.name}
                fill
                sizes="(max-width: 640px) 100vw, 448px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground font-bold border-none">
                  <Flame className="size-3 mr-1 fill-current" />
                  Menu Favorit
                </Badge>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-md">
                  {selectedItem.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-white/90">
                  <span className="flex items-center gap-1 font-semibold">
                    <Store className="size-3.5 text-amber-400" />
                    {selectedItem.tenantName}
                  </span>
                  <span>•</span>
                  <span>{selectedItem.boothNumber}</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 flex flex-col gap-4">
              {/* Rating & Sold count */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span>{selectedItem.rating}</span>
                  <span className="text-neutral-400 font-normal">
                    ({selectedItem.soldCount}+ pesanan)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Sparkles className="size-3" />
                  <span>Tersedia & Siap Dimasak</span>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
                  Deskripsi Menu
                </span>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  {selectedItem.description}
                </p>
              </div>

              {/* Price and Add To Cart CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Harga
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg sm:text-xl font-black text-primary">
                      {formatRupiah(selectedItem.price)}
                    </span>
                    {selectedItem.originalPrice && (
                      <span className="text-xs text-neutral-400 line-through">
                        {formatRupiah(selectedItem.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleAddToCartFromModal(selectedItem)}
                  className="rounded-full px-5 h-10 gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md active:scale-95 cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Tambah ke Keranjang</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
