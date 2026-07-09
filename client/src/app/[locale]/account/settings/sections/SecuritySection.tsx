// src/app/[locale]/account/settings/sections/SecuritySection.tsx
// Security settings: change-password form. Accounts without a local password
// (Google sign-in) get a clear notice instead of a form that can only error.

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { KeyRound, ShieldAlert, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { parseApiError } from '@/lib/api';
import { useUpdatePassword } from '@/hooks/useUser';

interface SecuritySectionProps {
  /** Whether the account has a local password (false for Google-only sign-in). */
  hasPassword: boolean;
}

export function SecuritySection({ hasPassword }: SecuritySectionProps): React.JSX.Element {
  const t = useTranslations('profile');
  const updatePassword = useUpdatePassword();

  const [changing, setChanging] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const resetFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    updatePassword.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          resetFields();
          setChanging(false);
          setSuccess(true);
        },
      },
    );
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
        <KeyRound className="h-5 w-5 text-indigo-500" />
        {t('security')}
      </h2>

      {!hasPassword ? (
        <div
          data-testid="security-google-notice"
          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>{t('security_google_managed')}</span>
        </div>
      ) : changing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            label={t('current_password')}
            htmlFor="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <FormField
            label={t('new_password')}
            htmlFor="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            hint={t('password_hint')}
          />
          <FormField
            label={t('confirm_password')}
            htmlFor="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {updatePassword.isError && (
            <p className="text-sm text-red-500">{parseApiError(updatePassword.error)}</p>
          )}
          {newPassword !== confirmPassword && confirmPassword && (
            <p className="text-sm text-red-500">{t('password_mismatch')}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={updatePassword.isPending} isLoading={updatePassword.isPending}>
              {t('save')}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setChanging(false);
                resetFields();
              }}
            >
              {t('cancel')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              {t('password_updated')}
            </div>
          )}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChanging(true);
                setSuccess(false);
              }}
            >
              {t('change_password_btn')}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
