"use client";

import { useMemo, useState } from "react";
import {
  ChartNoAxesColumn,
  Package,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { buildSellerAnalytics } from "@/lib/analytics";
import { useSeller } from "@/context/seller-context";
import { cn, formatRupiah } from "@/lib/utils";
import type {
  AnalyticsRange,
  DailyAnalyticsPoint,
  PaymentAnalyticsSlice,
  SellerAnalytics,
} from "@/types/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dailyChartConfig = {
  revenue: { label: "Omzet", color: "var(--chart-1)" },
  transactions: {
    label: "Transaksi",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

const hourlyChartConfig = {
  transactions: { label: "Transaksi", color: "var(--chart-1)" },
} satisfies ChartConfig;

const paymentChartConfig = {
  qris: { label: "QRIS", color: "var(--chart-1)" },
  cash: { label: "Tunai", color: "var(--chart-3)" },
  transfer: { label: "Debit / Transfer", color: "var(--foreground)" },
} satisfies ChartConfig;

const countFormatter = new Intl.NumberFormat("id-ID");
const decimalFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});

function formatCompactRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 1,
  }).format(value);
}

function ChangeHint({
  change,
  periodLabel,
}: {
  change: number | null;
  periodLabel: string;
}) {
  if (change === null) {
    return (
      <p className="text-[11px] text-muted-foreground">Belum ada pembanding</p>
    );
  }

  const positive = change >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <p
      className={cn(
        "flex items-center gap-1 text-[11px] font-medium",
        positive
          ? "text-emerald-700 dark:text-emerald-400"
          : "text-rose-700 dark:text-rose-400",
      )}
    >
      <Icon className="size-3" aria-hidden />
      <span className="sr-only">{positive ? "Naik" : "Turun"} </span>
      {decimalFormatter.format(Math.abs(change))}% {periodLabel}
    </p>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: React.ReactNode;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-3">
      <CardContent className="flex items-start justify-between gap-3 p-0">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-lg font-bold text-foreground tabular-nums">
            {value}
          </p>
          <div className="mt-0.5">{hint}</div>
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}

function StatisticsHeader({
  range,
  onRangeChange,
}: {
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Statistik Toko
          </h1>
        </div>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Omzet, transaksi, dan produk terlaris toko Anda pada periode terpilih.
        </p>
      </div>

      <div
        className="inline-flex w-fit items-center rounded-lg bg-muted p-1"
        role="group"
        aria-label="Rentang statistik"
      >
        {([7, 30] as const).map((option) => (
          <Button
            key={option}
            type="button"
            size="xs"
            variant="ghost"
            aria-pressed={range === option}
            onClick={() => onRangeChange(option)}
            className={cn(
              "h-11 px-4 text-xs sm:h-7 sm:px-3",
              range === option
                ? "bg-background text-foreground shadow-xs"
                : "text-foreground/80 hover:bg-background/60",
            )}
          >
            {option} hari
          </Button>
        ))}
      </div>
    </div>
  );
}

