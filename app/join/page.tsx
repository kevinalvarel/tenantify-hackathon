import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { Building2 } from "lucide-react";
import { db } from "@/drizzle";
import { user } from "@/db/schema";
import { joinAssociationSchema } from "@/validations/auth-validation";
import { Card, CardContent } from "@/components/ui/card";
import { JoinForm } from "./join-form";

export const instant = false;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawCode = Array.isArray(params.code) ? params.code[0] : params.code;
  const submitted = rawCode !== undefined && rawCode.trim() !== "";

  let association: { name: string; code: string } | null = null;
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
        association = { name: row.name, code: parsed.data.code };
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
          <div>
            Tenant<span className="text-primary">ify</span>
          </div>
        </Link>

        <Card>
          <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold">Temukan Pengelola</h1>
              <p className="text-sm text-balance text-muted-foreground">
                Masukkan kode unik pengelola untuk melihat pedagang di area
                mereka.
              </p>
            </div>

            <JoinForm
              key={rawCode ?? ""}
              defaultValue={rawCode ?? ""}
              initialStatus={error ? "error" : "idle"}
              association={association}
              error={error}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
