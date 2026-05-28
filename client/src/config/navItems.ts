// src/config/navItems.ts
// Role-based navigation items for Navbar, AdminSidebar, VendorSidebar

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
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
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

/** Vendor dashboard sidebar navigation */
export const vendorNavItems: NavItem[] = [
  { label: 'nav_dashboard', href: '/vendor', icon: LayoutDashboard },
  { label: 'nav_my_products', href: '/vendor/products', icon: ShoppingBag },
  { label: 'nav_orders', href: '/vendor/orders', icon: ClipboardList },
  { label: 'nav_analytics', href: '/vendor/analytics', icon: BarChart2 },
  { label: 'nav_store_settings', href: '/vendor/settings', icon: Store },
];

/** Admin dashboard sidebar navigation */
export const adminNavItems: NavItem[] = [
  { label: 'nav_dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'nav_products', href: '/admin/products', icon: Package },
  { label: 'nav_orders', href: '/admin/orders', icon: ClipboardList },
  { label: 'nav_categories', href: '/admin/categories', icon: Tag },
  { label: 'nav_coupons', href: '/admin/coupons', icon: TicketPercent },
  { label: 'nav_users', href: '/admin/users', icon: Users },
  { label: 'nav_vendors', href: '/admin/vendors', icon: Store },
  { label: 'nav_analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'nav_settings', href: '/admin/settings', icon: Settings },
];
