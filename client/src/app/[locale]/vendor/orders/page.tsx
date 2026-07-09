'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useVendorOrders } from '@/hooks/useVendor';
import { OrderStatusBadge, ORDER_FILTER_STATUSES } from '@/components/orders/OrderStatusBadge';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { parseApiError } from '@/lib/api';

const PAGE_SIZE = 10;

export default function VendorOrdersPage(): React.JSX.Element {
  const t = useTranslations('vendor');
  const tOrders = useTranslations('orders');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useVendorOrders({ page, limit: PAGE_SIZE, status });
  const orders = data?.data ?? [];
  const pages = data?.pagination?.pages ?? 1;

  const filters: (string | undefined)[] = [undefined, ...ORDER_FILTER_STATUSES];

  const selectFilter = (value: string | undefined): void => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <PageHeader title={t('orders_title')} description={t('orders_desc')} />

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f ?? 'ALL'}
            type="button"
            onClick={() => selectFilter(f)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              status === f
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
            )}
          >
            {f ? tOrders(`status_${f.toLowerCase()}`) : t('filter_all')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : isError ? (
        <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />
      ) : orders.length === 0 ? (
        <EmptyState title={tOrders('no_orders')} description={tOrders('no_orders_desc')} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">#{order.orderNumber}</span>
                  <p className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('az-AZ')} · {t('items_count', { count: order.vendorItemCount })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(order.vendorSubtotal)}</span>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">{t('vendor_subtotal')}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" /> {t('prev')}
              </button>
              <span className="text-sm text-slate-500">{t('page_of', { page, pages })}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                {t('next')} <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
