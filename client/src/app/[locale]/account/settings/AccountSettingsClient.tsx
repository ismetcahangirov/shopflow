// src/app/[locale]/account/settings/AccountSettingsClient.tsx
// Sectioned account settings: profile, security, addresses and preferences.
// Consolidates the former /profile page under the shared /account shell.

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { parseApiError } from '@/lib/api';
import { useMe } from '@/hooks/useUser';
import AddressListClient from '@/app/[locale]/(shop)/profile/addresses/AddressListClient';

import { ProfileSection } from './sections/ProfileSection';
import { SecuritySection } from './sections/SecuritySection';
import { PreferencesSection } from './sections/PreferencesSection';

export default function AccountSettingsClient(): React.JSX.Element {
  const t = useTranslations('profile');
  const { data: user, isLoading, isError, error, refetch } = useMe();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !user) {
    return <ErrorState message={parseApiError(error) || t('load_error')} onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('settings_title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('settings_subtitle')}</p>
      </header>

      <ProfileSection user={user} />

      <SecuritySection hasPassword={user.hasPassword ?? true} />

      {/* Addresses — reuse the existing full-CRUD manager in embedded (card) mode. */}
      <AddressListClient embedded />

      <PreferencesSection />
    </div>
  );
}
