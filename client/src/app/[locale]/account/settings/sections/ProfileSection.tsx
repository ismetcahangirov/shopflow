// src/app/[locale]/account/settings/sections/ProfileSection.tsx
// Profile settings: avatar upload, name/email edit, and role/verification badges.

'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { User, Shield, Calendar, Camera, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { parseApiError } from '@/lib/api';
import { useUpdateProfile, useUpdateAvatar, type UserProfile } from '@/hooks/useUser';

interface ProfileSectionProps {
  user: UserProfile;
}

export function ProfileSection({ user }: ProfileSectionProps): React.JSX.Element {
  const t = useTranslations('profile');
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Keep the local form in sync when the underlying user changes (e.g. after a save).
  React.useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user.name, user.email]);

  const roleLabel = user.role === 'ADMIN' ? t('admin') : user.role === 'VENDOR' ? t('vendor') : t('customer');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateAvatar.mutate(file, {
      onSuccess: () => setSuccess(t('avatar_updated')),
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { name, email },
      {
        onSuccess: () => {
          setIsEditing(false);
          setSuccess(t('profile_updated'));
        },
      },
    );
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
        <User className="h-5 w-5 text-indigo-500" />
        {t('profile_info')}
      </h2>

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

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
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={updateAvatar.isPending}
            aria-label={t('change_avatar')}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow hover:bg-indigo-700 disabled:opacity-60"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            data-testid="avatar-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Shield className="h-3 w-3" />
              {roleLabel}
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

      {isEditing ? (
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 border-t border-slate-100 pt-4 dark:border-slate-700">
          <FormField label={t('name')} htmlFor="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          <FormField label={t('email')} htmlFor="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {updateProfile.isError && <p className="text-sm text-red-500">{parseApiError(updateProfile.error)}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={updateProfile.isPending} isLoading={updateProfile.isPending}>
              {t('save')}
            </Button>
            <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            {t('edit_profile')}
          </Button>
        </div>
      )}
    </section>
  );
}
