import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import { associationProfiles, user } from "@/db/schema";
import { AssociationCodeCard } from "@/components/association/association-code-card";
import { AssociationSettingsForm } from "@/components/association/settings/association-settings-form";
import { AccountSecurityCard } from "@/components/association/settings/account-security-card";

export default async function AssociationSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/auth/sign-in?callbackUrl=/dashboard/association/settings");
  }

  const [row] = await db
    .select({
      code: user.associationCode,
      email: user.email,
      profile: associationProfiles,
    })
    .from(user)
    .leftJoin(associationProfiles, eq(associationProfiles.id, user.id))
    .where(eq(user.id, session.user.id))
    .limit(1);

  const profile = row?.profile;

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight">Pengaturan Area</h1>
        <p className="text-sm text-muted-foreground">
          Kelola profil area, kode pengelola, notifikasi, dan keamanan akun.
        </p>
      </div>

      <AssociationSettingsForm
        initial={{
          name: profile?.name ?? "Area Bazaar",
          description: profile?.description ?? "",
          address: profile?.address ?? "",
          phone: profile?.phone ?? "",
          email: profile?.email ?? row?.email ?? session.user.email,
          notifyNewTenant: profile?.notifyNewTenant ?? true,
          notifyNewReview: profile?.notifyNewReview ?? true,
          notifyPaymentDue: profile?.notifyPaymentDue ?? true,
          bankName: profile?.bankName ?? "",
          bankAccountNumber: profile?.bankAccountNumber ?? "",
          bankAccountHolder: profile?.bankAccountHolder ?? "",
        }}
      />

      <AssociationCodeCard initialCode={row?.code ?? null} />

      <AccountSecurityCard email={row?.email ?? session.user.email} />
    </div>
  );
}
