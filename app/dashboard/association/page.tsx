import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/drizzle";
import { user } from "@/db/schema";
import { AssociationDashboard } from "@/components/association/dashboard/association-dashboard";
import { AssociationCodeCard } from "@/components/association/association-code-card";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let associationCode: string | null = null;
  if (session) {
    const [row] = await db
      .select({ code: user.associationCode })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);
    associationCode = row?.code ?? null;
  }

  return (
    <div className="flex flex-col gap-4">
      <AssociationCodeCard initialCode={associationCode} />
      <AssociationDashboard />
    </div>
  );
}
