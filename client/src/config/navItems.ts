// src/config/navItems.ts
// Role-based navigation items for Navbar, AppSidebar, VendorSidebar

import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Package,
  ShoppingBag,
  Tag,
  BarChart2,
  Users,
  Settings,
  Store,
  ClipboardList,
  Star,
  CreditCard,
  LayoutDashboard,
  TicketPercent,
  MapPin,
  Heart,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * Optional sidebar group key (translated via the `admin` namespace as
   * `groups.<group>`). Used by the admin `AppSidebar` to render grouped nav
   * sections; ignored by sidebars that render a flat list.
   */
  group?: string;
}

/** Public shop navigation links */
export const shopNavItems: NavItem[] = [
  { label: 'nav_home', href: '/', icon: Home },
  { label: 'nav_products', href: '/products', icon: Package },
  { label: 'nav_categories', href: '/categories', icon: Tag },
];

/** Authenticated customer navigation (sidebar/bottom tabs) */
export const customerNavItems: NavItem[] = [
  { label: 'nav_orders', href: '/account/orders', icon: ClipboardList },
  { label: 'nav_reviews', href: '/account/reviews', icon: Star },
  { label: 'nav_payments', href: '/account/payments', icon: CreditCard },
  { label: 'nav_settings', href: '/account/settings', icon: Settings },
];

/** Account section sub-navigation (My Orders, Settings, Addresses, Wishlist) */
export const accountNavItems: NavItem[] = [
  { label: 'nav_orders', href: '/account/orders', icon: ClipboardList },
  { label: 'nav_settings', href: '/account/settings', icon: Settings },
  { label: 'nav_addresses', href: '/profile/addresses', icon: MapPin },
  { label: 'nav_wishlist', href: '/wishlist', icon: Heart },
];

/** Vendor dashboard sidebar navigation */
export const vendorNavItems: NavItem[] = [
  { label: 'nav_dashboard', href: '/vendor', icon: LayoutDashboard },
  { label: 'nav_my_products', href: '/vendor/products', icon: ShoppingBag },
  { label: 'nav_orders', href: '/vendor/orders', icon: ClipboardList },
  { label: 'nav_analytics', href: '/vendor/analytics', icon: BarChart2 },
  { label: 'nav_store_settings', href: '/vendor/settings', icon: Store },
];

/**
 * Admin dashboard sidebar navigation.
 * `group` keys map to `admin.groups.<group>` translations and drive the
 * grouped sections in `AppSidebar`. Order within a group is preserved.
 */
export const adminNavItems: NavItem[] = [
  { label: 'nav_dashboard', href: '/admin', icon: LayoutDashboard, group: 'overview' },
  { label: 'nav_analytics', href: '/admin/analytics', icon: BarChart2, group: 'overview' },
  { label: 'nav_products', href: '/admin/products', icon: Package, group: 'catalog' },
  { label: 'nav_categories', href: '/admin/categories', icon: Tag, group: 'catalog' },
  { label: 'nav_coupons', href: '/admin/coupons', icon: TicketPercent, group: 'catalog' },
  { label: 'nav_orders', href: '/admin/orders', icon: ClipboardList, group: 'sales' },
  { label: 'nav_users', href: '/admin/users', icon: Users, group: 'people' },
  { label: 'nav_vendors', href: '/admin/vendors', icon: Store, group: 'people' },
  { label: 'nav_reviews', href: '/admin/reviews', icon: Star, group: 'people' },
  { label: 'nav_settings', href: '/admin/settings', icon: Settings, group: 'system' },
];

/** Ordered admin sidebar group keys (translated via `admin.groups.<key>`). */
export const adminNavGroups = ['overview', 'catalog', 'sales', 'people', 'system'] as const;
