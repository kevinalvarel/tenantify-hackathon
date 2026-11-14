"use client";

import { useMemo } from "react";
import { Package, Star, Store, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { useAssociation } from "@/context/association-context";
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { AssociationHeader } from "@/components/association/association-header";
import type { HighestMerchantTurnoverResult } from "@/servers/association-server";

const CATEGORY_ORDER = [
  "Makanan",
  "Minuman",
  "Kopi & Pastry",
  "Fashion",
  "Kerajinan",
];

const revenueChartConfig = {
  revenue: { label: "Omzet", color: "var(--chart-1)" },
} satisfies ChartConfig;

const statusChartConfig = {
  Aktif: { label: "Aktif", color: "var(--chart-1)" },
  Nonaktif: { label: "Nonaktif", color: "var(--chart-3)" },
} satisfies ChartConfig;

const formatCompactRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    notation: "compact",
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 1,
  }).format(value);

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
};

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName,
}: MetricCardProps) {
  return (
    <Card className="p-3">
      <CardContent className="flex items-center justify-between p-0">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-lg font-bold text-foreground">
            {value}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AssociationDashboard({
  initialHighestMerchant,
}: {
  initialHighestMerchant?: HighestMerchantTurnoverResult | null;
} = {}) {
  const {
    tenants,
    booths,
    totalTenants,
    activeTenants,
    inactiveTenants,
    totalRevenue,
    totalBooths,
    occupancyRate,
    setSelectedTenant,
    occupiedBooths,
  } = useAssociation();

  const activeTenantList = useMemo(
    () => tenants.filter((tenant) => tenant.status === "active"),
    [tenants],
  );

  const averageRevenue = activeTenants > 0 ? totalRevenue / activeTenants : 0;
  const averageRating =
    activeTenantList.length > 0
      ? activeTenantList.reduce((sum, tenant) => sum + tenant.rating, 0) /
        activeTenantList.length
      : 0;
  const totalProducts = tenants.reduce(
    (sum, tenant) => sum + tenant.totalProducts,
    0,
  );
  const availableBooths = booths.filter(
    (booth) => booth.status === "available",
  ).length;

  const revenueByCategory = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        revenue: activeTenantList.reduce(
          (sum, tenant) =>
            tenant.category === category ? sum + tenant.monthlyRevenue : sum,
          0,
        ),
      })),
    [activeTenantList],
  );

  const statusData = useMemo(
    () =>
      [
        { status: "Aktif", count: activeTenants, fill: "var(--color-Aktif)" },
        {
          status: "Nonaktif",
          count: inactiveTenants,
          fill: "var(--color-Nonaktif)",
        },
      ].filter((entry) => entry.count > 0),
    [activeTenants, inactiveTenants],
  );

  const topTenants = useMemo(() => {
    if (activeTenantList.length > 0) {
      return [...activeTenantList]
        .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
        .slice(0, 5);
    }
    if (
      initialHighestMerchant?.topTenants &&
      initialHighestMerchant.topTenants.length > 0
    ) {
      return initialHighestMerchant.topTenants.map((t) => ({
        id: t.id,
        name: t.name,
        owner: t.owner,
        email: "",
        phone: "",
        category: t.category,
        zone: t.zone,
        boothNumber: t.boothNumber,
        status: "active" as const,
        joinedAt: "",
        monthlyRevenue: t.monthlyRevenue,
        rating: t.rating,
        totalProducts: 0,
        avatar: t.avatar,
      }));
    }
    return [];
  }, [activeTenantList, initialHighestMerchant]);

  const highestTenant = topTenants[0] || null;

  const inactiveList = useMemo(
    () => tenants.filter((tenant) => tenant.status === "inactive").slice(0, 4),
    [tenants],
  );

  return (
    <div className="flex flex-col gap-4">
      <AssociationHeader
        totalTenants={totalTenants}
        activeTenants={activeTenants}
        inactiveTenants={inactiveTenants}
        totalRevenue={totalRevenue}
        occupancyRate={occupancyRate}
        totalBooths={totalBooths}
        occupiedBooths={occupiedBooths}
      />
      <div>
        <h2 className="text-base font-bold text-foreground">
          Ringkasan Kinerja Area
        </h2>
        <p className="text-xs text-muted-foreground">
          Pantau omzet tenant, komposisi status, dan tenant yang perlu
          ditindaklanjuti.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Rata-rata Omzet / Tenant"
          value={formatRupiah(averageRevenue)}
          hint={`Dari ${activeTenants} tenant aktif`}
          icon={Wallet}
          iconClassName="bg-primary/10 text-primary"
        />
        <MetricCard
          label="Rating Rata-rata"
          value={`${averageRating.toFixed(1)} / 5`}
          hint={`Dari ${activeTenantList.length} tenant aktif`}
          icon={Star}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          label="Total Produk Terdaftar"
          value={totalProducts.toLocaleString("id-ID")}
          hint={`Dari ${totalTenants} tenant`}
          icon={Package}
          iconClassName="bg-secondary text-secondary-foreground"
        />
        <MetricCard
          label="Booth Tersedia"
          value={`${availableBooths} booth`}
          hint={`Dari ${totalBooths} booth • ${occupancyRate}% terisi`}
          icon={Store}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Omzet per Kategori</CardTitle>
            <CardDescription>
              Kontribusi tenant aktif pada bulan ini
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">{activeTenants} tenant aktif</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={revenueChartConfig}
              className="aspect-auto h-[260px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={revenueByCategory}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(value) => formatCompactRupiah(Number(value))}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatRupiah(Number(value))}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={64}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status Tenant</CardTitle>
            <CardDescription>
              Distribusi {totalTenants} tenant terdaftar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={statusChartConfig}
              className="mx-auto aspect-square h-[200px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="status" hideLabel />}
                />
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={58}
                  strokeWidth={4}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              {statusData.map((entry) => {
                const config =
                  statusChartConfig[
                    entry.status as keyof typeof statusChartConfig
                  ];

                return (
                  <div
                    key={entry.status}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span
                      className="size-2 rounded-[2px]"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-muted-foreground">
                      {config.label}
                    </span>
                    <span className="font-semibold text-foreground">
                      {entry.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Tenant Omzet Tertinggi</CardTitle>
              <CardDescription>Peringkat omzet bulan ini</CardDescription>
            </div>
            <CardAction>
              {highestTenant && highestTenant.monthlyRevenue > 0 ? (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                >
                  Tertinggi: {formatRupiah(highestTenant.monthlyRevenue)}
                </Badge>
              ) : (
                <Badge variant="outline">Top 5</Badge>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Tenant</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="pr-4 text-right">Omzet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTenants.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      Belum ada tenant aktif yang terdaftar.
                    </TableCell>
                  </TableRow>
                ) : (
                  topTenants.map((tenant, index) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground tabular-nums">
                            {index + 1}
                          </span>
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {tenant.avatar}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground truncate">
                                {tenant.name}
                              </span>
                              {index === 0 && tenant.monthlyRevenue > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] py-0 px-1.5 text-emerald-700 dark:text-emerald-400 font-medium"
                                >
                                  Tertinggi
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {tenant.owner}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tenant.category}</Badge>
                      </TableCell>
                      <TableCell className="pr-4 text-right font-semibold tabular-nums">
                        {formatRupiah(tenant.monthlyRevenue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tenant Nonaktif</CardTitle>
            <CardDescription>
              Tenant yang sedang tidak beroperasi dan perlu ditinjau
            </CardDescription>
            <CardAction>
              <Badge variant={inactiveTenants > 0 ? "default" : "secondary"}>
                {inactiveTenants} tenant
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {inactiveList.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Semua tenant sedang aktif beroperasi.
              </p>
            ) : (
              inactiveList.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">
                      {tenant.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {tenant.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {tenant.category} • {tenant.zone} • {tenant.joinedAt}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => setSelectedTenant(tenant)}
                  >
                    Tinjau
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
