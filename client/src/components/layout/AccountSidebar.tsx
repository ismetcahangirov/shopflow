// src/components/layout/AccountSidebar.tsx
// Account section sub-navigation: vertical sidebar on desktop, horizontal scroller on mobile.

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { accountNavItems } from '@/config/navItems';

export function AccountSidebar(): React.JSX.Element {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();

  const isActive = (href: string) => {
    const localizedHref = `/${locale}${href}`;
    return pathname === localizedHref || pathname.startsWith(`${localizedHref}/`);
  };

  return (
    <>
      {/* Desktop vertical sidebar */}
      <aside className="hidden shrink-0 md:block md:w-60">
        <nav className="sticky top-20 space-y-1 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          {accountNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200',
                  active
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
                ].join(' ')}
              >
                <Icon className={['h-5 w-5 shrink-0 transition-colors', active ? 'text-indigo-500' : 'text-slate-400'].join(' ')} />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile horizontal scroller */}
      <nav className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
        {accountNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={[
                'flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                active
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
              ].join(' ')}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
