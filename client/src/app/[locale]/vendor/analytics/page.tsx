'use client';

import React, { useMemo, useState } from 'react';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useVendorSales } from '@/hooks/useVendor';
import { type SalesGroupBy } from '@/hooks/useAnalytics';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartCard } from '@/components/admin/ChartCard';
import { TimeSeriesChart } from '@/components/admin/charts/TimeSeriesChart';
import { formatAxisDate, formatCurrency, formatNumber } from '@/lib/format';
import { parseApiError } from '@/lib/api';

/** `YYYY-MM-DD` for `days` ago (0 = today), used to seed the date range. */
function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const compactCurrency = (v: number): string => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v));

export default function VendorAnalyticsPage(): React.JSX.Element {
  const t = useTranslations('vendor');

  const [startDate, setStartDate] = useState<string>(() => isoDaysAgo(30));
  const [endDate, setEndDate] = useState<string>(() => isoDaysAgo(0));
  const [groupBy, setGroupBy] = useState<SalesGroupBy>('day');

  const { data, isLoading, isError, error, refetch } = useVendorSales({ startDate, endDate, groupBy });

  const summary = useMemo(() => {
    const points = data ?? [];
    const totalRevenue = points.reduce((sum, p) => sum + p.revenue, 0);
    const totalOrders = points.reduce((sum, p) => sum + p.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, avgOrderValue };
  }, [data]);

  const isEmpty = !!data && data.length === 0;

  const controls = (
    <Card className="gap-0">
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="vaStart">{t('start_date')}</Label>
          <Input id="vaStart" type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="vaEnd">{t('end_date')}</Label>
          <Input id="vaEnd" type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl" />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="vaGran">{t('granularity')}</Label>
          <Select
            value={groupBy}
            onValueChange={(v) => setGroupBy(v as SalesGroupBy)}
            items={{ day: t('gran_day'), month: t('gran_month'), year: t('gran_year') }}
          >
            <SelectTrigger id="vaGran" className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t('gran_day')}</SelectItem>
              <SelectItem value="month">{t('gran_month')}</SelectItem>
              <SelectItem value="year">{t('gran_year')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t('analytics_title')} description={t('analytics_desc')} />

      {controls}

      {isError ? (
        <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {isLoading || !data ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
            ) : (
              <>
                <StatCard title={t('revenue')} value={formatCurrency(summary.totalRevenue)} icon={<DollarSign className="h-5 w-5" />} colorTheme="emerald" />
                <StatCard title={t('total_orders')} value={formatNumber(summary.totalOrders)} icon={<ShoppingBag className="h-5 w-5" />} colorTheme="indigo" />
                <StatCard title={t('avg_order_value')} value={formatCurrency(summary.avgOrderValue)} icon={<TrendingUp className="h-5 w-5" />} colorTheme="rose" />
              </>
            )}
          </div>

          <ChartCard
            title={t('revenue_over_time')}
            description={t('revenue_over_time_desc')}
            isLoading={isLoading || !data}
            isEmpty={isEmpty}
            emptyText={t('no_data')}
          >
            {data && (
              <TimeSeriesChart
                data={data}
                xKey="period"
                yKey="revenue"
                variant="area"
                seriesName={t('revenue')}
                height={300}
                xTickFormatter={(v) => formatAxisDate(v, groupBy)}
                valueFormatter={(v) => formatCurrency(v)}
                yTickFormatter={compactCurrency}
              />
            )}
          </ChartCard>

          <ChartCard
            title={t('orders_over_time')}
            description={t('orders_over_time_desc')}
            isLoading={isLoading || !data}
            isEmpty={isEmpty}
            emptyText={t('no_data')}
          >
            {data && (
              <TimeSeriesChart
                data={data}
                xKey="period"
                yKey="orders"
                variant="bar"
                color="#10b981"
                seriesName={t('total_orders')}
                height={300}
                xTickFormatter={(v) => formatAxisDate(v, groupBy)}
                valueFormatter={(v) => formatNumber(v)}
              />
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}
