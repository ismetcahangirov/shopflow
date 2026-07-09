'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Store, Image as ImageIcon, Upload } from 'lucide-react';

import {
  useMyVendor,
  useUpdateMyVendor,
  useUploadVendorLogo,
  useUploadVendorBanner,
} from '@/hooks/useVendor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { formatCurrency } from '@/lib/format';
import { parseApiError } from '@/lib/api';

export default function VendorSettingsPage(): React.JSX.Element {
  const t = useTranslations('vendor');
  const { data: vendor, isLoading, isError, error, refetch } = useMyVendor();

  const updateVendor = useUpdateMyVendor();
  const uploadLogo = useUploadVendorLogo();
  const uploadBanner = useUploadVendorBanner();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ storeName: '', description: '', phone: '', address: '' });

  useEffect(() => {
    if (vendor) {
      setForm({
        storeName: vendor.storeName ?? '',
        description: vendor.description ?? '',
        phone: vendor.phone ?? '',
        address: vendor.address ?? '',
      });
    }
  }, [vendor]);

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (isError || !vendor) return <ErrorState message={parseApiError(error) || t('store_error')} onRetry={() => refetch()} />;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    updateVendor.mutate(form, {
      onSuccess: () => toast.success(t('store_saved')),
      onError: (err) => toast.error(parseApiError(err)),
    });
  };

  const handleUpload = (
    kind: 'logo' | 'banner',
    mutation: typeof uploadLogo,
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    mutation.mutate(file, {
      onSuccess: () => toast.success(t(kind === 'logo' ? 'logo_saved' : 'banner_saved')),
      onError: (err) => toast.error(parseApiError(err)),
    });
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('store_settings')} description={t('store_settings_desc')} />

      {vendor.status !== 'APPROVED' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
          {t('pending_approval')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Edit form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('edit_store')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="storeName">{t('store_name')}</Label>
                <Input id="storeName" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} required minLength={2} maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea id="description" rows={3} value={form.description} maxLength={500} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">{t('address')}</Label>
                  <Input id="address" value={form.address} maxLength={300} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>

              {/* Logo + banner upload */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('logo')}</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                      {vendor.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vendor.logo} alt={t('logo')} className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload('logo', uploadLogo, e)} />
                    <Button type="button" variant="outline" size="sm" disabled={uploadLogo.isPending} onClick={() => logoInputRef.current?.click()}>
                      <Upload className="mr-1.5 h-4 w-4" /> {uploadLogo.isPending ? t('uploading') : t('upload')}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('banner')}</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                      {vendor.banner ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vendor.banner} alt={t('banner')} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <input ref={bannerInputRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload('banner', uploadBanner, e)} />
                    <Button type="button" variant="outline" size="sm" disabled={uploadBanner.isPending} onClick={() => bannerInputRef.current?.click()}>
                      <Upload className="mr-1.5 h-4 w-4" /> {uploadBanner.isPending ? t('uploading') : t('upload')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={updateVendor.isPending}>
                  {updateVendor.isPending ? t('saving') : t('save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Read-only stats */}
        <Card>
          <CardHeader>
            <CardTitle>{t('store_overview')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{vendor.storeName}</p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  vendor.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : vendor.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {t(`status_${vendor.status.toLowerCase()}`)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500">{t('commission')}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{vendor.commission}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('total_sales')}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(vendor.totalSales)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('slug')}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{vendor.slug}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('products_count')}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{vendor.productCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
