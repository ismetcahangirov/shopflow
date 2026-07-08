// src/app/[locale]/(shop)/products/page.tsx
// Server-rendered Products Listing page with URL-synced filters, sorting, and SEO metadata

import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ProductsClientView } from './ProductsClientView';

interface ProductsPageProps {
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

export async function generateMetadata({
  params: { locale },
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });
  const query = searchParams.q;

  const title = query
    ? `"${query}" — ${t('search_title')} | ShopFlow`
    : `${t('nav_products')} | ShopFlow`;

  const description = query
    ? `ShopFlow-da "${query}" üçün axtarış nəticələri.`
    : 'ShopFlow platformasındakı bütün məhsulları kəşf edin. Minlərlə məhsul, sürətli çatdırılma, təhlükəsiz ödəniş.';

  return {
    // `title` already contains "| ShopFlow"; use `absolute` so the layout's
    // "%s | ShopFlow" template doesn't append a second one (issue #58).
    title: { absolute: title },
    description,
    alternates: {
      canonical: '/products',
      languages: {
        az: `/az/products`,
        en: `/en/products`,
        ru: `/ru/products`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductsPage({
  params: { locale },
  searchParams,
}: ProductsPageProps) {
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950/20">
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {searchParams.q
              ? `"${searchParams.q}" — ${t('search_title')}`
              : t('nav_products')}
          </h1>
          {!searchParams.q && (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Premium məhsulları kəşf edin, filtrlər ilə axtarışı dəqiqləşdirin.
            </p>
          )}
        </div>

        {/* Client-side view with filters + grid */}
        <ProductsClientView
          locale={locale}
          initialSearchParams={searchParams}
        />
      </div>
    </main>
  );
}
