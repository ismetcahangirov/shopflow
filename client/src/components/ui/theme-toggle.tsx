// src/components/ui/theme-toggle.tsx
// Header control that flips between light and dark themes via next-themes (issue #55)

'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ThemeToggle(): React.JSX.Element {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations('common');
  const [mounted, setMounted] = React.useState(false);

  // The theme is only known on the client. Until mounted, render the same
  // markup the server produced (Moon) so hydration doesn't mismatch.
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('toggle_theme')}
      title={t('toggle_theme')}
      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
