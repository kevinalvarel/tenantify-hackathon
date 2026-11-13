import { Skeleton } from "@/components/ui/skeleton";

export default function AssociationPaymentsLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>

      <div className="flex gap-2 border-b pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-7 w-24 rounded-full" />
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between border-b pb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b py-3 last:border-b-0"
          >
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
