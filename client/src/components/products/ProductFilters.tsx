'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Filter, RotateCcw, Check, Star } from 'lucide-react';
import { useCategoriesQuery } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ProductFiltersProps {
  className?: string;
  availableBrands?: string[];
}

export function ProductFilters({
  className,
  availableBrands = ['Apple', 'Samsung', 'Sony', 'Xiaomi', 'Asus', 'Nike', 'Adidas', 'Zara'],
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('product');

  const { data: categories } = useCategoriesQuery();

  // Local state for price inputs to avoid laggy typing
  const [minPriceVal, setMinPriceVal] = React.useState('');
  const [maxPriceVal, setMaxPriceVal] = React.useState('');

  // Sync url price params into local state on load/change
  React.useEffect(() => {
    setMinPriceVal(searchParams.get('minPrice') || '');
    setMaxPriceVal(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  // Read current filters from URL params
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentStock = searchParams.get('stock') === 'in_stock';
  const currentRating = searchParams.get('rating') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  // Helper to update query params
  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 on filter changes
    params.set('page', '1');

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategorySelect = (slug: string) => {
    updateQueryParams({ category: currentCategory === slug ? null : slug });
  };

  const handleBrandSelect = (brand: string) => {
    updateQueryParams({ brand: currentBrand === brand ? null : brand });
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateQueryParams({ stock: e.target.checked ? 'in_stock' : null });
  };

  const handleRatingSelect = (rating: string) => {
    updateQueryParams({ rating: currentRating === rating ? null : rating });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({
      minPrice: minPriceVal || null,
      maxPrice: maxPriceVal || null,
    });
  };

  const handleClearFilters = () => {
    setMinPriceVal('');
    setMaxPriceVal('');
    // Clear all except search query and sort
    const query = searchParams.get('q');
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (currentSort) params.set('sort', currentSort);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Group categories by parent to show nested structures if any
  const parentCategories = categories?.filter((c) => !c.parentId) || [];

  return (
    <div
      className={cn(
        'w-full space-y-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/40 dark:bg-slate-900',
        className
      )}
      data-testid="product-filters"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {t('filter_title')}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-8 gap-1.5 text-xs text-slate-500 hover:text-red-650 dark:hover:text-red-400"
        >
          <RotateCcw className="h-3 w-3" />
          {t('clear_all')}
        </Button>
      </div>

      {/* Categories */}
      {parentCategories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('category')}
          </h3>
          <div className="flex flex-col gap-1.5">
            {parentCategories.map((cat) => {
              const isActive = currentCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                      : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-350 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                  )}
                >
                  <span>{cat.name}</span>
                  {isActive && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brands */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t('brand')}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {availableBrands.map((brand) => {
            const isActive = currentBrand === brand;
            return (
              <button
                key={brand}
                type="button"
                onClick={() => handleBrandSelect(brand)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150',
                  isActive
                    ? 'border-indigo-650 bg-indigo-650 text-white shadow-sm dark:border-indigo-550 dark:bg-indigo-550'
                    : 'border-slate-200 bg-transparent text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'
                )}
              >
                {brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t('price_range')}
        </h3>
        <form onSubmit={handlePriceApply} className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPriceVal}
            onChange={(e) => setMinPriceVal(e.target.value)}
            className="h-8.5 rounded-lg text-xs"
            aria-label="Minimum price"
          />
          <span className="text-slate-350">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPriceVal}
            onChange={(e) => setMaxPriceVal(e.target.value)}
            className="h-8.5 rounded-lg text-xs"
            aria-label="Maximum price"
          />
          <Button type="submit" size="sm" className="h-8.5 rounded-lg px-2.5 text-xs font-semibold">
            OK
          </Button>
        </form>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          id="filter-stock"
          checked={currentStock}
          onChange={handleStockChange}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
        />
        <label
          htmlFor="filter-stock"
          className="text-xs font-semibold text-slate-650 dark:text-slate-300 cursor-pointer select-none"
        >
          {t('in_stock_only')}
        </label>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t('rating')}
        </h3>
        <div className="flex flex-col gap-1.5">
          {['4', '3', '2'].map((starVal) => {
            const isActive = currentRating === starVal;
            return (
              <button
                key={starVal}
                type="button"
                onClick={() => handleRatingSelect(starVal)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-350 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5 text-amber-400 fill-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3.5 w-3.5',
                          i < parseInt(starVal) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-850'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    & {t('above_rating') || 'Up'}
                  </span>
                </div>
                {isActive && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
