// src/components/layout/VendorSidebar.tsx
// Dashboard navigation sidebar for Vendor store manager workspace

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { LogOut, Store } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { vendorNavItems } from '@/config/navItems';

export function VendorSidebar(): React.JSX.Element {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const isActive = (href: string) => {
    const localizedHref = `/${locale}${href}`;
    return pathname === localizedHref || (href !== '/vendor' && pathname.startsWith(localizedHref));
  };

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-4 dark:border-slate-850 dark:bg-slate-950 md:flex md:flex-col justify-between transition-colors duration-300">
      
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">ShopFlow</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Satıcı Paneli</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {vendorNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={[
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200',
                  active
                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 shadow-sm'
                    : 'text-slate-655 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-100',
                ].join(' ')}
              >
                <Icon className={['h-5 w-5 shrink-0 transition-colors', active ? 'text-purple-500' : 'text-slate-400'].join(' ')} />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
        {/* Vendor Info */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs">
            {user?.name ? user.name[0].toUpperCase() : 'V'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.storeName || user?.name}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/20 transition-all duration-200 focus:outline-none"
        >
          <LogOut className="h-5 w-5 text-rose-500 shrink-0" />
          <span>Çıxış</span>
        </button>
      </div>

    </aside>
  );
}
