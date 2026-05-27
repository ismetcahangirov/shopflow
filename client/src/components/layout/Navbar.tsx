// src/components/layout/Navbar.tsx
// Premium aesthetic sticky header with localization, cart drawer trigger, and role-based dropdowns

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  ShoppingBag as CartIcon 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { useRole } from '@/hooks/useRole';
import { LanguageSwitcher } from './LanguageSwitcher';
import { shopNavItems } from '@/config/navItems';

export function Navbar(): React.JSX.Element {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  
  const { user, logout, isHydrated } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, openCart } = useUiStore();
  const { isAdmin, isVendor, isAuthenticated } = useRole();
  const [profileOpen, setProfileOpen] = useState(false);

  // Helper to determine if link is active
  const isActive = (href: string) => {
    const localizedHref = `/${locale}${href === '/' ? '' : href}`;
    return pathname === localizedHref || (href !== '/' && pathname.startsWith(localizedHref));
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left Side: Brand Logo & Navigation Link Group */}
        <div className="flex items-center gap-8">
          <Link 
            href={`/${locale}`} 
            className="flex items-center gap-2 group focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-xl font-black tracking-tight text-transparent dark:from-white dark:to-slate-200">
              Shop<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {shopNavItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href === '/' ? '' : item.href}`}
                className={[
                  'relative text-sm font-semibold tracking-wide transition-colors py-1.5 focus:outline-none',
                  isActive(item.href)
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-250',
                ].join(' ')}
              >
                {t(item.label)}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side: Global controls (Search, Cart, Locale, Profile, Menu Toggle) */}
        <div className="flex items-center gap-3">
          
          {/* Mock Search Bar Trigger */}
          <button
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900 transition-all duration-200 hidden sm:block focus:outline-none"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Cart Icon Trigger */}
          <button
            type="button"
            onClick={openCart}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900 transition-all duration-200 focus:outline-none"
            aria-label="Shopping Cart"
          >
            <CartIcon className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950 animate-pulse">
              3
            </span>
          </button>

          {/* Profile Dropdown or Auth Button */}
          <div className="relative">
            {isHydrated && isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200/80 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850 transition-all focus:outline-none"
                  aria-expanded={profileOpen}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-card-lg dark:border-slate-850 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 mb-1">
                        <p className="text-xs text-slate-400 dark:text-slate-500">Hesab</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-450 truncate">{user?.email}</p>
                      </div>

                      {/* Role Dashboard buttons */}
                      {isAdmin && (
                        <Link
                          href={`/${locale}/admin`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold transition-all duration-205"
                        >
                          <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                          <span>Admin Paneli</span>
                        </Link>
                      )}

                      {isVendor && (
                        <Link
                          href={`/${locale}/vendor`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold transition-all duration-205"
                        >
                          <LayoutDashboard className="h-4 w-4 text-purple-500" />
                          <span>Satıcı Paneli</span>
                        </Link>
                      )}

                      <Link
                        href={`/${locale}/account/orders`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold transition-all duration-205"
                      >
                        <ShoppingBag className="h-4 w-4 text-slate-500" />
                        <span>Sifarişlərim</span>
                      </Link>

                      <Link
                        href={`/${locale}/account/settings`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold transition-all duration-205"
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        <span>Ayarlar</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/30 font-semibold transition-all duration-205 border-t border-slate-50 dark:border-slate-800/40 mt-1 focus:outline-none"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Çıxış</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="hidden sm:inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm transition-all focus:outline-none"
              >
                {t('login')}
              </Link>
            )}
          </div>

          {/* Mobile Sidebar Toggle Hamburger */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-850 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900 md:hidden transition-all duration-200 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>
    </header>
  );
}
