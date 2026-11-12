import { Skeleton } from "@/components/ui/skeleton";

export default function AssociationRegisterSellerLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl" aria-busy="true" aria-live="polite">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-60" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Main Form Card */}
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="space-y-1 border-b pb-4">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3.5 w-72" />
        </div>

        {/* Input Fields Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>

        {/* Booth Selection Section */}
        <div className="space-y-3 pt-2 border-t">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>
    </div>
  );
}

