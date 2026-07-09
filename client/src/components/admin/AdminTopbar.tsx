// src/components/admin/AdminTopbar.tsx
// Admin topbar: sidebar trigger, route breadcrumbs, ⌘K command palette launcher,
// theme + language switchers, and a user dropdown (profile / logout).

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LogOut, Search, User as UserIcon } from 'lucide-react';

import { adminNavItems } from '@/config/navItems';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminCommandPalette } from './AdminCommandPalette';

export interface BreadcrumbEntry {
  href: string;
  labelKey: string | null;
  raw: string;
}

/** Build cumulative breadcrumb entries from a locale-prefixed pathname. */
export function adminBreadcrumbItems(pathname: string, locale: string): BreadcrumbEntry[] {
  const prefix = `/${locale}`;
  let path = pathname;
  if (path === prefix) path = '/';
  else if (path.startsWith(`${prefix}/`)) path = path.slice(prefix.length);

  const segments = path.split('/').filter(Boolean);
  const items: BreadcrumbEntry[] = [];
  let href = '';
  for (const seg of segments) {
    href += `/${seg}`;
    const match = adminNavItems.find((i) => i.href === href);
    items.push({ href, labelKey: match ? match.label : null, raw: seg });
  }
  return items;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AdminTopbar(): React.JSX.Element {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  const crumbs = adminBreadcrumbItems(pathname, locale);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="text-muted-foreground" />
      <Separator orientation="vertical" className="mr-1 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const label = crumb.labelKey ? t(crumb.labelKey) : titleCase(crumb.raw);
            const isLast = index === crumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem className={isLast ? undefined : 'hidden md:block'}>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={`/${locale}${crumb.href}`} />}>
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPaletteOpen(true)}
          className="gap-2 text-muted-foreground"
          aria-label={tAdmin('search')}
        >
          <Search className="size-4" />
          <span className="hidden sm:inline">{tAdmin('search')}</span>
          <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </Button>

        <ThemeToggle />
        <LanguageSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={tAdmin('user_menu.account')}
            className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="grid leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href={`/${locale}/account/settings`} />}>
              <UserIcon className="size-4" />
              {tAdmin('user_menu.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void logout();
              }}
            >
              <LogOut className="size-4" />
              {tAdmin('user_menu.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AdminCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
