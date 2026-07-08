// src/app/[locale]/page.tsx
// Localized landing page with sleek visuals and design system tokens

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Star,
  Sparkles,
  TrendingUp,
  Gift,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HomeFeaturedProducts } from './HomeFeaturedProducts';

export default function HomePage() {
  const t = useTranslations('common');
  const th = useTranslations('home');
  const locale = useLocale();

  // Curated category shortcuts for the landing page. Names are localized via the
  // `home` namespace; counts are illustrative marketing figures.
  const categories = [
    { id: '1', slug: 'electronics', nameKey: 'cat_electronics', count: 1420, icon: Sparkles, color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400' },
    { id: '2', slug: 'clothing', nameKey: 'cat_clothing', count: 850, icon: ShoppingBag, color: 'from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400' },
    { id: '3', slug: 'home-appliances', nameKey: 'cat_appliances', count: 430, icon: Gift, color: 'from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400' },
    { id: '4', slug: 'sports', nameKey: 'cat_sports', count: 290, icon: TrendingUp, color: 'from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400' },
  ] as const;

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-100 dark:border-primary-900/30 text-sm font-semibold text-primary-600 dark:text-primary-400">
              <Sparkles className="h-4 w-4 animate-spin-slow" />
              <span>{th('hero_badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {th.rich('hero_title', {
                brand: (chunks) => (
                  <span className="bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    {chunks}
                  </span>
                ),
              })}
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              {t('site_desc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href={`/${locale}/products`}
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  "rounded-xl px-8 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 shadow-md shadow-primary-500/20 text-white font-semibold flex items-center gap-2"
                )}
              >
                <span>{th('hero_cta_explore')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}/register`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  "rounded-xl px-8 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center"
                )}
              >
                <span>{th('hero_cta_sell')}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Visual Glassmorphism Card Frame */}
            <div className="relative mx-auto w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden shadow-card-lg border border-white/20 dark:border-slate-800/80 bg-white/10 dark:bg-slate-900/10 backdrop-blur-md">
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80"
                alt="ShopFlow Hero Image"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Overlay Interactive Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-white/20 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{th('hero_pick_label')}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{th('hero_pick_name')}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-sm font-bold">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-500">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{th('feature_shipping_title')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{th('feature_shipping_desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{th('feature_payment_title')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{th('feature_payment_desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-card hover:shadow-card-hover transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{th('feature_returns_title')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{th('feature_returns_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{th('categories_title')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{th('categories_subtitle')}</p>
          </div>
          <Link href={`/${locale}/categories`} className="flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            <span>{th('view_all')}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/${locale}/category/${cat.slug}`}
                className="group relative p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900/20 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col justify-between aspect-[4/3]"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.color} w-fit`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">{th(cat.nameKey)}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('products_count', { count: cat.count })}</p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-primary-500">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS SECTION (real data + working add-to-cart) */}
      <HomeFeaturedProducts />

      {/* 5. VENDOR CTA BANNER */}
      <section className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-850 p-8 sm:p-12 md:p-16 text-center md:text-left grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Background visuals */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_40%)] pointer-events-none" />

          <div className="md:col-span-8 space-y-4 z-10">
            <span className="text-primary-400 font-bold text-sm uppercase tracking-wider">{th('vendor_eyebrow')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{th('vendor_title')}</h2>
            <p className="text-slate-350 max-w-2xl text-sm sm:text-base">
              {th('vendor_desc')}
            </p>
          </div>

          <div className="md:col-span-4 flex justify-center md:justify-end z-10">
            <Link
              href={`/${locale}/register`}
              className={cn(
                buttonVariants({ size: 'lg' }),
                "rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold px-8 shadow-lg shadow-white/5 flex items-center justify-center"
              )}
            >
              <span>{th('vendor_cta')}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
