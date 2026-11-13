import { Skeleton } from "@/components/ui/skeleton";

export default function SellerPosLoading() {
  return (
    <div
      className="flex flex-col lg:flex-row gap-5 h-full min-h-[calc(100vh-8rem)]"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Product Catalog Column */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Search & Categories */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Skeleton className="h-10 w-full sm:w-72 rounded-lg" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Skeleton className="h-9 w-20 rounded-md shrink-0" />
            <Skeleton className="h-9 w-24 rounded-md shrink-0" />
            <Skeleton className="h-9 w-24 rounded-md shrink-0" />
            <Skeleton className="h-9 w-28 rounded-md shrink-0" />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-card p-3 space-y-2 flex flex-col justify-between"
            >
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="w-full lg:w-96 rounded-xl border bg-card p-4 flex flex-col justify-between gap-4 h-fit lg:sticky lg:top-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 flex-1 rounded-md" />
          </div>

          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 py-2 border-b"
              >
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
