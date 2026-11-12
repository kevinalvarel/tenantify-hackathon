"use client";

import {
  Star,
  UtensilsCrossed,
  ArrowRight,
  Store,
} from "lucide-react";
import { useCustomer } from "@/context/customer-context";

export function FeaturedTenantsSection({
  onSelectTenant,
}: {
  onSelectTenant?: (tenantId: string) => void;
}) {
  const { tenants } = useCustomer();

  if (!tenants || tenants.length === 0) {
    return null;
  }

  const handleTenantClick = (tenantId: string) => {
    if (onSelectTenant) {
      onSelectTenant(tenantId);
    }
    const menuEl = document.getElementById("customer-product-explorer");
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
            terbaik, siap dipesan bersamaan dalam satu transaksi.
          </p>
        </div>

        {/* Tenant Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 pt-2">
          {tenants.map((tenant) => (
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
                      {tenant.rating} ({tenant.totalReviews} ulasan) • {tenant.boothNumber}
                    </span>
                  </div>
                  <p className="text-xs text-[#c85a32] font-semibold mt-2.5">
                    {tenant.zone} • {tenant.isOpen ? "Buka Sekarang" : "Tutup"}
                  </p>
                </div>

                <div className="py-4 space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Store className="size-3.5 text-[#c85a32] shrink-0" />
                    <span>Stan {tenant.boothNumber} ({tenant.zone})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="size-3.5 text-[#c85a32] shrink-0" />
                    <span>Kategori {tenant.category}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTenantClick(tenant.id)}
                className="w-full mt-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-[#c85a32] hover:text-white rounded-xl font-semibold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Lihat Menu {tenant.name}</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
