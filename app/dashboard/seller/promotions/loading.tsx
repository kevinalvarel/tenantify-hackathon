import { Skeleton } from "@/components/ui/skeleton";

export default function SellerPromotionsLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Promotion Form */}
        <div className="lg:col-span-3 rounded-xl border bg-card p-5 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>

        {/* Existing Promotions List */}
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-6 w-36" />
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

