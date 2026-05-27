// src/app/[locale]/(auth)/register/page.tsx
// Register page: role selector (CUSTOMER/VENDOR), full form with Zod validation

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Store, Phone, AlertCircle, ShoppingCart, Package } from 'lucide-react';

import { registerSchema, type RegisterInput } from '@/shared/schemas/auth';
import { useRegister } from '@/hooks/useAuth';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import AuthDivider from '@/components/auth/AuthDivider';
import { cn } from '@/lib/utils';

const FIELD_ERROR_MAP: Record<string, string> = {
  email_required: 'email_required',
  email_invalid: 'email_invalid',
  password_required: 'password_required',
  password_min_length: 'password_min_length',
  password_mismatch: 'password_mismatch',
  name_required: 'name_required',
  store_name_required: 'store_name_required',
  phone_invalid: 'phone_invalid',
  role_invalid: 'role_invalid',
};

type Role = 'CUSTOMER' | 'VENDOR';

interface RoleCardProps {
  value: Role;
  label: string;
  hint: string;
  icon: React.ElementType;
  selected: boolean;
  onSelect: (role: Role) => void;
}

function RoleCard({ value, label, hint, icon: Icon, selected, onSelect }: RoleCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200',
        selected
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
          selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={cn('text-sm font-semibold', selected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200')}>{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</p>
      </div>
      {/* Selection indicator */}
      <div className={cn('h-1.5 w-1.5 rounded-full transition-all', selected ? 'bg-indigo-500' : 'bg-transparent')} />
    </button>
  );
}

export default function RegisterPage(): React.JSX.Element {
  const t = useTranslations('auth');
  const [oauthError, setOauthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CUSTOMER' },
  });

  const selectedRole = watch('role');

  const { mutate: registerUser, isPending, isError, error } = useRegister();

  const onSubmit = (data: RegisterInput): void => {
    setOauthError(null);
    registerUser(data);
  };

  const resolveError = (key?: string): string | undefined =>
    key ? t(FIELD_ERROR_MAP[key] ?? key) : undefined;

  const apiError = isError && error ? (error as Error).message : oauthError;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t('create_account')}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{t('register_subtitle')}</p>
      </div>

      {/* API error */}
      {apiError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Role selector */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('role')}</span>
        <div className="flex gap-3">
          <RoleCard
            value="CUSTOMER"
            label={t('role_customer')}
            hint={t('role_hint_customer')}
            icon={ShoppingCart}
            selected={selectedRole === 'CUSTOMER'}
            onSelect={(role) => setValue('role', role)}
          />
          <RoleCard
            value="VENDOR"
            label={t('role_vendor')}
            hint={t('role_hint_vendor')}
            icon={Package}
            selected={selectedRole === 'VENDOR'}
            onSelect={(role) => setValue('role', role)}
          />
        </div>
        {errors.role?.message && (
          <p className="text-xs text-red-500">{resolveError(errors.role.message)}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField
          label={t('full_name')}
          htmlFor="reg-name"
          type="text"
          autoComplete="name"
          required
          leadingIcon={<User className="h-4 w-4" />}
          placeholder="Anar Məmmədov"
          error={resolveError(errors.name?.message)}
          {...register('name')}
        />

        <FormField
          label={t('email')}
          htmlFor="reg-email"
          type="email"
          autoComplete="email"
          required
          leadingIcon={<Mail className="h-4 w-4" />}
          placeholder="email@example.com"
          error={resolveError(errors.email?.message)}
          {...register('email')}
        />

        <FormField
          label={t('password')}
          htmlFor="reg-password"
          type="password"
          autoComplete="new-password"
          required
          leadingIcon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          hint="Ən azı 8 simvol"
          error={resolveError(errors.password?.message)}
          {...register('password')}
        />

        <FormField
          label={t('confirm_password')}
          htmlFor="reg-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          leadingIcon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          error={resolveError(errors.confirmPassword?.message)}
          {...register('confirmPassword')}
        />

        {/* VENDOR only fields */}
        {selectedRole === 'VENDOR' && (
          <>
            <FormField
              label={t('store_name')}
              htmlFor="reg-store-name"
              type="text"
              required
              leadingIcon={<Store className="h-4 w-4" />}
              placeholder="Mağazanın adı"
              error={resolveError(errors.storeName?.message)}
              {...register('storeName')}
            />
            <FormField
              label={t('phone')}
              htmlFor="reg-phone"
              type="tel"
              autoComplete="tel"
              leadingIcon={<Phone className="h-4 w-4" />}
              placeholder="+994 50 123 45 67"
              hint="İstəyə bağlı"
              error={resolveError(errors.phone?.message)}
              {...register('phone')}
            />
          </>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="mt-1 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-all"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t('checking')}
            </span>
          ) : (
            t('register_now')
          )}
        </Button>
      </form>

      <AuthDivider />
      <GoogleAuthButton onError={setOauthError} />

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {t('already_have_account')}{' '}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          {t('login_now')}
        </Link>
      </p>
    </div>
  );
}
