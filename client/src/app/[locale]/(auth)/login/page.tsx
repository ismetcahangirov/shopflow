// src/app/[locale]/(auth)/login/page.tsx
// Login page: email/password form + Google OAuth + post-register success banner

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

import { loginSchema, type LoginInput } from '@/shared/schemas/auth';
import { useLogin } from '@/hooks/useAuth';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import AuthDivider from '@/components/auth/AuthDivider';

// Schema validation error key → i18n key mapping
const ERROR_KEY_MAP: Record<string, string> = {
  email_required: 'email_required',
  email_invalid: 'email_invalid',
  password_required: 'password_required',
};

export default function LoginPage(): React.JSX.Element {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const registeredEmail = searchParams.get('email');
  const wasRegistered = searchParams.get('registered') === '1';
  const wasReset = searchParams.get('reset') === '1';

  const [oauthError, setOauthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: registeredEmail ?? '', password: '' },
  });

  // Pre-fill email from redirect
  useEffect(() => {
    if (registeredEmail) setValue('email', registeredEmail);
  }, [registeredEmail, setValue]);

  const { mutate: login, isPending, isError, error } = useLogin();

  const onSubmit = (data: LoginInput): void => {
    setOauthError(null);
    login(data);
  };

  const errorMessage = isError && error ? (error as Error).message : oauthError;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t('welcome_back')}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{t('login_subtitle')}</p>
      </div>

      {/* Post-register success banner */}
      {wasRegistered && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t('register_success')}</span>
        </div>
      )}

      {/* Post-reset success banner */}
      {wasReset && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t('reset_password')} uğurla dəyişdirildi!</span>
        </div>
      )}

      {/* Global API error */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <FormField
          label={t('email')}
          htmlFor="login-email"
          type="email"
          autoComplete="email"
          required
          leadingIcon={<Mail className="h-4 w-4" />}
          placeholder="email@example.com"
          error={errors.email?.message ? t(ERROR_KEY_MAP[errors.email.message] ?? 'email_invalid') : undefined}
          {...register('email')}
        />

        <div className="flex flex-col gap-1.5">
          <FormField
            label={t('password')}
            htmlFor="login-password"
            type="password"
            autoComplete="current-password"
            required
            leadingIcon={<Lock className="h-4 w-4" />}
            placeholder="••••••••"
            error={errors.password?.message ? t(ERROR_KEY_MAP[errors.password.message] ?? 'password_required') : undefined}
            {...register('password')}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              {t('forgot_password')}
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-all"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t('checking')}
            </span>
          ) : (
            t('login_now')
          )}
        </Button>
      </form>

      {/* OAuth divider */}
      <AuthDivider />

      {/* Google OAuth */}
      <GoogleAuthButton onError={setOauthError} />

      {/* Register link */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {t('dont_have_account')}{' '}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          {t('register_now')}
        </Link>
      </p>
    </div>
  );
}
