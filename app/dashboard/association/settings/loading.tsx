import { Skeleton } from "@/components/ui/skeleton";

export default function AssociationSettingsLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl" aria-busy="true" aria-live="polite">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

