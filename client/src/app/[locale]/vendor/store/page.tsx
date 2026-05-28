'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Store, Phone, FileText } from 'lucide-react';

import { useMyVendor } from '@/hooks/useVendor';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { parseApiError } from '@/lib/api';

export default function VendorStorePage() {
  const t = useTranslations('vendor');
  const { data: vendor, isLoading, isError, error, refetch } = useMyVendor();

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (isError || !vendor) return <ErrorState message={parseApiError(error) || t('store_error')} onRetry={() => refetch()} />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{t('store_settings')}</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <Store className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{vendor.storeName}</h2>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              vendor.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              vendor.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {t(`status_${vendor.status.toLowerCase()}`)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          {vendor.description && (
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">{vendor.description}</span>
            </div>
          )}
          {vendor.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">{vendor.phone}</span>
            </div>
          )}
          <div className="mt-2 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-700">
            <div>
              <p className="text-xs text-slate-500">{t('commission')}</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{vendor.commission}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('total_sales')}</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{vendor.totalSales.toFixed(2)} AZN</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('slug')}</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{vendor.slug}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('products_count')}</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{vendor.productCount}</p>
            </div>
          </div>
        </div>

        {vendor.status !== 'APPROVED' && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
            {t('pending_approval')}
          </div>
        )}
      </div>
    </div>
  );
}
