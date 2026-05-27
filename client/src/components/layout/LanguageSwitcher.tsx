// src/components/layout/LanguageSwitcher.tsx
// Locale switcher dropdown using next-intl routing

'use client';

import React, { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

const LOCALES = [
  { code: 'az', label: 'AZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
] as const;

type LocaleCode = (typeof LOCALES)[number]['code'];

export function LanguageSwitcher(): React.JSX.Element {
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: LocaleCode): void => {
    if (next === locale) return;

    // Replace the current locale prefix in the pathname
    const segments = pathname.split('/');
    segments[1] = next;
    const newPath = segments.join('/');

    startTransition(() => {
      router.replace(newPath);
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/60 p-1 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60">
      <Globe className="ml-1.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          disabled={isPending}
          onClick={() => switchLocale(code)}
          aria-pressed={locale === code}
          className={[
            'rounded-lg px-2 py-1 text-xs font-semibold transition-all',
            locale === code
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
            isPending ? 'opacity-50' : '',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
