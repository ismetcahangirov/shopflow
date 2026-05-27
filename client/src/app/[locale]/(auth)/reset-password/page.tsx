// src/app/[locale]/(auth)/reset-password/page.tsx
// Reset password page: reads token from URL search params, submits new password

'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowLeft, AlertCircle, XCircle } from 'lucide-react';

import { resetPasswordSchema, type ResetPasswordInput } from '@/shared/schemas/auth';
import { useResetPassword } from '@/hooks/useAuth';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

const ERROR_MAP: Record<string, string> = {
  password_required: 'password_required',
  password_min_length: 'password_min_length',
  password_mismatch: 'password_mismatch',
};

export default function ResetPasswordPage(): React.JSX.Element {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutate: resetPassword, isPending, isError, error } = useResetPassword();

  const onSubmit = (data: ResetPasswordInput): void => {
    if (!token) return;
    resetPassword({ ...data, token });
  };

  // No token in URL
  if (!token) {
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
            Sıfırlama linki tapılmadı. Yenidən şifrə sıfırlama tələbi göndərin.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          {t('send_reset_link')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t('reset_password')}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Yeni şifrənizi daxil edin. Şifrə ən azı 8 simvol olmalıdır.
        </p>
      </div>

      {/* API error */}
      {isError && error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{(error as Error).message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <FormField
          label={t('new_password')}
          htmlFor="reset-password"
          type="password"
          autoComplete="new-password"
          required
          leadingIcon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          hint="Ən azı 8 simvol"
          error={
            errors.password?.message
              ? t(ERROR_MAP[errors.password.message] ?? errors.password.message)
              : undefined
          }
          {...register('password')}
        />

        <FormField
          label={t('confirm_new_password')}
          htmlFor="reset-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          leadingIcon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          error={
            errors.confirmPassword?.message
              ? t(ERROR_MAP[errors.confirmPassword.message] ?? errors.confirmPassword.message)
              : undefined
          }
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-all"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t('checking')}
            </span>
          ) : (
            t('reset_password')
          )}
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back_to_login')}
      </Link>
    </div>
  );
}
