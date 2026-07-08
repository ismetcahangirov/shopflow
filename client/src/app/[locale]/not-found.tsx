// src/app/[locale]/not-found.tsx
// Localized 404 page. Rendered inside [locale]/layout.tsx, which already supplies
// <html>/<body> and NextIntlClientProvider — so this file must NOT render its own
// document tags. Emitting a bare <div> under <#document> without that wrapper is
// exactly what crashed hydration before (issue #50).

'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Compass, Home, ShoppingBag } from 'lucide-react';

export default function LocaleNotFound(): React.JSX.Element {
  const t = useTranslations('notFound');
  const locale = useLocale();

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.07),transparent_60%)]" />

      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 dark:bg-indigo-900/30">
        <Compass className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
      </div>

      <p className="text-6xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400 sm:text-7xl">
        404
      </p>

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        {t('title')}
      </h1>
      <p className="mt-3 max-w-sm text-base text-slate-500 dark:text-slate-400">
        {t('description')}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          {t('back_home')}
        </Link>
        <Link
          href={`/${locale}/products`}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ShoppingBag className="h-4 w-4" />
          {t('browse_products')}
        </Link>
      </div>
    </div>
  );
}