function StatisticsContent({ analytics }: { analytics: SellerAnalytics }) {
  const { totals } = analytics;
  const peakHourTransactions = Math.max(
    ...analytics.hourly.map((point) => point.transactions),
  );
  const periodLabel = `vs ${analytics.days} hari sebelumnya`;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Total Omzet"
          value={formatRupiah(totals.revenue)}
          hint={
            <ChangeHint
              change={totals.revenueChange}
              periodLabel={periodLabel}
            />
          }
          icon={Wallet}
        />
        <MetricCard
          label="Transaksi"
          value={countFormatter.format(totals.transactions)}
          hint={
            <ChangeHint
              change={totals.transactionsChange}
              periodLabel={periodLabel}
            />
          }
          icon={ChartNoAxesColumn}
        />
        <MetricCard
          label="Rata-rata Belanja"
          value={formatRupiah(totals.averageTicket)}
          hint={
            <p className="text-[11px] text-muted-foreground">Per transaksi</p>
          }
          icon={ReceiptText}
        />
        <MetricCard
          label="Item Terjual"
          value={countFormatter.format(analytics.unitsSold)}
          hint={
            <p className="text-[11px] text-muted-foreground">
              {decimalFormatter.format(
                analytics.unitsSold / analytics.days,
              )}{" "}
              item per hari
            </p>
          }
          icon={Package}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Omzet dan Transaksi Harian</CardTitle>
          <CardDescription>
            Puncak omzet {analytics.peakDay}, jam tersibuk {analytics.peakHour}
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">{analytics.days} hari</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={dailyChartConfig}
            className="aspect-auto h-[260px] w-full sm:h-[300px]"
          >
            <ComposedChart
              accessibilityLayer
              data={analytics.daily}
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="revenue"
                tickLine={false}
                axisLine={false}
                width={54}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => formatCompactRupiah(Number(value))}
              />
              <YAxis
                yAxisId="transactions"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={34}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const point = payload?.[0]?.payload as
                        | DailyAnalyticsPoint
                        | undefined;
                      return point?.fullLabel ?? "";
                    }}
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {String(name)}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {String(name) === "Omzet"
                            ? formatRupiah(Number(value))
                            : `${countFormatter.format(Number(value))} transaksi`}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                yAxisId="revenue"
                dataKey="revenue"
                name="Omzet"
                fill="var(--color-revenue)"
                radius={[3, 3, 0, 0]}
                maxBarSize={22}
                isAnimationActive={false}
              />
              <Line
                yAxisId="transactions"
                dataKey="transactions"
                name="Transaksi"
                type="monotone"
                stroke="var(--color-transactions)"
                strokeWidth={1.75}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Jam Ramai Transaksi</CardTitle>
            <CardDescription>
              Sebaran transaksi per jam pada periode terpilih
            </CardDescription>
            <CardAction>
              <Badge variant="outline">Puncak {analytics.peakHour}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={hourlyChartConfig}
              className="aspect-auto h-[220px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={analytics.hourly}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={12}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value) =>
                        `${countFormatter.format(Number(value))} transaksi`
                      }
                    />
                  }
                />
                <Bar
                  dataKey="transactions"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                  isAnimationActive={false}
                >
                  {analytics.hourly.map((point) => (
                    <Cell
                      key={point.hour}
                      fill={
                        point.transactions === peakHourTransactions
                          ? "var(--chart-1)"
                          : "var(--muted-foreground)"
                      }
                      fillOpacity={
                        point.transactions === peakHourTransactions ? 1 : 0.35
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
            <CardDescription>Porsi transaksi per metode bayar</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={paymentChartConfig}
              className="mx-auto aspect-square h-[180px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      nameKey="key"
                      hideLabel
                      formatter={(value, _name, item) => {
                        const slice = item.payload as PaymentAnalyticsSlice;
                        return `${slice.label}: ${countFormatter.format(Number(value))} transaksi`;
                      }}
                    />
                  }
                />
                <Pie
                  data={analytics.payments}
                  dataKey="transactions"
                  nameKey="key"
                  innerRadius={54}
                  strokeWidth={3}
                  isAnimationActive={false}
                >
                  {analytics.payments.map((slice) => (
                    <Cell key={slice.key} fill={slice.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-3 flex flex-col gap-2">
              {analytics.payments.map((slice) => (
                <div
                  key={slice.key}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2 rounded-[2px]"
                      style={{ backgroundColor: slice.fill }}
                    />
                    {slice.label}
                  </span>
                  <span className="font-medium text-foreground tabular-nums">
                    {decimalFormatter.format(slice.share)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
            <CardDescription>
              Peringkat produk berdasarkan omzet pada periode terpilih
            </CardDescription>
            <CardAction>
              <Badge variant="outline">5 teratas</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Produk</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Kategori
                  </TableHead>
                  <TableHead className="hidden text-right md:table-cell">
                    Terjual
                  </TableHead>
                  <TableHead className="text-right">Omzet</TableHead>
                  <TableHead className="hidden pr-4 text-right lg:table-cell">
                    Porsi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground tabular-nums">
                          {index + 1}
                        </span>
                        <span className="truncate text-xs font-semibold text-foreground">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">
                      {countFormatter.format(product.units)} item
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatRupiah(product.revenue)}
                    </TableCell>
                    <TableCell className="hidden pr-4 text-right text-muted-foreground tabular-nums lg:table-cell">
                      {decimalFormatter.format(product.share)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Omzet per Kategori</CardTitle>
            <CardDescription>
              Kontribusi kategori menu pada periode terpilih
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {analytics.categories.map((category) => (
              <div key={category.category} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="font-medium text-foreground">
                    {category.category}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatRupiah(category.revenue)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(category.share, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function SellerStatisticsDashboard({ today }: { today: string }) {
  const { products, orders } = useSeller();
  const [range, setRange] = useState<AnalyticsRange>(30);
  const analytics = useMemo(
    () => buildSellerAnalytics(today, range, products, orders),
    [today, range, products, orders],
  );

  return (
    <div className="flex flex-col gap-4">
      <StatisticsHeader range={range} onRangeChange={setRange} />
      <StatisticsContent analytics={analytics} />
    </div>
  );
}
