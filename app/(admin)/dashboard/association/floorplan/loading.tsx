import { Skeleton } from "@/components/ui/skeleton";

export default function AssociationFloorplanLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Main Floorplan Canvas / Area */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Canvas Area */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg border bg-card">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
          <Skeleton className="h-[520px] w-full rounded-xl" />
        </div>

        {/* Sidebar / Properties Panel */}
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

