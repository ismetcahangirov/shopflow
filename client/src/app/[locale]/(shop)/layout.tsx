// src/app/[locale]/(shop)/layout.tsx
// Public storefront layout rendering header, footer, bottom navigation, and mobile menu drawer

'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { X, ShoppingBag } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomTabs } from '@/components/layout/BottomTabs';
import { useUiStore } from '@/store/uiStore';
import { shopNavItems } from '@/config/navItems';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps): React.JSX.Element {
  const t = useTranslations('common');
  const locale = useLocale();
  const { isSidebarOpen, closeSidebar } = useUiStore();

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Global storefront Navigation */}
      <Navbar />

      {/* Main Layout Content Area */}
      <main className="flex-1 flex flex-col pt-4">
        {children}
      </main>

      {/* Global site Footer */}
      <Footer />

      {/* Mobile view quick action tabs */}
      <BottomTabs />

      {/* Mobile Offcanvas Drawer Menu */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={closeSidebar} 
          />
          {/* Menu Drawer */}
          <div className="fixed inset-y-0 right-0 z-50 w-72 bg-white p-6 shadow-2xl dark:bg-slate-905 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <Link href={`/${locale}`} onClick={closeSidebar} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-650 text-white">
                    <ShoppingBag className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white">ShopFlow</span>
                </Link>
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="flex flex-col gap-3">
                {shopNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href === '/' ? '' : item.href}`}
                    onClick={closeSidebar}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-900 transition-all duration-200"
                  >
                    <item.icon className="h-4.5 w-4.5 text-slate-400" />
                    <span>{t(item.label)}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>
              <p className="text-[10px] text-center text-slate-400">© ShopFlow. All rights reserved.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
