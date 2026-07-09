// src/components/admin/AdminCommandPalette.tsx
// ⌘K command palette for the admin panel: data-driven from adminNavItems,
// filters by localized label, and navigates (locale-aware) on select.

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { adminNavItems } from '@/config/navItems';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCommandPalette({ open, onOpenChange }: AdminCommandPaletteProps): React.JSX.Element {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');

  const navigate = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(`/${locale}${href}`);
    },
    [router, locale, onOpenChange],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tAdmin('search')}
      description={tAdmin('search_placeholder')}
    >
      <CommandInput placeholder={tAdmin('search_placeholder')} />
      <CommandList>
        <CommandEmpty>{tAdmin('command_empty')}</CommandEmpty>
        <CommandGroup heading={tAdmin('command_pages')}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const label = t(item.label);
            return (
              <CommandItem key={item.href} value={label} onSelect={() => navigate(item.href)}>
                <Icon className="size-4" />
                <span>{label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
