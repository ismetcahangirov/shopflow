'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShoppingBag, TrendingUp, DollarSign, Package, ArrowRight, AlertTriangle } from 'lucide-react';

import { useMyVendor, useVendorDashboard } from '@/hooks/useVendor';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartCard } from '@/components/admin/ChartCard';
import { TimeSeriesChart } from '@/components/admin/charts/TimeSeriesChart';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatAxisDate, formatCurrency, formatNumber } from '@/lib/format';
import { parseApiError } from '@/lib/api';

const PERIODS = [7, 30, 90] as const;
type Period = (typeof PERIODS)[number];

const compactCurrency = (v: number): string => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v));

export default function VendorPage(): React.JSX.Element {
  const t = useTranslations('vendor');
  const [period, setPeriod] = useState<Period>(30);

  const { data: vendor } = useMyVendor();
  const isApproved = vendor ? vendor.status === 'APPROVED' : true;
  const { data, isLoading, isError, error, refetch } = useVendorDashboard(period);

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
      <PageHeader
        title={vendor?.storeName || t('dashboard')}
        description={t('dashboard_desc')}
        actions={isApproved ? periodSelector : undefined}
      />

      {/* Approval banner — vendor can browse but has no scoped data until approved */}
      {vendor && !isApproved && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/40 dark:bg-amber-900/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-800 dark:text-amber-300">{t('approval_required')}</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">{t('approval_required_desc')}</p>
            <Link href="/vendor/settings" className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-amber-800 underline dark:text-amber-300">
              {t('manage_store')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {isApproved && (isError && !data ? (
        <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading || !data
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
              : [
                  { title: t('total_products'), value: formatNumber(data.summary.totalProducts), icon: <Package className="h-5 w-5" />, colorTheme: 'emerald' as const },
                  { title: t('total_orders'), value: formatNumber(data.summary.totalOrders), icon: <ShoppingBag className="h-5 w-5" />, colorTheme: 'indigo' as const },
                  { title: t('revenue'), value: formatCurrency(data.summary.totalRevenue), icon: <DollarSign className="h-5 w-5" />, colorTheme: 'sky' as const },
                  { title: t('avg_rating'), value: data.summary.avgRating.toFixed(1), icon: <TrendingUp className="h-5 w-5" />, colorTheme: 'amber' as const },
                ].map((s) => (
                  <StatCard key={s.title} title={s.title} value={s.value} icon={s.icon} colorTheme={s.colorTheme} />
                ))}
          </div>

          {/* Pending-orders alert */}
          {data && data.summary.pendingOrders > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
              {t('pending_orders_warning', { count: data.summary.pendingOrders })}
            </div>
          )}

          {/* Revenue trend */}
          <ChartCard
            title={t('revenue_trend')}
            description={t('revenue_trend_desc')}
            isLoading={isLoading || !data}
            isEmpty={!!data && data.revenueChart.length === 0}
            emptyText={t('no_data')}
          >
            {data && (
              <TimeSeriesChart
                data={data.revenueChart}
                xKey="date"
                yKey="revenue"
                variant="area"
                seriesName={t('revenue')}
                xTickFormatter={(v) => formatAxisDate(v, 'day')}
                valueFormatter={(v) => formatCurrency(v)}
                yTickFormatter={compactCurrency}
              />
            )}
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('recent_orders')}</CardTitle>
                <Link href="/vendor/orders" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  {t('view_all')} <ArrowRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading || !data ? (
                  <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
                ) : data.recentOrders.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">{t('no_recent_orders')}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.recentOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs text-muted-foreground">{o.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('az-AZ')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">{formatCurrency(o.vendorSubtotal)}</span>
                          <OrderStatusBadge status={o.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low stock */}
            <Card>
              <CardHeader>
                <CardTitle>{t('low_stock')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !data ? (
                  <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
                ) : data.lowStockProducts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">{t('no_low_stock')}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.lowStockProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                        <span className="min-w-0 truncate text-sm font-medium text-foreground">{p.name}</span>
                        <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                          {t('stock_left', { count: p.stock })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top products */}
          <Card>
            <CardHeader>
              <CardTitle>{t('top_products')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
              ) : data.topProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t('no_top_products')}</p>
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
                          <td className="px-3 py-2 text-muted-foreground">{formatNumber(p.salesCount)}</td>
                          <td className="px-3 py-2 text-right font-semibold text-foreground">{formatCurrency(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ))}
    </div>
  );
}
