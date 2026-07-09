// src/app/[locale]/account/settings/sections/PreferencesSection.tsx
// Client-only preferences: language (next-intl) and theme (next-themes). No API.

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';

import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function PreferencesSection(): React.JSX.Element {
  const t = useTranslations('profile');

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
        <SlidersHorizontal className="h-5 w-5 text-indigo-500" />
        {t('preferences')}
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t('preferences_subtitle')}</p>

      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('language')}</span>
          <LanguageSwitcher />
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('theme')}</span>
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
}
