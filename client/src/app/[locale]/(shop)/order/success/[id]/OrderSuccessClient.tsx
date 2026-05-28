'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CheckCircle, Package, ArrowLeft } from 'lucide-react';

import { useOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface OrderSuccessClientProps {
  orderId: string;
}

export default function OrderSuccessClient({ orderId }: OrderSuccessClientProps) {
  const t = useTranslations('checkout');
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{t('order_success')}</h1>
      <p className="mb-6 text-slate-500 dark:text-slate-400">{t('order_success_desc')}</p>

      {order && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 text-left dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-indigo-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{t('order_number')}: #{order.orderNumber}</span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <p>{t('status')}: <span className="font-medium text-slate-800 dark:text-slate-200">{order.status}</span></p>
            <p>{t('total')}: <span className="font-bold text-slate-900 dark:text-white">{order.total.toFixed(2)} AZN</span></p>
            <p>{t('items_count')}: {order.items.reduce((sum, i) => sum + i.quantity, 0)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/orders">
          <Button>
            <Package className="mr-2 h-4 w-4" />
            {t('view_orders')}
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('continue_shopping')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
