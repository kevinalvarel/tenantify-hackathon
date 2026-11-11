export type AnalyticsRange = 7 | 30;

export type DailyAnalyticsPoint = {
  date: string;
  label: string;
  fullLabel: string;
  revenue: number;
  transactions: number;
  visitors: number;
};

export type HourlyAnalyticsPoint = {
  hour: string;
  transactions: number;
};

export type PaymentAnalyticsSlice = {
  key: string;
  label: string;
  transactions: number;
  share: number;
  fill: string;
};

export type CategoryAnalyticsSlice = {
  category: string;
  revenue: number;
  share: number;
};

export type TenantAnalyticsRank = {
  id: string;
  name: string;
  owner: string;
  category: string;
  revenue: number;
  transactions: number;
  share: number;
};

export type AnalyticsTotals = {
  revenue: number;
  transactions: number;
  visitors: number;
  averageTicket: number;
  averageVisitors: number;
  previousRevenue: number;
  previousTransactions: number;
  revenueChange: number | null;
  transactionsChange: number | null;
};

export type ProductAnalyticsRank = {
  id: string;
  name: string;
  category: string;
  units: number;
  revenue: number;
  share: number;
};

export type SellerAnalytics = {
  days: number;
  daily: DailyAnalyticsPoint[];
  hourly: HourlyAnalyticsPoint[];
  payments: PaymentAnalyticsSlice[];
  categories: CategoryAnalyticsSlice[];
  topProducts: ProductAnalyticsRank[];
  totals: AnalyticsTotals;
  unitsSold: number;
  peakDay: string | null;
  peakHour: string | null;
};

export type AssociationAnalytics = {
  days: number;
  activeTenants: number;
  daily: DailyAnalyticsPoint[];
  hourly: HourlyAnalyticsPoint[];
  payments: PaymentAnalyticsSlice[];
  categories: CategoryAnalyticsSlice[];
  topTenants: TenantAnalyticsRank[];
  totals: AnalyticsTotals;
  peakDay: string | null;
  peakHour: string | null;
};
