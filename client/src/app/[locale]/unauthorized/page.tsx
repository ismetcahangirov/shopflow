// src/app/[locale]/unauthorized/page.tsx
// Shown when a user lacks the required role to view a page

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Unauthorized',
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage(): React.JSX.Element {
  const t = useTranslations('auth');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.06),transparent_60%)]" />

      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-900/30 mb-6">
        <ShieldOff className="h-10 w-10 text-red-500 dark:text-red-400" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {t('unauthorized')}
      </h1>
      <p className="mt-3 max-w-sm text-base text-slate-500 dark:text-slate-400">
        {t('unauthorized_desc')}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          Ana səhifə
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Fərqli hesabla daxil ol
        </Link>
      </div>
    </div>
  );
}
