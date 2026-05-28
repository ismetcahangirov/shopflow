'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Package, ChevronRight } from 'lucide-react';

import { useMyOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { parseApiError } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESSING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SHIPPED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
};

export default function OrdersPageClient() {
  const t = useTranslations('orders');
  const [page] = React.useState(1);
  const { data: orders, isLoading, isError, error, refetch } = useMyOrders(page, 10);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Skeleton className="mb-6 h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="mb-4 h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{t('my_orders')}</h1>

      {!orders || orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12 text-slate-400" />}
          title={t('no_orders')}
          description={t('no_orders_desc')}
          action={
            <Link href="/products">
              <Button>{t('start_shopping')}</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">#{order.orderNumber}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(order.createdAt).toLocaleDateString('az-AZ')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{order.total.toFixed(2)} AZN</span>
                  <div>
                    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-700')}>
                      {t(`status_${order.status.toLowerCase()}`)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
