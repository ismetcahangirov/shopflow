// src/app/[locale]/admin/settings/page.tsx
// Admin Settings: read/write the global site settings backed by GET/PUT
// /settings. Only the exact keys the API supports are rendered, grouped into
// General / Store tabs. Saves via a Sonner toast.
'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  useSettings,
  useUpdateSettings,
  SETTINGS_KEYS,
  type SettingsKey,
  type SiteSettings,
} from '@/hooks/useSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseApiError } from '@/lib/api';

interface FieldDef {
  key: SettingsKey;
  type: 'text' | 'email' | 'number';
  placeholder?: string;
}

const GENERAL_FIELDS: FieldDef[] = [
  { key: 'site_name', type: 'text', placeholder: 'ShopFlow' },
  { key: 'site_email', type: 'email', placeholder: 'info@shopflow.az' },
];

const STORE_FIELDS: FieldDef[] = [
  { key: 'currency', type: 'text', placeholder: 'AZN' },
  { key: 'currency_symbol', type: 'text', placeholder: '₼' },
  { key: 'shipping_cost', type: 'number', placeholder: '5' },
  { key: 'free_shipping_min', type: 'number', placeholder: '100' },
  { key: 'tax_rate', type: 'number', placeholder: '18' },
];

export default function AdminSettingsPage(): React.JSX.Element {
  const t = useTranslations('admin_settings');

  const { data, isLoading, isError, error, refetch } = useSettings();
  const updateMutation = useUpdateSettings();

  const [form, setForm] = useState<SiteSettings | null>(null);

  // Seed the form once, when settings first load, so a background refetch never
  // clobbers in-progress edits.
  useEffect(() => {
    if (data && form === null) setForm(data);
  }, [data, form]);

  const handleField = (key: SettingsKey, value: string): void => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!form) return;
    // The API rejects empty values, and may not return every key (missing keys
    // are `undefined`), so map defensively then drop the empties.
    const payload = SETTINGS_KEYS.map((k) => ({ key: k, value: (form[k] ?? '').trim() })).filter(
      (s) => s.value !== '',
    );
    try {
      await updateMutation.mutateAsync(payload);
      toast.success(t('save_success'));
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const renderField = (field: FieldDef): React.JSX.Element => (
    <div key={field.key} className="space-y-1.5">
      <Label htmlFor={`setting-${field.key}`}>{t(`field_${field.key}`)}</Label>
      <Input
        id={`setting-${field.key}`}
        type={field.type}
        inputMode={field.type === 'number' ? 'decimal' : undefined}
        value={form?.[field.key] ?? ''}
        onChange={(e) => handleField(field.key, e.target.value)}
        placeholder={field.placeholder}
        className="rounded-xl"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />

      {isError ? (
        <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />
      ) : isLoading || !form ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">{t('tab_general')}</TabsTrigger>
              <TabsTrigger value="store">{t('tab_store')}</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('tab_general')}</CardTitle>
                  <CardDescription>{t('general_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  {GENERAL_FIELDS.map(renderField)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="store" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('tab_store')}</CardTitle>
                  <CardDescription>{t('store_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  {STORE_FIELDS.map(renderField)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending} className="rounded-xl">
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {t('save')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
