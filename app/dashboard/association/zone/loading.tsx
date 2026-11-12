import { Skeleton } from "@/components/ui/skeleton";

export default function AssociationZoneLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      {/* Overview Card */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Zone Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Skeleton className="h-9 w-24 rounded-md shrink-0" />
        <Skeleton className="h-9 w-28 rounded-md shrink-0" />
        <Skeleton className="h-9 w-28 rounded-md shrink-0" />
        <Skeleton className="h-9 w-28 rounded-md shrink-0" />
      </div>

      {/* Booth Grid Cards by Zone */}
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, zIdx) => (
          <div key={zIdx} className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, bIdx) => (
                <Skeleton key={bIdx} className="h-28 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

