// src/components/auth/AuthDivider.tsx
// "or" separator used between form and Google OAuth button

import React from 'react';
import { useTranslations } from 'next-intl';

export default function AuthDivider(): React.JSX.Element {
  const t = useTranslations('auth');

  return (
    <div className="relative flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/60" />
      <span className="shrink-0 text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {t('or_continue_with')}
      </span>
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/60" />
    </div>
  );
}
