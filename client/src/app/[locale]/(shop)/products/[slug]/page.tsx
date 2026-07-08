// src/app/[locale]/(shop)/products/[slug]/page.tsx
// Product Detail page — SSG with ISR revalidation (60s), full SEO metadata + JSON-LD schema

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductSchema } from '@/components/products/ProductSchema';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import type { Product } from '@/types';

interface ProductPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

async function getProductData(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as Product;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params: { slug },
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductData(slug);
  if (!product) {
    // Bare title — the layout template appends " | ShopFlow" (issue #58).
    return { title: 'Məhsul tapılmadı' };
  }

  const title = product.metaTitle || `${product.name} | ShopFlow`;
  const description =
    product.metaDesc || product.shortDesc || product.description?.slice(0, 160) || '';
  const mainImage = product.images?.find((img) => img.isMain) || product.images?.[0];

  return {
    // `title` already contains "| ShopFlow" (or an admin-set metaTitle); use
    // `absolute` so the layout template doesn't append a second one (issue #58).
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/products/${slug}`,
      languages: {
        az: `/az/products/${slug}`,
        en: `/en/products/${slug}`,
        ru: `/ru/products/${slug}`,
        'x-default': `/az/products/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: mainImage ? [{ url: mainImage.url, alt: mainImage.alt || product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: mainImage ? [mainImage.url] : undefined,
    },
  };
}

export async function generateStaticParams() {
  try {
    // Generate top 50 most popular products at build time
    const res = await fetch(`${API_URL}/products?sort=popular&limit=50`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const products: Product[] = json.data?.products ?? [];

    const locales = ['az', 'en', 'ru'];
    return products.flatMap((p) =>
      locales.map((locale) => ({ locale, slug: p.slug }))
    );
  } catch {
    return [];
  }
}

export default async function ProductPage({
  params: { locale, slug },
}: ProductPageProps) {
  const product = await getProductData(slug);
  const t = await getTranslations({ locale, namespace: 'common' });

  if (!product || !product.isActive) {
    notFound();
  }

  const breadcrumbItems = [
    { label: t('nav_products'), href: '/products' },
    ...(product.category
      ? [{ label: product.category.name, href: `/category/${product.category.slug}` }]
      : []),
    { label: product.name },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950/20">
      {/* JSON-LD structured data for SEO */}
      <ProductSchema product={product} />

      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8 animate-in fade-in duration-300">
        {/* Breadcrumb navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Client-side interactive product detail */}
        <ProductDetailClient product={product} locale={locale} />
      </div>
    </main>
  );
}
