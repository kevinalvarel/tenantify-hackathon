import { Skeleton } from "@/components/ui/skeleton";

export default function SellerStoreSettingsLoading() {
  return (
    <div className="flex flex-col gap-4 max-w-5xl" aria-busy="true" aria-live="polite">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Two Column Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Card: Info Toko */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>

        {/* Right Card: Kontak & Jam Operasional */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-44" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </div>
  );
}

