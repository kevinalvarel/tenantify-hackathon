import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { Building2, CheckCircle2, Search } from "lucide-react";
import { db } from "@/drizzle";
import { user } from "@/db/schema";
import { joinAssociationSchema } from "@/validations/auth-validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const instant = false;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawCode = Array.isArray(params.code) ? params.code[0] : params.code;
  const submitted = rawCode !== undefined && rawCode.trim() !== "";

  let association: { name: string } | null = null;
  let error: string | null = null;

  if (submitted) {
    const parsed = joinAssociationSchema.safeParse({ code: rawCode });
    if (!parsed.success) {
      error = parsed.error.issues[0]?.message ?? "Kode pengelola tidak valid.";
    } else {
      const [row] = await db
        .select({ name: user.name })
        .from(user)
        .where(
          and(
            eq(user.associationCode, parsed.data.code),
            eq(user.role, "association"),
          ),
        )
        .limit(1);

      if (row) {
        association = row;
      } else {
        error = "Kode pengelola tidak ditemukan.";
      }
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-semibold text-lg"
        >
          <Building2 className="size-6 text-primary" />
          Tenant<span className="text-primary">ify</span>
        </Link>

        <Card>
          <CardContent className="flex flex-col gap-5 p-6">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold">Temukan Pengelola</h1>
              <p className="text-sm text-balance text-muted-foreground">
                Masukkan kode unik pengelola untuk melihat pedagang di area
                mereka.
              </p>
            </div>

            <form action="/join" method="get" className="flex flex-col gap-3">
              <Label htmlFor="code">Kode Pengelola</Label>
              <Input
                id="code"
                name="code"
                defaultValue={rawCode ?? ""}
                placeholder="Contoh: A3K7PQ"
                maxLength={6}
                autoComplete="off"
                autoCapitalize="characters"
                className="uppercase tracking-[0.3em]"
                required
              />
              <Button type="submit" className="w-full gap-1.5">
                <Search className="size-4" />
                Cari Pengelola
              </Button>
            </form>

            {association && (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-600/30 bg-emerald-600/10 p-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Pengelola ditemukan
                  </p>
                  <p className="font-semibold">{association.name}</p>
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
