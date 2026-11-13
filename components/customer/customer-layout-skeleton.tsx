import { Skeleton } from "@/components/ui/skeleton";

export function CustomerLayoutSkeleton() {
  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col w-full overflow-x-clip relative font-poppins"
      style={{ fontFamily: '"Poppins", sans-serif' }}
      aria-busy="true"
      aria-live="polite"
    >
      {/* Pattern Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-repeat opacity-35 dark:opacity-10 dark:invert"
        style={{
          backgroundImage: "url('/images/customer-bg-pattern.jpg')",
          backgroundSize: "360px auto",
          mixBlendMode: "multiply",
        }}
        aria-hidden="true"
      />

      {/* Customer Top Navbar Skeleton (Desktop Only) */}
      <header className="hidden md:flex fixed top-3 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none flex-col items-center">
        <div className="pointer-events-auto w-full max-w-[1240px] flex items-center justify-between px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800/90 shadow-lg shadow-black/5 min-w-0">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 px-1 sm:px-1.5">
            <Skeleton className="h-7 sm:h-8 w-7 sm:w-8 rounded-full" />
            <Skeleton className="h-5 w-24 hidden sm:inline-block rounded-md" />
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>

          {/* Actions (Cart + Profile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-9 w-28 rounded-full hidden sm:block" />
            <Skeleton className="h-9 w-9 rounded-full sm:hidden" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Page Canvas Skeleton */}
      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto pt-4 sm:pt-6 md:pt-24 pb-24 md:pb-6 px-3 sm:px-6 min-w-0">
        <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full min-w-0">
          {/* 1. Hero Promo Banner Skeleton */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs p-6 sm:p-10 shadow-xs flex flex-col justify-between min-h-[220px] sm:min-h-[280px]">
            <div className="space-y-3 max-w-xl">
              <Skeleton className="h-5 w-36 rounded-full" />
              <Skeleton className="h-8 sm:h-10 w-4/5 max-w-md rounded-xl" />
              <Skeleton className="h-4 sm:h-5 w-3/5 max-w-sm rounded-md" />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl hidden sm:block" />
            </div>
          </div>

          {/* 2. Quick Category Bar Skeleton */}
          <div className="py-6 sm:py-8 bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 max-w-7xl mx-auto w-full px-4 sm:px-6 my-2">
            <div className="flex flex-col items-center gap-2 mb-5 sm:mb-6">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-6 w-56 rounded-md" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 gap-2"
                >
                  <Skeleton className="size-11 sm:size-12 rounded-full" />
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="h-2.5 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Product Explorer Section Skeleton */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-48 rounded-md" />
                <Skeleton className="h-4 w-72 rounded max-w-[80%]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-44 rounded-xl hidden sm:block" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>

            {/* Filter Tabs Skeleton */}
            <div className="flex gap-2 overflow-hidden py-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
              ))}
            </div>

            {/* Product Cards Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 sm:p-4 flex flex-col gap-3 shadow-xs"
                >
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-4/5 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                    <Skeleton className="h-3 w-2/3 rounded" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 mt-1">
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-8 w-16 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Skeleton */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800/80 px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-4 max-w-md mx-auto w-full items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[48px] flex flex-col items-center justify-center gap-1.5"
            >
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-2.5 w-10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
