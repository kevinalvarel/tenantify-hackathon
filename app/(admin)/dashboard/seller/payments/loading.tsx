import { Skeleton } from "@/components/ui/skeleton";

export default function SellerPaymentsLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      {/* Booth Info & Bill Summary Banner */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-36" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>

      {/* Invoices List / Table */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-3 border-b last:border-b-0"
          >
            <div className="space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

