import { AnalyticsDashboard } from "@/components/association/analytics/analytics-dashboard";
import { connection } from "next/server";

async function todayKey() {
  await connection();
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default async function AnalyticsPage() {
  return <AnalyticsDashboard today={await todayKey()} />;
}
