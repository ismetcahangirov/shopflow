'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';

export interface ProductGridProps {
  products?: Product[];
  isLoading?: boolean;
  loadingCount?: number;
}

export function ProductGrid({
  products = [],
  isLoading = false,
  loadingCount = 8,
}: ProductGridProps) {
  const t = useTranslations('product');

  if (isLoading) {
    return <ProductGridSkeleton count={loadingCount} />;
  }

  if (!products || products.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/20"
        data-testid="product-grid-empty"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-500 mb-4">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
          {t('no_products_found')}
        </h3>
        <p className="text-sm text-slate-550 dark:text-slate-400 max-w-sm">
          {t('try_adjusting_filters') || 'Try adjusting your filters or search terms to find what you are looking for.'}
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      data-testid="product-grid"
    >
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={idx < 4} // prioritize loading for the first row of images (LCP optimization)
        />
      ))}
    </div>
  );
}
