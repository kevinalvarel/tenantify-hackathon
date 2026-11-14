import Link from "next/link";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { JoinForm } from "./join-form";
import { resolveUmkmByCodeAction } from "@/servers/customer-server";
import type { ActiveUmkm } from "@/types/customer";

export const instant = false;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawCode = Array.isArray(params.code) ? params.code[0] : params.code;
  const submitted = rawCode !== undefined && rawCode.trim() !== "";

  let umkm: ActiveUmkm | null = null;
  let error: string | null = null;

  if (submitted) {
    const res = await resolveUmkmByCodeAction(rawCode);
    if (res.success && res.umkm) {
      umkm = res.umkm;
    } else {
      error = res.message;
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center p-2 sm:p-4">
      <div className="flex w-full max-w-lg flex-col gap-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-semibold text-lg"
        >
          <Building2 className="size-6 text-[#c85a32]" />
          <div>
            Tenant<span className="text-[#c85a32]">ify</span>
          </div>
        </Link>

        <Card className="rounded-3xl border-neutral-200/90 dark:border-neutral-800 shadow-xl shadow-black/5 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#c85a32] via-[#e57342] to-amber-500" />
          <CardContent className="flex flex-col gap-5 p-5 sm:p-7">
            <div className="space-y-1.5 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Pilih UMKM atau Paguyuban
              </h1>
              <p className="text-xs sm:text-sm text-balance text-neutral-600 dark:text-neutral-400">
                Masukkan 6-digit Kode Unik lokasi atau scan QR code untuk
                mendeteksi UMKM dan menampilkan menu hidangan yang tersedia.
              </p>
            </div>

            <JoinForm
              key={rawCode ?? ""}
              defaultValue={rawCode ?? ""}
              initialStatus={error ? "error" : "idle"}
              detectedUmkm={umkm}
              error={error}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
