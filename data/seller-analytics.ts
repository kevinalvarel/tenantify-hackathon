import type {
  AnalyticsRange,
  CategoryAnalyticsSlice,
  DailyAnalyticsPoint,
  HourlyAnalyticsPoint,
  PaymentAnalyticsSlice,
  ProductAnalyticsRank,
  SellerAnalytics,
} from "@/types/analytics";

const WINDOW_DAYS = 60;
const HALF_WINDOW = WINDOW_DAYS / 2;

type DemoProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  weight: number;
};

const DEMO_PRODUCTS: DemoProduct[] = [
  { id: "prod-nasgor", name: "Nasi Goreng Spesial", category: "Makanan", price: 25_000, weight: 10 },
  { id: "prod-geprek", name: "Ayam Geprek Sambal Bawang", category: "Makanan", price: 28_000, weight: 9 },
  { id: "prod-mie", name: "Mie Goreng Jawa", category: "Makanan", price: 22_000, weight: 7 },
  { id: "prod-sate", name: "Sate Ayam Madura", category: "Makanan", price: 30_000, weight: 6 },
  { id: "prod-kopi", name: "Es Kopi Susu Aren", category: "Minuman", price: 20_000, weight: 12 },
  { id: "prod-matcha", name: "Matcha Latte", category: "Minuman", price: 24_000, weight: 6 },
  { id: "prod-teh", name: "Es Teh Manis", category: "Minuman", price: 8_000, weight: 10 },
  { id: "prod-pisang", name: "Pisang Goreng Keju", category: "Camilan", price: 18_000, weight: 5 },
  { id: "prod-tahu", name: "Tahu Crispy", category: "Camilan", price: 15_000, weight: 5 },
  { id: "prod-hemat-nasi", name: "Paket Hemat Nasi + Es Teh", category: "Paket Hemat", price: 32_000, weight: 8 },
  { id: "prod-hemat-geprek", name: "Paket Hemat Geprek + Es Kopi", category: "Paket Hemat", price: 42_000, weight: 4 },
];

const HOUR_WEIGHTS = [
  { hour: "10.00", weight: 0.03 },
  { hour: "11.00", weight: 0.07 },
  { hour: "12.00", weight: 0.14 },
  { hour: "13.00", weight: 0.13 },
  { hour: "14.00", weight: 0.07 },
  { hour: "15.00", weight: 0.05 },
  { hour: "16.00", weight: 0.04 },
  { hour: "17.00", weight: 0.06 },
  { hour: "18.00", weight: 0.12 },
  { hour: "19.00", weight: 0.16 },
  { hour: "20.00", weight: 0.10 },
  { hour: "21.00", weight: 0.03 },
];

const PAYMENT_METHODS = [
  { key: "qris", label: "QRIS", weight: 0.52, fill: "var(--chart-1)" },
  { key: "cash", label: "Tunai", weight: 0.28, fill: "var(--chart-3)" },
  {
    key: "transfer",
    label: "Debit / Transfer",
    weight: 0.20,
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

type DaySeries = {
  date: Date;
  revenue: number;
  transactions: number;
  units: number[];
};

function buildDaySeries(dates: Date[]): DaySeries[] {
  return dates.map((date, index) => {
    const seed = dateKey(date);
    const growth = index >= HALF_WINDOW ? 1.08 : 0.94;
    const targetRevenue =
      1_450_000 *
      growth *
      trafficWeight(date) *
      (0.82 + seededUnit(`revenue-${seed}`) * 0.36);
    const averageTicket = 22_000 + seededUnit(`ticket-${seed}`) * 8_000;
    const transactions = Math.max(1, Math.round(targetRevenue / averageTicket));
    const totalUnits = Math.max(
      transactions,
      Math.round(transactions * (1.5 + seededUnit(`units-${seed}`) * 0.5)),
    );
    const units = allocate(
      totalUnits,
      DEMO_PRODUCTS.map(
        (product) =>
          product.weight *
          (0.72 + seededUnit(`product-${product.id}-${seed}`) * 0.56),
      ),
    );
    const revenue = units.reduce(
      (total, quantity, productIndex) =>
        total + quantity * DEMO_PRODUCTS[productIndex].price,
      0,
    );

    return { date, revenue, transactions, units };
  });
}

export function buildSellerAnalytics(
  todayKey: string,
  range: AnalyticsRange,
): SellerAnalytics {
  const parsedToday = new Date(`${todayKey}T00:00:00`);
  const today = startOfDay(
    Number.isNaN(parsedToday.getTime()) ? new Date() : parsedToday,
  );
  const dates = Array.from({ length: WINDOW_DAYS }, (_, index) =>
    addDays(today, index - (WINDOW_DAYS - 1)),
  );

  const series = buildDaySeries(dates);
  const currentStart = WINDOW_DAYS - range;
  const previousStart = currentStart - range;
  const current = series.slice(currentStart);
  const previous = series.slice(previousStart, currentStart);

  const revenue = sum(current.map((day) => day.revenue));
  const transactions = sum(current.map((day) => day.transactions));
  const unitsSold = sum(
    current.map((day) => day.units.reduce((total, unit) => total + unit, 0)),
  );
  const previousRevenue = sum(previous.map((day) => day.revenue));
  const previousTransactions = sum(
    previous.map((day) => day.transactions),
  );

  const daily: DailyAnalyticsPoint[] = current.map((day) => ({
    date: dateKey(day.date),
    label: dayLabel.format(day.date),
    fullLabel: fullDayLabel.format(day.date),
    revenue: day.revenue,
    transactions: day.transactions,
    visitors: day.transactions,
  }));

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

  const productUnits = DEMO_PRODUCTS.map((_, productIndex) =>
    sum(current.map((day) => day.units[productIndex])),
  );
  const productRevenue = DEMO_PRODUCTS.map(
    (product, index) => productUnits[index] * product.price,
  );

  const topProducts: ProductAnalyticsRank[] = DEMO_PRODUCTS.map(
    (product, index) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      units: productUnits[index],
      revenue: productRevenue[index],
      share: revenue > 0 ? (productRevenue[index] / revenue) * 100 : 0,
    }),
  )
    .filter((product) => product.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const categoryTotals = new Map<string, number>();
  DEMO_PRODUCTS.forEach((product, index) => {
    categoryTotals.set(
      product.category,
      (categoryTotals.get(product.category) ?? 0) + productRevenue[index],
    );
  });

  const categories: CategoryAnalyticsSlice[] = [...categoryTotals]
    .map(([category, categoryRevenue]) => ({
      category,
      revenue: categoryRevenue,
      share: revenue > 0 ? (categoryRevenue / revenue) * 100 : 0,
    }))
    .filter((entry) => entry.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const peakDayPoint = daily.reduce<DailyAnalyticsPoint | null>(
    (best, point) =>
      best === null || point.revenue > best.revenue ? point : best,
    null,
  );
  const peakHourPoint = hourly.reduce<HourlyAnalyticsPoint | null>(
    (best, point) =>
      best === null || point.transactions > best.transactions ? point : best,
    null,
  );

  return {
    days: range,
    daily,
    hourly,
    payments,
    categories,
    topProducts,
    unitsSold,
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
