import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { Suspense } from "react";

// Opt out of instant navigation validation — this layout intentionally
// reads the session (request-time data) and blocks until it resolves.
// See: https://nextjs.org/docs/messages/blocking-prerender-dynamic
export const instant = false;

async function AuthenticatedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user
    ? {
        name: session.user.name || "Pengguna",
        email: session.user.email || "",
        avatar: session.user.image || undefined,
        role: (session.user as { role?: string }).role || "customer",
      }
    : undefined;

  return <DashboardShell user={user}>{children}</DashboardShell>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Suspense fallback={null}>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </Suspense>
    </main>
  );
}
