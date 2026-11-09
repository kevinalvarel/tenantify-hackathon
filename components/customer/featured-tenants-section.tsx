"use client";

import {
  Star,
  Flame,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  ArrowRight,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FeaturedTenant = {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  stall: string;
  rating: number;
  reviewsCount: string;
  startingPrice: string;
  estimatedTime: string;
  isPopular?: boolean;
  signatureMenus: string[];
  perks: string;
};

const featuredTenants: FeaturedTenant[] = [
  {
    id: "feat-kevin-kebab",
    tenantId: "tenant-kevin-kebab",
    name: "Kevin Kebab",
    category: "Kebab, Burger & Middle Eastern",
    stall: "Stall A-04",
    rating: 4.9,
    reviewsCount: "420+ ulasan",
    startingPrice: "Mulai Rp 18.000",
    estimatedTime: "10-15 Menit",
    signatureMenus: [
      "Kebab Daging Sapi Super Jumbo (Laris)",
      "Kebab Mozzarella Cheese Melt",
      "Beef Burger Crispy Onion Ring",
      "Shawarma Roll Daging Kambing",
    ],
    perks: "Pilihan Saus: Blackpepper, Mayo, Pedas",
  },
  {
    id: "feat-seblak-safik",
    tenantId: "tenant-seblak-safik",
    name: "Seblak Safik",
    category: "Seblak Prasmanan & Jajanan Pedas Bandung",
    stall: "Stall B-12",
    rating: 4.9,
    reviewsCount: "850+ ulasan",
    startingPrice: "Mulai Rp 15.000",
    estimatedTime: "12-18 Menit",
    isPopular: true,
    signatureMenus: [
      "Seblak Komplit Ceker & Tulang Rangu",
      "Seblak Seafood Dumpling Keju",
      "Seblak Cilok Goang Level Pedas 1-5",
      "Cuanki Lidah & Batagor Kuah Kencur",
    ],
    perks: "Free Ekstra Kerupuk & Jeruk Limau",
  },
  {
    id: "feat-bebek-madura",
    tenantId: "tenant-bebek-madura",
    name: "Bebek Madura Cak Munir",
    category: "Bebek & Ayam Bumbu Hitam Madura",
    stall: "Stall C-01",
    rating: 4.8,
    reviewsCount: "530+ ulasan",
    startingPrice: "Mulai Rp 28.000",
    estimatedTime: "10-15 Menit",
    signatureMenus: [
      "Bebek Goreng Bumbu Hitam Rempah",
      "Bebek Peking Cabe Ijo Gurih",
      "Nasi Bebek Suwir Sambal Korek",
      "Ayam Bakar Madu Madura",
    ],
    perks: "Sambal Mangga Muda Segar & Lalapan",
  },
  {
    id: "feat-janji-manis",
    tenantId: "tenant-janji-manis",
    name: "Kopi & Toast Janji Manis",
    category: "Artisan Coffee, Toast & Minuman",
    stall: "Stall A-01",
    rating: 4.8,
    reviewsCount: "390+ ulasan",
    startingPrice: "Mulai Rp 12.000",
    estimatedTime: "5-10 Menit",
    signatureMenus: [
      "Es Kopi Susu Gula Aren Spesial",
      "Toast Roti Bakar Cokelat Keju Melt",
      "Matcha Cream Cheese Macchiato",
      "Earl Grey Milk Tea Boba Brown Sugar",
    ],
    perks: "Croffle Butter Cinnamon Sugar",
  },
];

export function FeaturedTenantsSection({
  onSelectTenant,
}: {
  onSelectTenant?: (tenantId: string) => void;
}) {
  const handleTenantClick = (tenantId: string) => {
    if (onSelectTenant) {
      onSelectTenant(tenantId);
    }
    const menuEl = document.getElementById("pilihan-menu");
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="katering-section"
      aria-label="Tenant Kuliner Favorit"
      className="py-10 sm:py-14 bg-white dark:bg-neutral-900/60 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 max-w-7xl mx-auto w-full px-4 sm:px-6 my-4 shadow-xs"
    >
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#c85a32]">
            TENANT MITRA TERBAIK
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Jelajahi Tenant Kuliner Favorit
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
            Nikmati aneka hidangan autentik langsung dari stall &amp; tenant
            terbaik, siap dipesan bersamaan dalam satu meja atau antar ke rumah.
          </p>
        </div>

        {/* 4 Tenant Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 pt-2">
          {featuredTenants.map((tenant) => {
            if (tenant.isPopular) {
              return (
                <div
                  key={tenant.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl relative transform lg:-translate-y-2 border-2 border-[#c85a32] transition-all hover:shadow-2xl"
                >
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#c85a32] text-white text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="size-3 fill-white" />
                    <span>TERPOPULER</span>
                  </div>

                  <div>
                    <div className="text-center pb-4 pt-2 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-[11px] font-bold text-[#c85a32] uppercase tracking-wider block">
                        {tenant.category}
                      </span>
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#c85a32] mt-1">
                        {tenant.name}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 bg-[#ffdbcf]/60 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                        <Star className="size-3.5 fill-[#c85a32] text-[#c85a32]" />
                        <span>
                          {tenant.rating} ({tenant.reviewsCount}) • {tenant.stall}
                        </span>
                      </div>
                      <p className="text-xs text-[#c85a32] font-bold mt-2.5">
                        {tenant.startingPrice} • {tenant.estimatedTime}
                      </p>
                    </div>

                    <div className="py-4 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                      {tenant.signatureMenus.map((menu, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <UtensilsCrossed className="size-3.5 text-[#c85a32] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{menu}</span>
                        </div>
                      ))}
                      <div className="flex items-start gap-2 pt-1 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                        <CheckCircle2 className="size-3.5 text-[#c85a32] shrink-0 mt-0.5" />
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {tenant.perks}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTenantClick(tenant.tenantId)}
                    className="w-full mt-4 py-2.5 sm:py-3 bg-[#c85a32] hover:bg-[#b34a24] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Lihat Menu {tenant.name}</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={tenant.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all border border-neutral-200/80 dark:border-neutral-800 hover:border-[#c85a32]/50 group"
              >
                <div>
                  <div className="text-center pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                      {tenant.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 group-hover:text-[#c85a32] transition-colors">
                      {tenant.name}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                      <Star className="size-3.5 fill-[#c85a32] text-[#c85a32]" />
                      <span>
                        {tenant.rating} ({tenant.reviewsCount}) • {tenant.stall}
                      </span>
                    </div>
                    <p className="text-xs text-[#c85a32] font-bold mt-2.5">
                      {tenant.startingPrice} • {tenant.estimatedTime}
                    </p>
                  </div>

                  <div className="py-4 space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                    {tenant.signatureMenus.map((menu, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <UtensilsCrossed className="size-3.5 text-[#c85a32] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{menu}</span>
                      </div>
                    ))}
                    <div className="flex items-start gap-2 pt-1 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                      <CheckCircle2 className="size-3.5 text-[#c85a32] shrink-0 mt-0.5" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {tenant.perks}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTenantClick(tenant.tenantId)}
                  className="w-full mt-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-[#c85a32] hover:text-white rounded-xl font-semibold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Lihat Menu {tenant.name}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

