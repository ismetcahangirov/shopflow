'use client';

import React, { useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { User, Shield, Calendar, Camera, MapPin, KeyRound, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { FormField } from '@/components/ui/form-field';
import { parseApiError } from '@/lib/api';
import { useMe, useUpdateProfile, useUpdatePassword, useUpdateAvatar } from '@/hooks/useUser';

export default function ProfilePageClient() {
  const t = useTranslations('profile');
  const { data: user, isLoading, isError, error, refetch } = useMe();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const clearSuccess = useCallback(() => {
    const timer = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateAvatar.mutate(file, {
      onSuccess: () => { setSuccessMsg(t('avatar_updated')); clearSuccess(); },
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name, email }, {
      onSuccess: () => { setIsEditing(false); setSuccessMsg(t('profile_updated')); clearSuccess(); },
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    updatePassword.mutate({ currentPassword, newPassword, confirmPassword }, {
      onSuccess: () => {
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setChangingPassword(false); setSuccessMsg(t('password_updated')); clearSuccess();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Skeleton className="mb-6 h-10 w-48" />
        <Skeleton className="mb-4 h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorState message={parseApiError(error) || t('load_error')} onRetry={() => refetch()} />
      </div>
    );
  }

  const isLoadingMutation = updateProfile.isPending || updatePassword.isPending || updateAvatar.isPending;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Profile Info */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row">
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} className="h-full w-full object-cover" width={96} height={96} sizes="96px" />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={updateAvatar.isPending}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Shield className="h-3 w-3" />
                {user.role === 'ADMIN' ? t('admin') : user.role === 'VENDOR' ? t('vendor') : t('customer')}
              </span>
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  {t('verified')}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              <Calendar className="mr-1 inline h-3 w-3" />
              {t('member_since')}: {new Date(user.createdAt).toLocaleDateString('az-AZ')}
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        {isEditing ? (
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 border-t border-slate-100 pt-4 dark:border-slate-700">
            <FormField label={t('name')} htmlFor="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            <FormField label={t('email')} htmlFor="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {updateProfile.isError && <p className="text-sm text-red-500">{parseApiError(updateProfile.error)}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoadingMutation} isLoading={updateProfile.isPending}>{t('save')}</Button>
              <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {t('edit_profile')}
            </Button>
            <Link href="/profile/addresses">
              <Button variant="outline" size="sm">
                <MapPin className="mr-1.5 h-3.5 w-3.5" />
                {t('addresses')}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Password Change */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
          <KeyRound className="h-5 w-5 text-indigo-500" />
          {t('change_password')}
        </h2>
        {changingPassword ? (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <FormField label={t('current_password')} htmlFor="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <FormField label={t('new_password')} htmlFor="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required hint={t('password_hint')} />
            <FormField label={t('confirm_password')} htmlFor="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            {updatePassword.isError && <p className="text-sm text-red-500">{parseApiError(updatePassword.error)}</p>}
            {newPassword !== confirmPassword && confirmPassword && <p className="text-sm text-red-500">{t('password_mismatch')}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoadingMutation} isLoading={updatePassword.isPending}>{t('save')}</Button>
              <Button variant="outline" type="button" onClick={() => { setChangingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>{t('cancel')}</Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setChangingPassword(true)}>
            {t('change_password_btn')}
          </Button>
        )}
      </div>
    </div>
  );
}
