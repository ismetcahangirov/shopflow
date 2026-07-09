// src/components/orders/OrderDetail.tsx
// Shared order-detail view: status-history timeline, items, address, summary and cancel (PENDING only).
// Rendered by /account/orders/[id].

'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, MapPin, Package, CreditCard, Truck } from 'lucide-react';

import { useOrder, useCancelOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { parseApiError } from '@/lib/api';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps): React.JSX.Element {
  const t = useTranslations('orders');
  const locale = useLocale();
  const { data: order, isLoading, isError, error, refetch } = useOrder(orderId);
  const cancelOrder = useCancelOrder();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Spinner />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState message={parseApiError(error) || t('order_not_found')} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/${locale}/account/orders`}
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back_to_orders')}
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">#{order.orderNumber}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString('az-AZ')}</p>
        </div>
        <OrderStatusBadge status={order.status} className="px-3 py-1 text-xs font-semibold" />
      </div>

      {/* Status History */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
          <Truck className="h-5 w-5 text-indigo-500" />
          {t('status')}
        </h2>
        <div className="relative pl-6">
          {order.statusHistory.map((entry, idx) => (
            <div key={idx} className="relative pb-4 last:pb-0">
              {idx < order.statusHistory.length - 1 && (
                <div className="absolute left-[-17px] top-3 h-full w-0.5 bg-slate-200 dark:bg-slate-700" />
              )}
              <div className="absolute left-[-21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t(`status_${entry.status.toLowerCase()}`)}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.createdAt).toLocaleString('az-AZ')}</p>
                {entry.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{entry.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
          <Package className="h-5 w-5 text-indigo-500" />
          {t('order_items')}
        </h2>
        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-700">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">{item.productName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {item.productSku} × {item.quantity}</p>
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-200">{item.total.toFixed(2)} AZN</span>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      {order.address && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
            <MapPin className="h-5 w-5 text-indigo-500" />
            {t('shipping_address')}
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-800 dark:text-slate-200">{order.address.fullName}</p>
            <p>{order.address.phone}</p>
            <p>{[order.address.street, order.address.building, order.address.apartment].filter(Boolean).join(', ')}</p>
            <p>{order.address.district}, {order.address.city}</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
          <CreditCard className="h-5 w-5 text-indigo-500" />
          {t('order_summary')}
        </h2>
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>{t('subtotal')}</span><span>{order.subtotal.toFixed(2)} AZN</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>{t('shipping')}</span><span>{order.shippingCost.toFixed(2)} AZN</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t('discount')}</span><span>-{order.discount.toFixed(2)} AZN</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
            <span>{t('total')}</span><span>{order.total.toFixed(2)} AZN</span>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      {order.status === 'PENDING' && (
        <Button
          variant="outline"
          onClick={() => cancelOrder.mutate({ id: order.id })}
          disabled={cancelOrder.isPending}
          isLoading={cancelOrder.isPending}
          className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/50 dark:text-red-400"
        >
          {t('cancel_order')}
        </Button>
      )}

      {order.trackingNumber && (
        <div className="mt-3 text-center text-sm text-slate-500">
          Tracking: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{order.trackingNumber}</span>
        </div>
      )}
    </div>
  );
}
