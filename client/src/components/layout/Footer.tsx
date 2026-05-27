// src/components/layout/Footer.tsx
// Premium aesthetic site footer with navigation groups, localization, and newsletter signup mockup

'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ShoppingBag } from 'lucide-react';

export function Footer(): React.JSX.Element {
  const t = useTranslations('common');
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-850 dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:py-16 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-2 group focus:outline-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-lg font-black tracking-tight text-transparent dark:from-white dark:to-slate-200">
                Shop<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {t('site_desc')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors shadow-sm" aria-label="Facebook">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors shadow-sm" aria-label="Instagram">
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors shadow-sm" aria-label="Twitter">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Group */}
          <div className="grid grid-cols-2 gap-8 md:col-span-5">
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Shop</h4>
              <ul className="space-y-2">
                <li>
                  <Link href={`/${locale}/products`} className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 transition-colors font-medium">
                    {t('nav_products')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/categories`} className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 transition-colors font-medium">
                    {t('nav_categories')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link href={`/${locale}/login`} className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 transition-colors font-medium">
                    {t('login')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/register`} className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 transition-colors font-medium">
                    {t('register')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Məlumat bülleteni</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Yeniliklərdən və endirimlərdən xəbərdar olmaq üçün abunə olun.</p>
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2">
              <input
                type="email"
                placeholder="E-poçtunuz..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 focus:outline-none transition-all duration-200"
              />
              <button
                type="button"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-xs px-4 py-2 shrink-0 transition-colors shadow-sm focus:outline-none"
              >
                Abunə ol
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-850 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-550 dark:text-slate-400">
          <p>© {currentYear} {t('site_name')}. {t('all_rights_reserved')}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-100 transition-colors">Qaydalar və Şərtlər</a>
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-100 transition-colors">Məxfilik Siyasəti</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
