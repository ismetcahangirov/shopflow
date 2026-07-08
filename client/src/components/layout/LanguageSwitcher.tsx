// src/components/layout/LanguageSwitcher.tsx
// Locale switcher dropdown using next-intl routing

'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LOCALES = [
  { code: 'az', label: 'AZ', name: 'Azərbaycan' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
] as const;

type LocaleCode = (typeof LOCALES)[number]['code'];

export function LanguageSwitcher(): React.JSX.Element {
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    const handlePointer = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const switchLocale = (next: LocaleCode): void => {
    setOpen(false);
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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={[
          'flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/60 px-2.5 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur-sm transition-all hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:text-white',
          isPending ? 'opacity-50' : '',
        ].join(' ')}
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span>{current.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700/60 dark:bg-slate-800"
        >
          {LOCALES.map(({ code, label, name }) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => switchLocale(code)}
                  className={[
                    'flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-2">
                    <span className={active ? 'text-white/70' : 'text-slate-400'}>{label}</span>
                    <span>{name}</span>
                  </span>
                  {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
