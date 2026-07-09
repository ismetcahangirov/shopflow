// src/components/orders/OrderCard.tsx
// Single order row used by the account "My Orders" list. Links to the order detail page.

'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';

import type { OrderListItem } from '@/hooks/useOrders';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: OrderListItem;
}

export function OrderCard({ order }: OrderCardProps): React.JSX.Element {
  const t = useTranslations('orders');
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/account/orders/${order.id}`}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800"
    >
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-slate-800 dark:text-slate-200">#{order.orderNumber}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {new Date(order.createdAt).toLocaleDateString('az-AZ')}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {t('item_count', { count: order.itemCount })}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{order.total.toFixed(2)} AZN</span>
          <div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </div>
    </Link>
  );
}
