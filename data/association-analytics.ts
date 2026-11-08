import type { AssociationTenant } from "@/types/association";
import type {
  AnalyticsRange,
  AssociationAnalytics,
  CategoryAnalyticsSlice,
  DailyAnalyticsPoint,
  HourlyAnalyticsPoint,
  PaymentAnalyticsSlice,
  TenantAnalyticsRank,
} from "@/types/analytics";

const WINDOW_DAYS = 60;
const HALF_WINDOW = WINDOW_DAYS / 2;

const TICKET_BY_CATEGORY: Record<string, number> = {
  Makanan: 38_000,
  Minuman: 24_000,
  "Kopi & Pastry": 32_000,
  Fashion: 125_000,
  Kerajinan: 90_000,
};

const DEFAULT_TICKET = 40_000;

const HOUR_WEIGHTS = [
  { hour: "10.00", weight: 0.04 },
  { hour: "11.00", weight: 0.06 },
  { hour: "12.00", weight: 0.13 },
  { hour: "13.00", weight: 0.15 },
  { hour: "14.00", weight: 0.09 },
  { hour: "15.00", weight: 0.06 },
  { hour: "16.00", weight: 0.05 },
  { hour: "17.00", weight: 0.06 },
  { hour: "18.00", weight: 0.11 },
  { hour: "19.00", weight: 0.14 },
  { hour: "20.00", weight: 0.08 },
  { hour: "21.00", weight: 0.03 },
];

const PAYMENT_METHODS = [
  { key: "qris", label: "QRIS", weight: 0.48, fill: "var(--chart-1)" },
  { key: "cash", label: "Tunai", weight: 0.22, fill: "var(--chart-3)" },
  {
    key: "va",
    label: "Virtual Account",
    weight: 0.16,
    fill: "var(--muted-foreground)",
  },
  {
    key: "transfer",
    label: "Debit / Transfer",
    weight: 0.14,
    fill: "var(--foreground)",
  },
];

const dayLabel = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
});

