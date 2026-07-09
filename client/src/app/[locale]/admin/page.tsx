// src/app/[locale]/admin/page.tsx
// Admin dashboard: shadcn Cards + recharts revenue trend / orders-by-status
// donut, top products and recent orders, with a 7/30/90-day period selector.
'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useDashboard } from '@/hooks/useAnalytics';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartCard } from '@/components/admin/ChartCard';
import { TimeSeriesChart } from '@/components/admin/charts/TimeSeriesChart';
import { StatusDonut } from '@/components/admin/charts/StatusDonut';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatAxisDate, formatCurrency, formatNumber } from '@/lib/format';
import { parseApiError } from '@/lib/api';

/** Solid hex colours for the orders-by-status donut (recharts needs a colour). */
const STATUS_HEX: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#a855f7',
  SHIPPED: '#6366f1',
  DELIVERED: '#22c55e',
  CANCELLED: '#ef4444',
  REFUNDED: '#64748b',
};

const PERIODS = [7, 30, 90] as const;
type Period = (typeof PERIODS)[number];

const compactCurrency = (v: number): string =>
  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);

export default function AdminPage(): React.JSX.Element {
  const t = useTranslations('admin_dashboard');
  const tStatus = useTranslations('orders');
  const [period, setPeriod] = useState<Period>(30);

  const { data, isLoading, isError, error, refetch } = useDashboard(period);

  const statusData = useMemo(
    () =>
      data
        ? Object.entries(data.ordersByStatus)
            .filter(([, count]) => count > 0)
            .map(([name, value]) => ({
              name,
              label: tStatus(`status_${name.toLowerCase()}`),
              value,
              color: STATUS_HEX[name] ?? '#64748b',
            }))
        : [],
    [data, tStatus],
  );

  const periodSelector = (
    <Tabs value={String(period)} onValueChange={(v) => setPeriod(Number(v) as Period)}>
      <TabsList>
        {PERIODS.map((p) => (
          <TabsTrigger key={p} value={String(p)}>
            {t(`period_${p}d`)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} actions={periodSelector} />

      {isError && !data ? (
        <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isLoading || !data
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))
              : [
                  {
                    title: t('stat_revenue'),
                    value: formatCurrency(data.summary.totalRevenue),
                    icon: <DollarSign className="h-5 w-5" />,
                    colorTheme: 'emerald' as const,
                  },
                  {
                    title: t('stat_orders'),
                    value: formatNumber(data.summary.totalOrders),
                    icon: <ShoppingBag className="h-5 w-5" />,
                    colorTheme: 'indigo' as const,
                  },
                  {
                    title: t('stat_customers'),
                    value: formatNumber(data.summary.totalCustomers),
                    icon: <Users className="h-5 w-5" />,
                    colorTheme: 'sky' as const,
                  },
                  {
                    title: t('stat_products'),
                    value: formatNumber(data.summary.totalProducts),
                    icon: <Package className="h-5 w-5" />,
                    colorTheme: 'amber' as const,
                  },
                  {
                    title: t('stat_avg_order'),
                    value: formatCurrency(data.summary.avgOrderValue),
                    icon: <TrendingUp className="h-5 w-5" />,
                    colorTheme: 'rose' as const,
                  },
                ].map((s) => (
                  <StatCard
                    key={s.title}
                    title={s.title}
                    value={s.value}
                    icon={s.icon}
                    colorTheme={s.colorTheme}
                  />
                ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartCard
              title={t('revenue_trend')}
              description={t('revenue_trend_desc')}
              isLoading={isLoading || !data}
              isEmpty={!!data && data.revenueChart.length === 0}
              emptyText={t('no_data')}
              className="lg:col-span-2"
            >
              {data && (
                <TimeSeriesChart
                  data={data.revenueChart}
                  xKey="date"
                  yKey="revenue"
                  variant="area"
                  seriesName={t('stat_revenue')}
                  xTickFormatter={(v) => formatAxisDate(v, 'day')}
                  valueFormatter={(v) => formatCurrency(v)}
                  yTickFormatter={compactCurrency}
                />
              )}
            </ChartCard>

            <ChartCard
              title={t('orders_by_status')}
              description={t('orders_by_status_desc')}
              isLoading={isLoading || !data}
              isEmpty={statusData.length === 0}
              emptyText={t('no_data')}
            >
              <StatusDonut data={statusData} valueFormatter={(v) => formatNumber(v)} />
            </ChartCard>
          </div>

          {/* Top products */}
          <Card>
            <CardHeader>
              <CardTitle>{t('top_products')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              ) : data.topProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t('no_data')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="px-3 py-2">{t('col_product')}</th>
                        <th className="px-3 py-2">{t('col_sales')}</th>
                        <th className="px-3 py-2 text-right">{t('col_revenue')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-medium text-foreground">{p.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {formatNumber(p.salesCount)}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-foreground">
                            {formatCurrency(p.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('recent_orders')}</CardTitle>
              <Link
                href="/admin/orders"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {t('view_all')} <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              ) : data.recentOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t('no_data')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="px-3 py-2">{t('col_order')}</th>
                        <th className="px-3 py-2">{t('col_customer')}</th>
                        <th className="px-3 py-2 text-right">{t('col_amount')}</th>
                        <th className="px-3 py-2 text-right">{t('col_status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentOrders.map((o) => (
                        <tr key={o.id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                            {o.orderNumber}
                          </td>
                          <td className="px-3 py-2 text-foreground">{o.user.name}</td>
                          <td className="px-3 py-2 text-right font-semibold text-foreground">
                            {formatCurrency(o.total)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <OrderStatusBadge status={o.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
