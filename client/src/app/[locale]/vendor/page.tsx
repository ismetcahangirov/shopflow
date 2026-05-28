'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag, TrendingUp, DollarSign, Package } from 'lucide-react';

import { useMyVendor, useVendorStats } from '@/hooks/useVendor';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { parseApiError } from '@/lib/api';

export default function VendorPage(): React.JSX.Element {
  const t = useTranslations('vendor');
  const { data: vendor } = useMyVendor();
  const { data: stats, isLoading, isError, error, refetch } = useVendorStats();

  if (isLoading) return <Spinner />;

  if (isError || !stats) {
    return <ErrorState message={parseApiError(error) || t('stats_error')} onRetry={() => refetch()} />;
  }

  const statCards = [
    { label: t('total_products'), value: stats.totalProducts.toString(), icon: Package, color: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400' },
    { label: t('total_orders'), value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
    { label: t('revenue'), value: `${stats.totalRevenue.toFixed(2)} AZN`, icon: DollarSign, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
    { label: t('avg_rating'), value: stats.avgRating.toFixed(1), icon: TrendingUp, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {vendor?.storeName || t('dashboard')}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard_desc')}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.pendingOrders > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
          {t('pending_orders_warning', { count: stats.pendingOrders })}
        </div>
      )}
    </div>
  );
}
