'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils';
import { parseApiError } from '@/lib/api';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@/types';
import type { OrderListItem } from '@/hooks/useOrders';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESSING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SHIPPED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function VendorOrdersPage() {
  const t = useTranslations('orders');

  const { data: orders, isLoading, isError, error, refetch } = useQuery<OrderListItem[]>({
    queryKey: ['vendorOrders'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<OrderListItem[]>>('/orders');
      return res.data.data;
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (isError) return <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">{t('my_orders')}</h1>
      {!orders || orders.length === 0 ? (
        <EmptyState title={t('no_orders')} description={t('no_orders_desc')} />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">#{order.orderNumber}</span>
                <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString('az-AZ')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{order.total.toFixed(2)} AZN</span>
                <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[order.status] ?? 'bg-slate-100')}>
                  {t(`status_${order.status.toLowerCase()}`)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
