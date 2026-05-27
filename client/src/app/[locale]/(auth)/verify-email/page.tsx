// src/app/[locale]/(auth)/verify-email/page.tsx
// Email verification page: reads token from URL, calls backend, shows success/error state

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

import { useVerifyEmail } from '@/hooks/useAuth';

export default function VerifyEmailPage(): React.JSX.Element {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const { mutate: verify, isPending, isSuccess, isError, error } = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verify({ token });
    }
  }, [token, verify]);

  // No token in URL
  if (!token) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
          <Mail className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('verify_email_title')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('verify_email_desc')}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('verify_email_title')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('checking')}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('verify_email_success')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Hesabınız təsdiqləndi. İndi daxil ola bilərsiniz.
          </p>
        </div>
        <Link
          href="/login"
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
        >
          {t('login_now')}
        </Link>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('verify_email_invalid')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {(error as Error).message}
          </p>
        </div>
        <Link
          href="/login"
          className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {t('back_to_login')}
        </Link>
      </div>
    );
  }

  return <></>;
}
