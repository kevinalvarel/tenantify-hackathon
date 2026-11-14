import { AnalyticsDashboard } from "@/components/association/analytics/analytics-dashboard";
import { getAssociationAnalyticsAction } from "@/servers/association-server";
import { connection } from "next/server";

export default async function AnalyticsPage() {
  await connection();
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${now.getFullYear()}-${month}-${day}`;

  const initialAnalytics = await getAssociationAnalyticsAction(30);

  return (
    <AnalyticsDashboard today={today} initialAnalytics={initialAnalytics} />
  );
}
