// src/app/[locale]/(shop)/layout.tsx
// Public storefront layout rendering header, footer, bottom navigation, and mobile menu drawer

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { X, ShoppingBag, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomTabs } from '@/components/layout/BottomTabs';
import { useUiStore } from '@/store/uiStore';
import { shopNavItems } from '@/config/navItems';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { useCategoriesQuery } from '@/hooks/useCategories';

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps): React.JSX.Element {
  const t = useTranslations('common');
  const locale = useLocale();
  const { isSidebarOpen, closeSidebar } = useUiStore();
  
  // Mobile accordion state
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const { data: categories } = useCategoriesQuery();

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
              <nav className="flex flex-col gap-2">
                {shopNavItems.map((item) => {
                  if (item.href === '/categories') {
                    return (
                      <div key={item.href} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => setMobileCatsOpen(!mobileCatsOpen)}
                          className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-900 transition-all duration-200 focus:outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4.5 w-4.5 text-slate-400" />
                            <span>{t(item.label)}</span>
                          </div>
                          <ChevronDown className={['h-4 w-4 transition-transform duration-250 opacity-60', mobileCatsOpen ? 'rotate-180' : ''].join(' ')} />
                        </button>
                        
                        {/* Expandable Categories List */}
                        {mobileCatsOpen && categories && categories.length > 0 && (
                          <div className="pl-6 pr-2 py-1 flex flex-col gap-1.5 border-l border-slate-100 dark:border-slate-800/70 ml-6 mt-1 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            {categories
                              .filter(c => c.parentId === null && c.isActive !== false)
                              .map((cat) => (
                                <div key={cat.id} className="flex flex-col gap-1">
                                  <Link
                                    href={`/${locale}/category/${cat.slug}`}
                                    onClick={closeSidebar}
                                    className="px-2 py-1.5 rounded-lg text-xs font-bold text-slate-800 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
                                  >
                                    {cat.name}
                                  </Link>
                                  
                                  {/* Subcategories (level 2) */}
                                  {cat.children && cat.children.filter(c => c.isActive !== false).length > 0 && (
                                    <div className="pl-3 flex flex-col gap-1 border-l border-slate-50 dark:border-slate-850">
                                      {cat.children
                                        .filter(c => c.isActive !== false)
                                        .map((child) => (
                                          <Link
                                            key={child.id}
                                            href={`/${locale}/category/${child.slug}`}
                                            onClick={closeSidebar}
                                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-white transition-colors"
                                          >
                                            {child.name}
                                          </Link>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={`/${locale}${item.href === '/' ? '' : item.href}`}
                      onClick={closeSidebar}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-900 transition-all duration-200"
                    >
                      <item.icon className="h-4.5 w-4.5 text-slate-400" />
                      <span>{t(item.label)}</span>
                    </Link>
                  );
                })}
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
