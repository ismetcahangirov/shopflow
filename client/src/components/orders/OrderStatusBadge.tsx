// src/components/orders/OrderStatusBadge.tsx
// Shared order-status color map + badge, used by the order list, order card, and order detail.

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/** Tailwind classes per order status (light + dark). */
export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESSING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SHIPPED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
};

/** Statuses offered as filter tabs on the orders page (order matches the UI). */
export const ORDER_FILTER_STATUSES = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps): React.JSX.Element {
  const t = useTranslations('orders');
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
        ORDER_STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        className,
      )}
    >
      {t(`status_${status.toLowerCase()}`)}
    </span>
  );
}
