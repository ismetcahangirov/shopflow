// src/app/[locale]/(auth)/forgot-password/page.tsx
// Forgot password page: sends reset link email

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react';

import { forgotPasswordSchema, type ForgotPasswordInput } from '@/shared/schemas/auth';
import { useForgotPassword } from '@/hooks/useAuth';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage(): React.JSX.Element {
  const t = useTranslations('auth');
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutate: sendReset, isPending, isError, error } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordInput): void => {
    sendReset(data, {
      onSuccess: () => {
        setSubmittedEmail(data.email);
        setSubmitted(true);
      },
    });
  };

  // Success state
  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('reset_link_sent')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">{submittedEmail}</strong> ünvanına
            şifrə sıfırlama linki göndərildi. E-poçtunuzu yoxlayın.
          </p>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back_to_login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
          <Send className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t('forgot_password')}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          E-poçt ünvanınızı daxil edin, şifrə sıfırlama linki göndərək.
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
          label={t('email')}
          htmlFor="forgot-email"
          type="email"
          autoComplete="email"
          required
          leadingIcon={<Mail className="h-4 w-4" />}
          placeholder="email@example.com"
          error={
            errors.email?.message === 'email_required'
              ? t('email_required')
              : errors.email?.message
                ? t('email_invalid')
                : undefined
          }
          {...register('email')}
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
            t('send_reset_link')
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
