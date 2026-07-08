// src/app/[locale]/(shop)/category/[slug]/page.tsx
// High-fidelity Category Detail & Product List page with SEO optimization and dynamic metadata generation

import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FolderOpen, Tag, Grid } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { EmptyState } from '@/components/ui/empty-state';
import { getTranslations } from 'next-intl/server';
import type { Category } from '@/types';

interface CategoryPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

async function getCategoryData(slug: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/categories/${slug}`, {
      next: { revalidate: 3600 }, // 1 hour revalidation
    });
    if (!res.ok) return null;
    const responseJson = await res.json();
    return responseJson.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export async function generateMetadata({
  params: { slug },
}: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryData(slug);
  if (!category) {
    return {
      // Bare title — the layout template appends " | ShopFlow" (issue #58).
      title: 'Category Not Found',
    };
  }

  const metaTitle = category.metaTitle || `${category.name} | ShopFlow`;
  const metaDesc =
    category.metaDesc ||
    category.description ||
    `${category.name} kateqoriyasındakı premium məhsulları kəşf edin.`;

  return {
    // `metaTitle` already contains "| ShopFlow" (or an admin-set metaTitle); use
    // `absolute` so the layout template doesn't append a second one (issue #58).
    title: { absolute: metaTitle },
    description: metaDesc,
    alternates: {
      canonical: `/category/${slug}`,
      languages: {
        az: `/az/category/${slug}`,
        en: `/en/category/${slug}`,
        ru: `/ru/category/${slug}`,
      },
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: 'website',
      images: category.image ? [{ url: category.image }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) return [];
    const responseJson = await res.json();
    const categories = responseJson.data;

    const locales = ['az', 'en', 'ru'];
    const params: Array<{ locale: string; slug: string }> = [];

    const flatten = (items: Category[]) => {
      items.forEach((cat) => {
        locales.forEach((locale) => {
          params.push({ locale, slug: cat.slug });
        });
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children);
        }
      });
    };

    if (categories && Array.isArray(categories)) {
      flatten(categories);
    }
    return params;
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

export default async function CategoryPage({
  params: { locale, slug },
}: CategoryPageProps) {
  const category = await getCategoryData(slug);
  const t = await getTranslations({ locale, namespace: 'common' });

  if (!category || category.isActive === false) {
    notFound();
  }

  // Build custom breadcrumbs items
  const breadcrumbItems = [
    { label: t('all_products_in').replace(':', ''), href: '/products' },
    ...(category.parent
      ? [{ label: category.parent.name, href: `/category/${category.parent.slug}` }]
      : []),
    { label: category.name },
  ];

  const hasChildren = category.children && category.children.length > 0;

  return (
    <main className="min-h-screen bg-slate-50/50 py-8 dark:bg-slate-950/20">
      <div className="container mx-auto px-4 max-w-7xl space-y-8 animate-in fade-in duration-300">
        {/* SEO and Navigation Breadcrumbs */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Premium Page Header & Metadata Presentation */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900/60 dark:border-slate-800/80 flex flex-col md:flex-row gap-6 items-center">
          {category.image && (
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
              <Image
                src={category.image}
                alt={category.name}
                fill
                priority
                sizes="(max-width: 768px) 128px, 160px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          )}
          <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                <Tag className="h-3 w-3" />
                {category.parent ? t('nav_categories') : 'Ana Kateqoriya'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </div>

        {/* Level 2 Subcategories Flyout / Cards Grid */}
        {hasChildren && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-indigo-500" />
              {t('nav_categories')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {category.children
                ?.filter((child: Category) => child.isActive !== false)
                .map((child: Category) => (
                  <Link
                    key={child.id}
                    href={`/${locale}/category/${child.slug}`}
                    className="group relative flex flex-col items-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-indigo-950 dark:hover:shadow-none"
                  >
                    {child.image ? (
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden mb-3 border border-slate-50 dark:border-slate-850">
                        <Image
                          src={child.image}
                          alt={child.name}
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-3 text-slate-450 dark:text-slate-650">
                        <FolderOpen className="h-7 w-7" />
                      </div>
                    )}
                    <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400 text-center transition-colors truncate w-full">
                      {child.name}
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* Dynamic Products Grid with fallback */}
        <section className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Grid className="h-5 w-5 text-indigo-500" />
            {t('all_products_in')} <span className="text-indigo-650 dark:text-indigo-400">{category.name}</span>
          </h2>

          {/* Placeholder for Products - Currently falls back to gorgeous empty state as product module is upcoming */}
          <div className="bg-white border border-slate-100 rounded-2xl p-8 dark:bg-slate-900/40 dark:border-slate-800/80">
            <EmptyState
              title={t('search_title')}
              description={`${category.name} kateqoriyasında hələlik heç bir məhsul mövcud deyil. Tezliklə yeni kolleksiyalarımızla xidmətinizdə olacağıq!`}
              icon={<Grid className="h-7 w-7" />}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
