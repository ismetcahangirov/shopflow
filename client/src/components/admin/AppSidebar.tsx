// src/components/admin/AppSidebar.tsx
// Collapsible admin sidebar (shadcn Sidebar) with grouped, locale-aware nav,
// an icon rail with tooltips, mobile Sheet behaviour, and a user/logout footer.

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LogOut, Shield } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { adminNavItems, adminNavGroups, type NavItem } from '@/config/navItems';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

/** Locale-aware active check: exact match for `/admin`, prefix match otherwise. */
export function isNavItemActive(href: string, pathname: string, locale: string): boolean {
  const localized = `/${locale}${href}`;
  if (href === '/admin') return pathname === localized;
  return pathname === localized || pathname.startsWith(`${localized}/`);
}

/** Group the flat admin nav config into ordered `{ group, items }` sections. */
export function groupAdminNav(items: NavItem[]): { group: string; items: NavItem[] }[] {
  return adminNavGroups
    .map((group) => ({ group, items: items.filter((i) => i.group === group) }))
    .filter((section) => section.items.length > 0);
}

export function AppSidebar(): React.JSX.Element {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const sections = React.useMemo(() => groupAdminNav(adminNavItems), []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="ShopFlow"
              render={<Link href={`/${locale}/admin`} />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-bold">ShopFlow</span>
                <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.group}>
            <SidebarGroupLabel>{tAdmin(`groups.${section.group}`)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isNavItemActive(item.href, pathname, locale);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={t(item.label)}
                        render={<Link href={`/${locale}${item.href}`} />}
                      >
                        <Icon />
                        <span>{t(item.label)}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">{user?.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={tAdmin('user_menu.logout')}
              onClick={() => {
                void logout();
              }}
            >
              <LogOut />
              <span>{tAdmin('user_menu.logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