const fullDayLabel = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// FNV-1a keeps every demo day reproducible between renders.
function seededUnit(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function allocate(total: number, weights: number[]): number[] {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0 || weightSum <= 0) {
    return weights.map(() => 0);
  }

  const shares = weights.map((weight) => (total * weight) / weightSum);
  const values = shares.map((share) => Math.floor(share));
  let remainder = total - values.reduce((sum, value) => sum + value, 0);
  const order = shares
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction);

  let cursor = 0;
  while (remainder > 0) {
    values[order[cursor % order.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }

  return values;
}

function trafficWeight(date: Date): number {
  const weekday = date.getDay();
  if (weekday === 0 || weekday === 6) return 1.3;
  if (weekday === 5) return 1.12;
  return 0.9;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function change(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

export function buildAssociationAnalytics(
  tenants: AssociationTenant[],
  range: AnalyticsRange,
  todayKey: string,
): AssociationAnalytics {
  const parsedToday = new Date(`${todayKey}T00:00:00`);
  const today = startOfDay(
    Number.isNaN(parsedToday.getTime()) ? new Date() : parsedToday,
  );
  const dates = Array.from({ length: WINDOW_DAYS }, (_, index) =>
    addDays(today, index - (WINDOW_DAYS - 1)),
  );

  const revenueByDay = new Array<number>(WINDOW_DAYS).fill(0);
  const transactionsByDay = new Array<number>(WINDOW_DAYS).fill(0);
  const tenantSeries = new Map<
    string,
    { revenue: number[]; transactions: number[] }
  >();

  const activeTenants = tenants.filter((tenant) => tenant.monthlyRevenue > 0);

  for (const tenant of activeTenants) {
    const ticket = TICKET_BY_CATEGORY[tenant.category] ?? DEFAULT_TICKET;
    const currentWeights = dates.map((date, index) =>
      index >= HALF_WINDOW
        ? trafficWeight(date) *
          (0.72 + seededUnit(`${tenant.id}-${dateKey(date)}`) * 0.56)
        : 0,
    );
    const previousWeights = dates.map((date, index) =>
      index < HALF_WINDOW
        ? trafficWeight(date) *
          (0.72 + seededUnit(`${tenant.id}-previous-${dateKey(date)}`) * 0.56)
        : 0,
    );

    const currentRevenue = allocate(tenant.monthlyRevenue, currentWeights);
    const trend = 0.82 + seededUnit(`${tenant.id}-trend`) * 0.24;
    const previousRevenue = allocate(
      Math.round(tenant.monthlyRevenue * trend),
      previousWeights,
    );
    const currentTransactions = currentRevenue.map((value) =>
      Math.round(value / ticket),
    );
    const previousTransactions = previousRevenue.map((value) =>
      Math.round(value / ticket),
    );

    tenantSeries.set(tenant.id, {
      revenue: currentRevenue,
      transactions: currentTransactions,
    });

    for (let index = 0; index < WINDOW_DAYS; index += 1) {
      revenueByDay[index] += currentRevenue[index] + previousRevenue[index];
      transactionsByDay[index] +=
        currentTransactions[index] + previousTransactions[index];
    }
  }

  const currentStart = WINDOW_DAYS - range;
  const previousStart = currentStart - range;

  const daily: DailyAnalyticsPoint[] = dates
    .slice(currentStart)
    .map((date, offset) => {
      const index = currentStart + offset;
      return {
        date: dateKey(date),
        label: dayLabel.format(date),
        fullLabel: fullDayLabel.format(date),
        revenue: revenueByDay[index],
        transactions: transactionsByDay[index],
        visitors: transactionsByDay[index],
      };
    });

  const revenue = sum(daily.map((point) => point.revenue));
  const transactions = sum(daily.map((point) => point.transactions));
  const previousRevenue = sum(
    revenueByDay.slice(previousStart, currentStart),
  );
  const previousTransactions = sum(
    transactionsByDay.slice(previousStart, currentStart),
  );

  const hourlyValues = allocate(
    transactions,
    HOUR_WEIGHTS.map((entry) => entry.weight),
  );
  const hourly: HourlyAnalyticsPoint[] = HOUR_WEIGHTS.map((entry, index) => ({
    hour: entry.hour,
    transactions: hourlyValues[index],
  }));

  const paymentValues = allocate(
    transactions,
    PAYMENT_METHODS.map((method) => method.weight),
  );
  const payments: PaymentAnalyticsSlice[] = PAYMENT_METHODS.map(
    (method, index) => ({
      key: method.key,
      label: method.label,
      transactions: paymentValues[index],
      share: transactions > 0 ? (paymentValues[index] / transactions) * 100 : 0,
      fill: method.fill,
    }),
  );

  const categories: CategoryAnalyticsSlice[] = [...activeTenants]
    .reduce<CategoryAnalyticsSlice[]>((list, tenant) => {
      const series = tenantSeries.get(tenant.id);
      if (!series) return list;

      const tenantRevenue = sum(series.revenue.slice(currentStart));
      if (tenantRevenue <= 0) return list;

      const existing = list.find(
        (entry) => entry.category === tenant.category,
      );
      if (existing) {
        existing.revenue += tenantRevenue;
      } else {
        list.push({ category: tenant.category, revenue: tenantRevenue, share: 0 });
      }
      return list;
    }, [])
    .map((entry) => ({
      ...entry,
      share: revenue > 0 ? (entry.revenue / revenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topTenants: TenantAnalyticsRank[] = activeTenants
    .map((tenant) => {
      const series = tenantSeries.get(tenant.id);
      const tenantRevenue = series ? sum(series.revenue.slice(currentStart)) : 0;
      const tenantTransactions = series
        ? sum(series.transactions.slice(currentStart))
        : 0;

      return {
        id: tenant.id,
        name: tenant.name,
        owner: tenant.owner,
        category: tenant.category,
        revenue: tenantRevenue,
        transactions: tenantTransactions,
        share: revenue > 0 ? (tenantRevenue / revenue) * 100 : 0,
      };
    })
    .filter((tenant) => tenant.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const peakDayPoint = daily.reduce<DailyAnalyticsPoint | null>(
    (best, point) => (best === null || point.revenue > best.revenue ? point : best),
    null,
  );
  const peakHourPoint = hourly.reduce<HourlyAnalyticsPoint | null>(
    (best, point) =>
      best === null || point.transactions > best.transactions ? point : best,
    null,
  );

  return {
    days: range,
    activeTenants: activeTenants.length,
    daily,
    hourly,
    payments,
    categories,
    topTenants,
    totals: {
      revenue,
      transactions,
      visitors: transactions,
      averageTicket: transactions > 0 ? revenue / transactions : 0,
      averageVisitors: range > 0 ? transactions / range : 0,
      previousRevenue,
      previousTransactions,
      revenueChange: change(revenue, previousRevenue),
      transactionsChange: change(transactions, previousTransactions),
    },
    peakDay: peakDayPoint?.fullLabel ?? null,
    peakHour: peakHourPoint?.hour ?? null,
  };
}
