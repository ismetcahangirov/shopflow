// src/app/[locale]/(shop)/search/page.tsx
// Server-rendered search page with URL-synced filters, sorting, pagination, and SEO metadata.

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AlertTriangle, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductGrid } from '@/components/products/ProductGrid';
import { cn } from '@/lib/utils';
import type { ApiResponse, Product } from '@/types';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;
const SORT_OPTIONS = ['newest', 'price_asc', 'price_desc', 'rating'] as const;

type SearchSort = (typeof SORT_OPTIONS)[number];

interface SearchPageProps {
  params: {
    locale: string;
  };
  searchParams: {
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

interface SearchResult {
  products: Product[];
  pagination: NonNullable<ApiResponse<{ products: Product[] }>['pagination']>;
  error: boolean;
}

function normalizePage(page?: string): number {
  const parsed = Number.parseInt(page ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeSort(sort?: string): SearchSort {
  return SORT_OPTIONS.includes(sort as SearchSort) ? (sort as SearchSort) : 'newest';
}

function buildApiSearchParams(searchParams: SearchPageProps['searchParams']): URLSearchParams {
  const params = new URLSearchParams();
  const query = searchParams.q?.trim();
  const page = normalizePage(searchParams.page);
  const sort = normalizeSort(searchParams.sort);

  if (query) params.set('search', query);
  if (searchParams.category) params.set('categorySlug', searchParams.category);
  if (searchParams.brand) params.set('brand', searchParams.brand);
  if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
  if (searchParams.stock === 'in_stock') params.set('inStock', 'true');

  params.set('sort', sort);
  params.set('page', String(page));
  params.set('limit', String(PAGE_SIZE));

  return params;
}

function buildSearchHref(
  locale: string,
  searchParams: SearchPageProps['searchParams'],
  updates: Record<string, string | number | null>
): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return `/${locale}/search${queryString ? `?${queryString}` : ''}`;
}

async function getSearchResults(searchParams: SearchPageProps['searchParams']): Promise<SearchResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  const params = buildApiSearchParams(searchParams);

  try {
    const response = await fetch(`${apiUrl}/products?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        products: [],
        pagination: { total: 0, pages: 1, page: normalizePage(searchParams.page), limit: PAGE_SIZE },
        error: true,
      };
    }

    const payload = (await response.json()) as ApiResponse<{ products: Product[] }>;

    return {
      products: payload.data.products,
      pagination: payload.pagination ?? {
        total: payload.data.products.length,
        pages: 1,
        page: normalizePage(searchParams.page),
        limit: PAGE_SIZE,
      },
      error: false,
    };
  } catch {
    return {
      products: [],
      pagination: { total: 0, pages: 1, page: normalizePage(searchParams.page), limit: PAGE_SIZE },
      error: true,
    };
  }
}

export async function generateMetadata({
  params: { locale },
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const common = await getTranslations({ locale, namespace: 'common' });
  const product = await getTranslations({ locale, namespace: 'product' });
  const query = searchParams.q?.trim();
  const title = query ? `${product('search_results', { query })} | ShopFlow` : `${common('search_title')} | ShopFlow`;

  return {
    title,
    description: query ? product('search_page_desc', { query }) : common('site_desc'),
    alternates: {
      canonical: query ? `/search?q=${encodeURIComponent(query)}` : '/search',
      languages: {
        az: query ? `/az/search?q=${encodeURIComponent(query)}` : '/az/search',
        en: query ? `/en/search?q=${encodeURIComponent(query)}` : '/en/search',
        ru: query ? `/ru/search?q=${encodeURIComponent(query)}` : '/ru/search',
      },
    },
    openGraph: {
      title,
      description: query ? product('search_page_desc', { query }) : common('site_desc'),
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SearchPage({
  params: { locale },
  searchParams,
}: SearchPageProps) {
  const common = await getTranslations({ locale, namespace: 'common' });
  const product = await getTranslations({ locale, namespace: 'product' });
  const query = searchParams.q?.trim() ?? '';
  const currentPage = normalizePage(searchParams.page);
  const currentSort = normalizeSort(searchParams.sort);
  const { products, pagination, error } = await getSearchResults(searchParams);
  const totalPages = Math.max(1, pagination.pages);

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950/20">
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6 animate-in fade-in duration-300">
        <section className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Search className="h-3.5 w-3.5" />
              {common('search_title')}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {query ? product('search_results', { query }) : product('search_page_title')}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {query ? product('search_page_desc', { query }) : product('search_intro')}
            </p>
          </div>

          <form action={`/${locale}/search`} className="flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder={common('search_placeholder')}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {product('search_submit')}
            </button>
          </form>
        </section>

        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <ProductFilters />
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-5">
            <details className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                {product('mobile_filters')}
              </summary>
              <div className="pt-4">
                <ProductFilters />
              </div>
            </details>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span>{' '}
                {product('results_count')}
              </p>

              <form action={`/${locale}/search`} className="flex items-center gap-2">
                {Object.entries(searchParams).map(([key, value]) => {
                  if (!value || key === 'sort' || key === 'page') return null;
                  return <input key={key} type="hidden" name={key} value={value} />;
                })}
                <label htmlFor="search-sort" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {product('sort_by')}:
                </label>
                <select
                  id="search-sort"
                  name="sort"
                  defaultValue={currentSort}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {SORT_OPTIONS.map((sort) => (
                    <option key={sort} value={sort}>
                      {product(`sort_${sort}`)}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                >
                  {product('apply_sort')}
                </button>
              </form>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {product('products_load_error')}
              </div>
            )}

            <ProductGrid products={products} />

            {totalPages > 1 && (
              <nav className="flex flex-wrap items-center justify-center gap-2 pt-4" aria-label="Search pagination">
                <Link
                  href={buildSearchHref(locale, searchParams, { page: Math.max(1, currentPage - 1) })}
                  aria-disabled={currentPage === 1}
                  className={cn(
                    'inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200',
                    currentPage === 1 && 'pointer-events-none opacity-50'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {product('previous_page')}
                </Link>

                <span className="px-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {product('page_indicator', { page: currentPage, total: totalPages })}
                </span>

                <Link
                  href={buildSearchHref(locale, searchParams, { page: Math.min(totalPages, currentPage + 1) })}
                  aria-disabled={currentPage === totalPages}
                  className={cn(
                    'inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200',
                    currentPage === totalPages && 'pointer-events-none opacity-50'
                  )}
                >
                  {product('next_page')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </nav>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
