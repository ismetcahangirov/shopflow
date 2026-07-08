// src/app/not-found.tsx
// Global 404 fallback for requests that never reach a locale layout — most
// importantly when [locale]/layout.tsx itself throws notFound() for an invalid
// locale, before it can render <html>/<body>. The root layout (app/layout.tsx)
// only passes children through, so this file MUST render its own <html>/<body>.
// Otherwise React appends a bare <div> to <#document> and the whole tree crashes
// with "Only one element on document allowed" (issue #50).
//
// This runs outside NextIntlClientProvider, so translations aren't available
// here; the copy is kept short and bilingual. Localized 404s (the common case)
// are handled by app/[locale]/not-found.tsx instead.

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Səhifə tapılmadı — ShopFlow',
  robots: { index: false, follow: false },
};

export default function GlobalNotFound(): React.JSX.Element {
  return (
    <html lang="az" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50/50 font-sans antialiased dark:bg-slate-950">
        <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
          <p className="text-6xl font-black tracking-tighter text-indigo-600 sm:text-7xl">404</p>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Səhifə tapılmadı
          </h1>
          <p className="mt-3 max-w-md text-base text-slate-500 dark:text-slate-400">
            Axtardığınız səhifə mövcud deyil və ya ünvan yanlışdır.
            <br />
            <span className="text-sm text-slate-400 dark:text-slate-500">
              The page you requested could not be found.
            </span>
          </p>

          <Link
            href="/az"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Ana səhifəyə qayıt
          </Link>
        </main>
      </body>
    </html>
  );
}
