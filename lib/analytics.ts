import type { AssociationTenant } from "@/types/association";
import type { Product, Order } from "@/types/seller";
import type {
  AnalyticsRange,
  AnalyticsTotals,
  AssociationAnalytics,
  AssociationOrderRecord,
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

function parseLocalDateAndHour(createdAt: Date | string) {
  const d = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (isNaN(d.getTime())) return null;

  try {
    const dateFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const dateStr = dateFormatter.format(d);

    const hourFormatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      hour12: false,
    });
    let hourStr = hourFormatter.format(d);
    if (hourStr === "24") hourStr = "00";
    const hourKey = `${hourStr.padStart(2, "0")}.00`;

    return { dateStr, hourKey };
  } catch {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return {
      dateStr: `${d.getFullYear()}-${month}-${day}`,
      hourKey: `${String(d.getHours()).padStart(2, "0")}.00`,
    };
  }
}

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
  orders: AssociationOrderRecord[] = [],
): AssociationAnalytics {
  const activeTenants = tenants.filter((t) => t.status === "active");
  const tenantMap = new Map(tenants.map((t) => [t.id, t]));

  const daily = generateDailyPoints(today, range);
  const dailyMap = new Map(daily.map((p) => [p.date, p]));

  // Calculate previous period dates for comparison
  const basePrevDate = new Date(`${daily[0].date}T00:00:00`);
  basePrevDate.setDate(basePrevDate.getDate() - 1);
  const prevMonth = String(basePrevDate.getMonth() + 1).padStart(2, "0");
  const prevDay = String(basePrevDate.getDate()).padStart(2, "0");
  const prevEndDateStr = `${basePrevDate.getFullYear()}-${prevMonth}-${prevDay}`;
  const previousDaily = generateDailyPoints(prevEndDateStr, range);
  const prevDateSet = new Set(previousDaily.map((p) => p.date));

  const hourlyCounts: Record<string, number> = {};
  const paymentCounts: Record<string, number> = {
    QRIS: 0,
    Tunai: 0,
    "Virtual Account": 0,
    "Debit / Transfer": 0,
  };
  const categoryRevenue: Record<string, number> = {};
  const tenantStats: Record<
    string,
    { revenue: number; transactions: number; visitors: number }
  > = {};

  for (const t of activeTenants) {
    tenantStats[t.id] = { revenue: 0, transactions: 0, visitors: 0 };
    categoryRevenue[t.category] = categoryRevenue[t.category] || 0;
  }

  let completedRevenue = 0;
  let completedTransactions = 0;
  let completedVisitors = 0;
  let previousRevenue = 0;
  let previousTransactions = 0;

  const validOrders = orders.filter(
    (o) =>
      o.status !== "Dibatalkan" &&
      (o.status === "Selesai" || o.isPaid === true),
  );

  for (const ord of validOrders) {
    const dt = parseLocalDateAndHour(ord.createdAt);
    if (!dt) continue;

    // Check if order falls into current range
    const currentPoint = dailyMap.get(dt.dateStr);
    if (currentPoint) {
      completedRevenue += ord.total;
      completedTransactions += 1;
      completedVisitors += 1;

      currentPoint.revenue += ord.total;
      currentPoint.transactions += 1;
      currentPoint.visitors += 1;

      // Hourly
      hourlyCounts[dt.hourKey] = (hourlyCounts[dt.hourKey] || 0) + 1;

      // Payment method normalization
      const pm = (ord.paymentMethod || "").toLowerCase();
      if (pm.includes("qris")) {
        paymentCounts["QRIS"] = (paymentCounts["QRIS"] || 0) + 1;
      } else if (pm.includes("tunai") || pm.includes("cash")) {
        paymentCounts["Tunai"] = (paymentCounts["Tunai"] || 0) + 1;
      } else if (pm.includes("virtual") || pm.includes("va")) {
        paymentCounts["Virtual Account"] =
          (paymentCounts["Virtual Account"] || 0) + 1;
      } else {
        paymentCounts["Debit / Transfer"] =
          (paymentCounts["Debit / Transfer"] || 0) + 1;
      }

      // Tenant stats
      if (!tenantStats[ord.tenantId]) {
        tenantStats[ord.tenantId] = {
          revenue: 0,
          transactions: 0,
          visitors: 0,
        };
      }
      tenantStats[ord.tenantId].revenue += ord.total;
      tenantStats[ord.tenantId].transactions += 1;
      tenantStats[ord.tenantId].visitors += 1;

      // Category
      const tenant = tenantMap.get(ord.tenantId);
      const cat = ord.tenantCategory || tenant?.category || "Makanan";
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + ord.total;
    } else if (prevDateSet.has(dt.dateStr)) {
      previousRevenue += ord.total;
      previousTransactions += 1;
    }
  }

  // Fallback to tenant monthlyRevenue if no orders array passed or empty
  if (
    completedTransactions === 0 &&
    activeTenants.some((t) => (t.monthlyRevenue || 0) > 0)
  ) {
    for (const t of activeTenants) {
      const rev = t.monthlyRevenue || 0;
      if (rev > 0) {
        categoryRevenue[t.category] = (categoryRevenue[t.category] || 0) + rev;
        if (tenantStats[t.id]) {
          tenantStats[t.id].revenue = rev;
        }
        completedRevenue += rev;
      }
    }
  }

  const hourly: HourlyAnalyticsPoint[] = STANDARD_HOURS.map((h) => ({
    hour: h,
    transactions: hourlyCounts[h] || 0,
  }));

  let peakHour: string | null = null;
  let maxHourlyTx = 0;
  for (const h of STANDARD_HOURS) {
    const tx = hourlyCounts[h] || 0;
    if (tx > maxHourlyTx) {
      maxHourlyTx = tx;
      peakHour = h;
    }
  }

  let peakDay: string | null = null;
  let maxDailyRev = 0;
  for (const p of daily) {
    if (p.revenue > maxDailyRev) {
      maxDailyRev = p.revenue;
      peakDay = p.fullLabel;
    }
  }

  const totalPayments =
    paymentCounts["QRIS"] +
    paymentCounts["Tunai"] +
    paymentCounts["Virtual Account"] +
    paymentCounts["Debit / Transfer"];

  const payments: PaymentAnalyticsSlice[] = [
    {
      key: "qris",
      label: "QRIS",
      transactions: paymentCounts["QRIS"],
      share:
        totalPayments > 0
          ? Math.round((paymentCounts["QRIS"] / totalPayments) * 100)
          : 0,
      fill: "var(--chart-1)",
    },
    {
      key: "cash",
      label: "Tunai",
      transactions: paymentCounts["Tunai"],
      share:
        totalPayments > 0
          ? Math.round((paymentCounts["Tunai"] / totalPayments) * 100)
          : 0,
      fill: "var(--chart-3)",
    },
    {
      key: "va",
      label: "Virtual Account",
      transactions: paymentCounts["Virtual Account"],
      share:
        totalPayments > 0
          ? Math.round((paymentCounts["Virtual Account"] / totalPayments) * 100)
          : 0,
      fill: "var(--muted-foreground)",
    },
    {
      key: "transfer",
      label: "Debit / Transfer",
      transactions: paymentCounts["Debit / Transfer"],
      share:
        totalPayments > 0
          ? Math.round(
              (paymentCounts["Debit / Transfer"] / totalPayments) * 100,
            )
          : 0,
      fill: "var(--foreground)",
    },
  ];

  const categories: CategoryAnalyticsSlice[] = Object.entries(categoryRevenue)
    .map(([category, rev]) => ({
      category,
      revenue: rev,
      share:
        completedRevenue > 0 ? Math.round((rev / completedRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topTenants: TenantAnalyticsRank[] = [...activeTenants]
    .map((t) => {
      const stats = tenantStats[t.id] || { revenue: 0, transactions: 0 };
      const rev = stats.revenue;
      return {
        id: t.id,
        name: t.name,
        owner: t.owner,
        category: t.category,
        revenue: rev,
        transactions: stats.transactions,
        share:
          completedRevenue > 0
            ? Math.round((rev / completedRevenue) * 100)
            : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const revenueChange =
    previousRevenue > 0
      ? Number(
          (
            ((completedRevenue - previousRevenue) / previousRevenue) *
            100
          ).toFixed(1),
        )
      : null;

  const transactionsChange =
    previousTransactions > 0
      ? Number(
          (
            ((completedTransactions - previousTransactions) /
              previousTransactions) *
            100
          ).toFixed(1),
        )
      : null;

  const totals: AnalyticsTotals = {
    revenue: completedRevenue,
    transactions: completedTransactions,
    visitors: completedVisitors,
    averageTicket:
      completedTransactions > 0
        ? Math.round(completedRevenue / completedTransactions)
        : 0,
    averageVisitors:
      range > 0 ? Number((completedVisitors / range).toFixed(1)) : 0,
    previousRevenue,
    previousTransactions,
    revenueChange,
    transactionsChange,
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
    peakDay,
    peakHour,
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

