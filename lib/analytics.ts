import type { AssociationTenant } from "@/types/association";
import type { Product, Order } from "@/types/seller";
import type {
  AnalyticsRange,
  AnalyticsTotals,
  AssociationAnalytics,
  CategoryAnalyticsSlice,
  DailyAnalyticsPoint,
  HourlyAnalyticsPoint,
  PaymentAnalyticsSlice,
  ProductAnalyticsRank,
  SellerAnalytics,
  TenantAnalyticsRank,
} from "@/types/analytics";

const dayLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
});

const fullDayLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const STANDARD_HOURS = [
  "10.00",
  "11.00",
  "12.00",
  "13.00",
  "14.00",
  "15.00",
  "16.00",
  "17.00",
  "18.00",
  "19.00",
  "20.00",
  "21.00",
];

function generateDailyPoints(today: string, days: number): DailyAnalyticsPoint[] {
  const points: DailyAnalyticsPoint[] = [];
  const baseDate = new Date(`${today}T00:00:00`);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);

    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${d.getFullYear()}-${month}-${day}`;

    points.push({
      date: dateStr,
      label: dayLabelFormatter.format(d),
      fullLabel: fullDayLabelFormatter.format(d),
      revenue: 0,
      transactions: 0,
      visitors: 0,
    });
  }

  return points;
}

export function buildAssociationAnalytics(
  tenants: AssociationTenant[],
  range: AnalyticsRange,
  today: string,
): AssociationAnalytics {
  const activeTenants = tenants.filter((t) => t.status === "active");
  const totalRevenue = activeTenants.reduce((sum, t) => sum + (t.monthlyRevenue || 0), 0);

  const daily = generateDailyPoints(today, range);

  const hourly: HourlyAnalyticsPoint[] = STANDARD_HOURS.map((h) => ({
    hour: h,
    transactions: 0,
  }));

  // Categories
  const categoryTotals: Record<string, number> = {};
  for (const t of activeTenants) {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (t.monthlyRevenue || 0);
  }

  const categories: CategoryAnalyticsSlice[] = Object.entries(categoryTotals).map(
    ([category, rev]) => ({
      category,
      revenue: rev,
      share: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0,
    }),
  );

  // Top tenants
  const topTenants: TenantAnalyticsRank[] = [...activeTenants]
    .sort((a, b) => (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      name: t.name,
      owner: t.owner,
      category: t.category,
      revenue: t.monthlyRevenue || 0,
      transactions: 0,
      share: totalRevenue > 0 ? Math.round(((t.monthlyRevenue || 0) / totalRevenue) * 100) : 0,
    }));

  const payments: PaymentAnalyticsSlice[] = [
    { key: "qris", label: "QRIS", transactions: 0, share: 0, fill: "var(--chart-1)" },
    { key: "cash", label: "Tunai", transactions: 0, share: 0, fill: "var(--chart-3)" },
    { key: "va", label: "Virtual Account", transactions: 0, share: 0, fill: "var(--muted-foreground)" },
    { key: "transfer", label: "Debit / Transfer", transactions: 0, share: 0, fill: "var(--foreground)" },
  ];

  const totals: AnalyticsTotals = {
    revenue: totalRevenue,
    transactions: 0,
    visitors: 0,
    averageTicket: 0,
    averageVisitors: 0,
    previousRevenue: 0,
    previousTransactions: 0,
    revenueChange: null,
    transactionsChange: null,
  };

  return {
    days: range,
    activeTenants: activeTenants.length,
    daily,
    hourly,
    payments,
    categories,
    topTenants,
    totals,
    peakDay: null,
    peakHour: null,
  };
}

export function buildSellerAnalytics(
  today: string,
  range: AnalyticsRange,
  products: Product[] = [],
  orders: Order[] = [],
): SellerAnalytics {
  const daily = generateDailyPoints(today, range);
  const dailyMap = new Map(daily.map((p) => [p.date, p]));

  let completedRevenue = 0;
  let completedTransactions = 0;
  let unitsSold = 0;

  const hourlyCounts: Record<string, number> = {};
  const paymentCounts: Record<string, number> = {};
  const categoryRevenue: Record<string, number> = {};
  const productStats: Record<string, { name: string; category: string; units: number; revenue: number }> = {};

  const finishedOrders = orders.filter((o) => o.status === "Selesai");

  for (const ord of finishedOrders) {
    completedRevenue += ord.total;
    completedTransactions += 1;

    // Daily mapping
    if (ord.createdAt) {
      const match = ord.createdAt.match(/(\d{4}-\d{2}-\d{2})/);
      const dateKey = match ? match[1] : today;
      const point = dailyMap.get(dateKey);
      if (point) {
        point.revenue += ord.total;
        point.transactions += 1;
      }
    }

    // Payment mapping
    const pm = ord.paymentMethod || "QRIS";
    paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;

    // Items
    for (const item of ord.items) {
      unitsSold += item.quantity;
      const itemRev = item.price * item.quantity;

      if (!productStats[item.productName]) {
        const prodMatch = products.find((p) => p.name === item.productName);
        productStats[item.productName] = {
          name: item.productName,
          category: prodMatch?.category || "Makanan",
          units: 0,
          revenue: 0,
        };
      }
      productStats[item.productName].units += item.quantity;
      productStats[item.productName].revenue += itemRev;

      const cat = productStats[item.productName].category;
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + itemRev;
    }
  }

  const hourly: HourlyAnalyticsPoint[] = STANDARD_HOURS.map((h) => ({
    hour: h,
    transactions: hourlyCounts[h] || 0,
  }));

  const totalPayments = Object.values(paymentCounts).reduce((a, b) => a + b, 0);
  const payments: PaymentAnalyticsSlice[] = [
    {
      key: "qris",
      label: "QRIS",
      transactions: paymentCounts["QRIS"] || 0,
      share: totalPayments > 0 ? Math.round(((paymentCounts["QRIS"] || 0) / totalPayments) * 100) : 0,
      fill: "var(--chart-1)",
    },
    {
      key: "cash",
      label: "Tunai",
      transactions: paymentCounts["Tunai"] || 0,
      share: totalPayments > 0 ? Math.round(((paymentCounts["Tunai"] || 0) / totalPayments) * 100) : 0,
      fill: "var(--chart-3)",
    },
    {
      key: "transfer",
      label: "Debit / Transfer",
      transactions: paymentCounts["Debit / Transfer"] || 0,
      share: totalPayments > 0 ? Math.round(((paymentCounts["Debit / Transfer"] || 0) / totalPayments) * 100) : 0,
      fill: "var(--foreground)",
    },
  ];

  const categories: CategoryAnalyticsSlice[] = Object.entries(categoryRevenue).map(
    ([category, rev]) => ({
      category,
      revenue: rev,
      share: completedRevenue > 0 ? Math.round((rev / completedRevenue) * 100) : 0,
    }),
  );

  const topProducts: ProductAnalyticsRank[] = Object.entries(productStats)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(([id, p]) => ({
      id,
      name: p.name,
      category: p.category,
      units: p.units,
      revenue: p.revenue,
      share: completedRevenue > 0 ? Math.round((p.revenue / completedRevenue) * 100) : 0,
    }));

  const totals: AnalyticsTotals = {
    revenue: completedRevenue,
    transactions: completedTransactions,
    visitors: 0,
    averageTicket: completedTransactions > 0 ? Math.round(completedRevenue / completedTransactions) : 0,
    averageVisitors: 0,
    previousRevenue: 0,
    previousTransactions: 0,
    revenueChange: null,
    transactionsChange: null,
  };

  let peakDay: string | null = null;
  let maxDayRev = 0;
  for (const p of daily) {
    if (p.revenue > maxDayRev) {
      maxDayRev = p.revenue;
      peakDay = p.fullLabel;
    }
  }

  return {
    days: range,
    daily,
    hourly,
    payments,
    categories,
    topProducts,
    totals,
    unitsSold,
    peakDay,
    peakHour: null,
  };
}

