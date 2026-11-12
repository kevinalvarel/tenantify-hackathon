import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Skeleton className="col-span-2 h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl max-sm:col-span-2" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid gap-3 lg:grid-cols-5">
        <Skeleton className="h-64 rounded-xl lg:col-span-3" />
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      </div>
      <div className="grid gap-3 lg:grid-cols-5">
        <Skeleton className="h-72 rounded-xl lg:col-span-3" />
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}
