import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Pendaftaran Segera Hadir</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Pendaftaran untuk pembeli dan penjual belum tersedia. Saat ini
        pendaftaran publik hanya untuk Association.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button render={<Link href="/auth/sign-up" />} nativeButton={false}>
          Daftar sebagai Association
        </Button>
        <Button
          variant="secondary"
          render={<Link href="/" />}
          nativeButton={false}
        >
          Kembali ke Beranda
        </Button>
      </div>
    </main>
  );
}
