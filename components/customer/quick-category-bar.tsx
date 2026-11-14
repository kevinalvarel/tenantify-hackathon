"use client";

import {
  Utensils,
  Coffee,
  Croissant,
  Soup,
  Flame,
  Package,
  Boxes,
  Star,
} from "lucide-react";
import { useCustomer } from "@/context/customer-context";
import { cn } from "@/lib/utils";

type CategoryItem = {
  id: string;
  name: string;
  menuCount: string;
  icon: React.ComponentType<{ className?: string }>;
};

const categories: CategoryItem[] = [
  {
    id: "cat-makanan-berat",
    name: "Makanan Berat",
    menuCount: "142 Menu",
    icon: Utensils,
  },
  {
    id: "cat-kopi-teh",
    name: "Kopi & Teh",
    menuCount: "68 Menu",
    icon: Coffee,
  },
  {
    id: "cat-camilan-roti",
    name: "Camilan & Roti",
    menuCount: "54 Menu",
    icon: Croissant,
  },
  {
    id: "cat-nusantara",
    name: "Nusantara",
    menuCount: "95 Menu",
    icon: Soup,
  },
  {
    id: "cat-mie-pasta",
    name: "Mie & Pasta",
    menuCount: "42 Menu",
    icon: Flame,
  },
  {
    id: "cat-paket-hemat",
    name: "Paket Hemat",
    menuCount: "29 Menu",
    icon: Package,
  },
  {
    id: "cat-katering-box",
    name: "Katering Box",
    menuCount: "18 Paket",
    icon: Boxes,
  },
  {
    id: "cat-menu-favorit",
    name: "Menu Favorit",
    menuCount: "Paling Laris",
    icon: Star,
  },
];

export function QuickCategoryBar({
  onSelectCategory,
  activeCategory,
}: {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
}) {
  const { selectedCategory, setSelectedCategory, products } = useCustomer();
  const current = activeCategory || selectedCategory;

  const getCategoryCount = (catName: string) => {
    if (!products || products.length === 0) return 0;
    if (catName === "Makanan Berat") {
      return products.filter(
        (p) =>
          p.category === "Makanan" ||
          p.category === "Makanan Berat" ||
          p.category === "Nusantara" ||
          p.name.toLowerCase().includes("nasi") ||
          p.name.toLowerCase().includes("bebek") ||
          p.name.toLowerCase().includes("ayam"),
      ).length;
    }
    if (catName === "Kopi & Teh") {
      return products.filter(
        (p) =>
          p.category === "Minuman" ||
          p.category === "Kopi & Teh" ||
          p.name.toLowerCase().includes("kopi") ||
          p.name.toLowerCase().includes("teh"),
      ).length;
    }
    if (catName === "Camilan & Roti") {
      return products.filter(
        (p) =>
          p.category === "Camilan" ||
          p.category === "Camilan & Roti" ||
          p.name.toLowerCase().includes("roti") ||
          p.name.toLowerCase().includes("toast") ||
          p.name.toLowerCase().includes("dimsum"),
      ).length;
    }
    if (catName === "Nusantara") {
      return products.filter(
        (p) =>
          p.category === "Nusantara" ||
          p.name.toLowerCase().includes("bebek") ||
          p.name.toLowerCase().includes("ayam") ||
          p.name.toLowerCase().includes("sate"),
      ).length;
    }
    if (catName === "Mie & Pasta") {
      return products.filter(
        (p) =>
          p.category === "Mie & Pasta" ||
          p.name.toLowerCase().includes("mie") ||
          p.name.toLowerCase().includes("seblak"),
      ).length;
    }
    if (catName === "Paket Hemat") {
      return products.filter(
        (p) =>
          p.category === "Paket Hemat" || p.name.toLowerCase().includes("paket"),
      ).length;
    }
    if (catName === "Katering Box") {
      return products.filter(
        (p) =>
          p.category === "Katering Box" ||
          p.name.toLowerCase().includes("katering") ||
          p.name.toLowerCase().includes("bento"),
      ).length;
    }
    if (catName === "Menu Favorit") {
      return products.filter((p) => Boolean(p.isPopular)).length;
    }
    return 0;
  };

  const handleClick = (categoryName: string) => {
    // Toggle: jika kategori yang sama diklik lagi, kembalikan ke "Semua"
    const nextCategory = current === categoryName ? "Semua" : categoryName;
    if (onSelectCategory) {
      onSelectCategory(nextCategory);
    } else {
      setSelectedCategory(nextCategory);
    }

    const targetEl = document.getElementById("pilihan-menu");
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="katalog-cepat"
      aria-label="Katalog Cepat Kategori Kuliner"
      className="py-6 sm:py-8 bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 max-w-7xl mx-auto w-full px-4 sm:px-6 my-2"
    >
      <div className="text-center mb-5 sm:mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#c85a32] block">
          KATALOG CEPAT
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
          Jelajahi Kategori Kuliner Pilihan
        </h2>
      </div>

      {/* 8-item category grid with strict single-active terracotta selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
        {categories.map((cat) => {
          const isSelected = current === cat.name;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleClick(cat.name)}
              className={cn(
                "group flex flex-col items-center p-3.5 sm:p-4 rounded-2xl transition-all duration-200 text-center border cursor-pointer select-none",
                isSelected
                  ? "bg-[#c85a32] text-white border-[#c85a32] shadow-lg -translate-y-1"
                  : "bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 hover:border-[#c85a32]/60 hover:bg-[#fff9f6] dark:hover:bg-neutral-800/80 hover:shadow-md hover:-translate-y-0.5 text-neutral-900 dark:text-neutral-100",
              )}
            >
              <div
                className={cn(
                  "size-11 sm:size-12 rounded-full flex items-center justify-center transition-colors mb-2",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[#ffdbcf] dark:bg-neutral-800 text-[#c85a32] group-hover:scale-105",
                )}
              >
                <Icon className="size-5 sm:size-6" />
              </div>
              <span
                className={cn(
                  "font-bold text-xs sm:text-[13px] transition-colors line-clamp-1",
                  isSelected
                    ? "text-white"
                    : "text-neutral-800 dark:text-neutral-200 group-hover:text-[#c85a32]",
                )}
              >
                {cat.name}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors mt-0.5",
                  isSelected
                    ? "text-white/90"
                    : "text-neutral-500 dark:text-neutral-400",
                )}
              >
                {getCategoryCount(cat.name) > 0
                  ? `${getCategoryCount(cat.name)} Menu`
                  : "Pilihan"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
