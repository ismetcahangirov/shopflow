'use client';

// src/app/[locale]/(shop)/HomeFeaturedProducts.tsx
// Homepage featured products — real data via API, rendered with the shared
// ProductCard (working add-to-cart, wishlist, locale-aware links). Replaces the
// previous hardcoded mock cards whose "Add to cart" buttons had no handler.

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { useFeaturedProductsQuery } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products/ProductGrid';

const FEATURED_LIMIT = 4;

export function HomeFeaturedProducts() {
  const t = useTranslations('home');
  const tp = useTranslations('product');
  const locale = useLocale();
  const { data, isLoading, isError } = useFeaturedProductsQuery();

  const products = (data ?? []).slice(0, FEATURED_LIMIT);

  // Keep the landing page pristine: if the request fails or there are no
  // featured products, hide the whole section (heading included) rather than
  // surfacing an empty/error placeholder on a marketing page.
  if (!isLoading && (isError || products.length === 0)) {
    return null;
  }

  return (
    <section className="container mx-auto px-4">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {tp('featured_products')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('featured_subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/products`}
          className="flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
        >
          <span>{t('view_all')}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <ProductGrid products={products} isLoading={isLoading} loadingCount={FEATURED_LIMIT} />
    </section>
  );
}
