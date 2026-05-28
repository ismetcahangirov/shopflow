'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils';
import { parseApiError } from '@/lib/api';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, Product } from '@/types';

export default function VendorProductsPage() {
  const t = useTranslations('vendor');

  const { data: products, isLoading, isError, error, refetch } = useQuery<Product[]>({
    queryKey: ['vendorProducts'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Product[]>>(`/products`);
      return res.data.data;
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (isError) return <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('my_products')}</h1>
        <Link href={`/vendor/products/new`}>
          <Button><Plus className="mr-1.5 h-4 w-4" />{t('add_product')}</Button>
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <EmptyState title={t('my_products')} description="" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">{t('product_name')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">{t('price')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">{t('stock')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.price.toFixed(2)} AZN</td>
                  <td className="px-4 py-3 text-slate-600">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', p.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                      {p.isActive ? t('active') : t('inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
