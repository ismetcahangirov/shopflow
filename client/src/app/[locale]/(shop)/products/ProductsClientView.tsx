'use client';

// src/app/[locale]/(shop)/products/ProductsClientView.tsx
// Client component: fetches products from API with URL-synced filters, renders grid + pagination

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal, X } from 'lucide-react';
import { useProductsQuery } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductsClientViewProps {
  locale: string;
  initialSearchParams: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    rating?: string;
    stock?: string;
    page?: string;
  };
}

const SORT_OPTIONS = [
  { value: 'newest', labelKey: 'sort_newest' },
  { value: 'price_asc', labelKey: 'sort_price_asc' },
  { value: 'price_desc', labelKey: 'sort_price_desc' },
  { value: 'rating', labelKey: 'sort_rating' },
] as const;

const PAGE_SIZE = 20;

export function ProductsClientView({
  initialSearchParams,
}: ProductsClientViewProps) {
  const t = useTranslations('product');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Mobile filter panel toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  // Build query params for API from URL
  const queryParams = React.useMemo(() => {
    const params: Record<string, string> = {};
    const q = searchParams.get('q') || initialSearchParams.q;
    const category = searchParams.get('category') || initialSearchParams.category;
    const brand = searchParams.get('brand') || initialSearchParams.brand;
    const minPrice = searchParams.get('minPrice') || initialSearchParams.minPrice;
    const maxPrice = searchParams.get('maxPrice') || initialSearchParams.maxPrice;
    const sort = searchParams.get('sort') || initialSearchParams.sort || 'newest';
    const rating = searchParams.get('rating') || initialSearchParams.rating;
    const stock = searchParams.get('stock') || initialSearchParams.stock;
    const page = searchParams.get('page') || initialSearchParams.page || '1';

    if (q) params['search'] = q;
    if (category) params['categorySlug'] = category;
    if (brand) params['brand'] = brand;
    if (minPrice) params['minPrice'] = minPrice;
    if (maxPrice) params['maxPrice'] = maxPrice;
    if (sort) params['sort'] = sort;
    if (rating) params['minRating'] = rating;
    if (stock === 'in_stock') params['inStock'] = 'true';
    params['page'] = page;
    params['limit'] = String(PAGE_SIZE);
    return params;
  }, [searchParams, initialSearchParams]);

  const currentSort = searchParams.get('sort') || initialSearchParams.sort || 'newest';
  const currentPage = parseInt(searchParams.get('page') || initialSearchParams.page || '1', 10);

  const { data, isLoading, isError } = useProductsQuery(queryParams);

  const products = data?.data?.products ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParam('sort', e.target.value);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex gap-8">
      {/* ── Sidebar Filters (Desktop) ── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24">
          <ProductFilters />
        </div>
      </aside>

      {/* ── Mobile Filter Overlay ── */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-full overflow-y-auto bg-white dark:bg-slate-900 p-5 shadow-2xl lg:hidden animate-in slide-in-from-left duration-250">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">{t('filter_title')}</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ProductFilters />
          </div>
        </>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Toolbar: result count + sort + mobile filter btn */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden gap-1.5 text-xs font-semibold border-slate-200 dark:border-slate-700"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t('filter_title')}
            </Button>

            {/* Result count */}
            {!isLoading && pagination && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {pagination.total}
                </span>{' '}
                məhsul tapıldı
              </span>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="products-sort"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap"
            >
              {t('sort_by')}:
            </label>
            <select
              id="products-sort"
              value={currentSort}
              onChange={handleSortChange}
              className={cn(
                'h-8 rounded-lg border border-slate-200 bg-white px-2.5 pr-8 text-xs font-medium text-slate-700',
                'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
                'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error state */}
        {isError && !isLoading && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center dark:border-red-900/30 dark:bg-red-950/20">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Məhsullar yüklənərkən xəta baş verdi. Yenidən cəhd edin.
            </p>
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          loadingCount={PAGE_SIZE}
        />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
