// src/app/[locale]/(shop)/categories/page.tsx
// Categories index — lists every top-level category, each linking to its
// existing /category/{slug} detail page. Fixes issue #51: the header, footer
// and homepage all pointed at /categories, which had no route and 404'd.
// Mirrors the server-side fetch + EmptyState fallback pattern of category/[slug].

import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FolderOpen, Grid, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { EmptyState } from '@/components/ui/empty-state';
import type { Category } from '@/types';

interface CategoriesPageProps {
  params: { locale: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 }, // 1 hour revalidation
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? (json.data as Category[]) : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function generateMetadata({
  params: { locale },
}: CategoriesPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    title: t('nav_categories'),
    description: t('categories_subtitle'),
    alternates: {
      canonical: `/${locale}/categories`,
      languages: {
        az: '/az/categories',
        en: '/en/categories',
        ru: '/ru/categories',
      },
    },
  };
}

export default async function CategoriesPage({
  params: { locale },
}: CategoriesPageProps) {
  const categories = await getCategories();
  const t = await getTranslations({ locale, namespace: 'common' });

  // Only show top-level, active categories; subcategories live on the detail page.
  const topLevel = categories.filter(
    (cat) => (cat.parentId === null || cat.parentId === undefined) && cat.isActive !== false,
  );

  return (
    <main className="min-h-screen bg-slate-50/50 py-8 dark:bg-slate-950/20">
      <div className="container mx-auto px-4 max-w-7xl space-y-8 animate-in fade-in duration-300">
        <Breadcrumb items={[{ label: t('nav_categories') }]} />

        {/* Page header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('nav_categories')}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{t('categories_subtitle')}</p>
        </div>

        {topLevel.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topLevel.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/category/${cat.slug}`}
                className="group relative flex items-center gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-card hover:shadow-card-hover hover:border-indigo-100 transition-all duration-300 dark:bg-slate-900/40 dark:border-slate-800/50 dark:hover:border-indigo-950"
              >
                {cat.image ? (
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-slate-50 dark:border-slate-800">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <FolderOpen className="h-7 w-7" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h2>
                  {typeof cat._count?.products === 'number' && (
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                      {t('products_count', { count: cat._count.products })}
                    </p>
                  )}
                </div>

                <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-500" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 dark:border-slate-800/80 dark:bg-slate-900/40">
            <EmptyState
              title={t('nav_categories')}
              description={t('categories_empty')}
              icon={<Grid className="h-7 w-7" />}
            />
          </div>
        )}
      </div>
    </main>
  );
}
