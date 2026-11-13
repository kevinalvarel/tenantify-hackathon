import { Skeleton } from "@/components/ui/skeleton";

export default function SellerStockLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>

      {/* Search & Stock Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <Skeleton className="h-10 w-full sm:w-72 rounded-md" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Skeleton className="h-9 w-24 rounded-md shrink-0" />
          <Skeleton className="h-9 w-28 rounded-md shrink-0" />
          <Skeleton className="h-9 w-28 rounded-md shrink-0" />
          <Skeleton className="h-9 w-24 rounded-md shrink-0" />
        </div>
      </div>

      {/* Product Stock Table */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-3 border-b last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-5 w-10" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

