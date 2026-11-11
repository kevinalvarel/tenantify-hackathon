import { connection } from "next/server";
import { SellerStatisticsDashboard } from "@/components/seller/statistics/seller-statistics-dashboard";

async function todayKey() {
  await connection();
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default async function SellerStatisticsPage() {
  return <SellerStatisticsDashboard today={await todayKey()} />;
}
