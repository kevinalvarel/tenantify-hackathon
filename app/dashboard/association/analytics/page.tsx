import { AnalyticsDashboard } from "@/components/association/analytics/analytics-dashboard";

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function AnalyticsPage() {
  return <AnalyticsDashboard today={todayKey()} />;
}
