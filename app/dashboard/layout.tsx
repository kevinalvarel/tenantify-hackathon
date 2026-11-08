import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { Suspense } from "react";
import DashboardPage from "./page";

export default async function DashboardLayout({
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

  return (
    <main>
      <Suspense fallback={<DashboardPage />}>
        <DashboardShell user={user}>{children}</DashboardShell>;
      </Suspense>
    </main>
  );
}
