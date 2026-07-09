// src/components/orders/OrderList.tsx
// Account "My Orders" list: status-filter tabs, paginated order rows, and loading/empty/error states.

'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Package } from 'lucide-react';

import { useMyOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { parseApiError } from '@/lib/api';
import { OrderCard } from './OrderCard';
import { ORDER_FILTER_STATUSES } from './OrderStatusBadge';

const PAGE_SIZE = 10;

export function OrderList(): React.JSX.Element {
  const t = useTranslations('orders');
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [page, setPage] = React.useState(1);

  const { data, isLoading, isError, error, refetch } = useMyOrders(page, PAGE_SIZE, status);
  const orders = data?.data ?? [];
  const totalPages = data?.pagination?.pages ?? 1;
  const totalEntries = data?.pagination?.total;

  const handleStatusChange = (next: string | undefined) => {
    setStatus(next);
    setPage(1); // filtering resets to the first page
  };

  const filters: { value: string | undefined; label: string }[] = [
    { value: undefined, label: t('filter_all') },
    ...ORDER_FILTER_STATUSES.map((s) => ({ value: s, label: t(`status_${s.toLowerCase()}`) })),
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{t('my_orders')}</h1>

      {/* Status filter tabs */}
      <div
        className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        role="tablist"
        aria-label={t('filter_by_status')}
      >
        {filters.map((f) => {
          const active = status === f.value;
          return (
            <button
              key={f.value ?? 'all'}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleStatusChange(f.value)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors focus:outline-none',
                active
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />
      ) : orders.length === 0 ? (
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
        <>
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalEntries={totalEntries}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </div>
  );
}
