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
  ShoppingBag as CartIcon,
  Heart
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useRole } from '@/hooks/useRole';
import { LanguageSwitcher } from './LanguageSwitcher';
import { shopNavItems } from '@/config/navItems';
import { useCategoriesQuery } from '@/hooks/useCategories';
import { useEffect } from 'react';

export function Navbar(): React.JSX.Element {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  
  const { user, logout, isHydrated } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, openCart } = useUiStore();
  const { isAdmin, isVendor, isAuthenticated } = useRole();
  const { cart, fetchCart, isHydrated: isCartHydrated } = useCartStore();
  const { likedIds, isHydrated: isWishlistHydrated } = useWishlistStore();
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Category dropdown state
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  
  const { data: categories } = useCategoriesQuery();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

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
            {shopNavItems.map((item) => {
              if (item.href === '/categories') {
                const activeParent = categories?.find(c => c.id === activeParentId) || categories?.[0];
                return (
                  <div
                    key={item.href}
                    className="relative group py-1.5"
                    onMouseEnter={() => {
                      setCategoriesOpen(true);
                      if (categories && categories.length > 0 && !activeParentId) {
                        setActiveParentId(categories[0].id);
                      }
                    }}
                    onMouseLeave={() => {
                      setCategoriesOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      className={[
                        'flex items-center gap-1 text-sm font-semibold tracking-wide transition-colors focus:outline-none',
                        isActive(item.href) || categoriesOpen
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
                      ].join(' ')}
                    >
                      {t(item.label)}
                      <ChevronDown className={['h-4 w-4 transition-transform duration-200', categoriesOpen ? 'rotate-180' : ''].join(' ')} />
                    </button>
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    )}

                    {/* Premium Categories Dropdown Flyout */}
                    {categoriesOpen && categories && categories.length > 0 && (
                      <div className="absolute left-0 mt-3 w-[560px] origin-top-left rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-xl backdrop-blur-lg dark:border-slate-800/80 dark:bg-slate-950/95 z-50 flex gap-6 animate-in fade-in slide-in-from-top-3 duration-200">
                        {/* Parent Categories Column */}
                        <div className="w-1/2 border-r border-slate-100 dark:border-slate-800/60 pr-4 flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          <p className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-2 mb-1">
                            {t('nav_categories')}
                          </p>
                          {categories
                            .filter(c => c.parentId === null && c.isActive !== false)
                            .map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onMouseEnter={() => setActiveParentId(cat.id)}
                                className={[
                                  'w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none',
                                  activeParentId === cat.id
                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/50 dark:hover:text-white',
                                ].join(' ')}
                              >
                                <span>{cat.name}</span>
                                <ChevronDown className="-rotate-90 h-3.5 w-3.5 opacity-60" />
                              </button>
                            ))}
                        </div>

                        {/* Child Categories Column */}
                        <div className="w-1/2 pl-2 flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {activeParent ? (
                            <>
                              <Link
                                href={`/${locale}/category/${activeParent.slug}`}
                                onClick={() => setCategoriesOpen(false)}
                                className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline px-2 flex items-center gap-1.5 focus:outline-none"
                              >
                                {t('all_products_in')} &ldquo;{activeParent.name}&rdquo; &rarr;
                              </Link>
                              
                              <div className="flex flex-col gap-1">
                                {activeParent.children && activeParent.children.filter(c => c.isActive !== false).length > 0 ? (
                                  activeParent.children
                                    .filter(c => c.isActive !== false)
                                    .map((child) => (
                                      <Link
                                        key={child.id}
                                        href={`/${locale}/category/${child.slug}`}
                                        onClick={() => setCategoriesOpen(false)}
                                        className="px-2 py-1.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all focus:outline-none"
                                      >
                                        {child.name}
                                      </Link>
                                    ))
                                ) : (
                                  <span className="text-xs text-slate-400 dark:text-slate-500 px-2 py-4 italic">
                                    Alt kateqoriya yoxdur
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-slate-400 dark:text-slate-500 italic">
                              Kateqoriya seçin
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
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
              );
            })}
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

          {/* Wishlist Icon */}
          <Link
            href={`/${locale}/wishlist`}
            data-testid="wishlist-icon"
            className="relative p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-all duration-200 focus:outline-none hidden sm:block"
            aria-label={t('wishlist')}
          >
            <Heart className="h-5 w-5" />
            {isWishlistHydrated && likedIds.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
                {likedIds.length}
              </span>
            )}
          </Link>

          {/* Cart Icon Trigger */}
          <button
            type="button"
            onClick={openCart}
            data-testid="cart-icon"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900 transition-all duration-200 focus:outline-none"
            aria-label="Shopping Cart"
          >
            <CartIcon className="h-5 w-5" />
            {isCartHydrated && cart && cart.itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950 animate-pulse">
                {cart.itemCount}
              </span>
            )}
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
