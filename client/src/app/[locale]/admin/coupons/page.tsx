// src/app/[locale]/admin/coupons/page.tsx
// Admin Coupon Management — CRUD panel for discount coupons

'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  TicketPercent,
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  useCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from '@/hooks/useCoupons';
import type { Coupon, CouponType } from '@/types';

const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  PERCENTAGE: 'Faiz (%)',
  FIXED_AMOUNT: 'Sabit məbləğ (AZN)',
};

interface FormState {
  code: string;
  type: CouponType;
  value: string;
  minOrderValue: string;
  maxDiscount: string;
  maxUses: string;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
}

const EMPTY_FORM: FormState = {
  code: '',
  type: 'PERCENTAGE',
  value: '',
  minOrderValue: '',
  maxDiscount: '',
  maxUses: '',
  isActive: true,
  startsAt: '',
  expiresAt: '',
};

function buildPayload(form: FormState) {
  return {
    code: form.code.trim().toUpperCase(),
    type: form.type,
    value: parseFloat(form.value),
    minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : null,
    maxDiscount:
      form.type === 'PERCENTAGE' && form.maxDiscount
        ? parseFloat(form.maxDiscount)
        : null,
    maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
    isActive: form.isActive,
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
  };
}

export default function AdminCouponsPage(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data, isLoading, error } = useCouponsQuery();
  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();
  const deleteMutation = useDeleteCouponMutation();

  const coupons: Coupon[] = data?.coupons ?? [];

  const filtered = coupons.filter((c) => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.isActive) ||
      (statusFilter === 'inactive' && !c.isActive);
    return matchesSearch && matchesStatus;
  });

  // ── Handlers ──────────────────────────────────────────────

  const openCreate = (): void => {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (coupon: Coupon): void => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderValue: coupon.minOrderValue != null ? String(coupon.minOrderValue) : '',
      maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : '',
      maxUses: coupon.maxUses != null ? String(coupon.maxUses) : '',
      isActive: coupon.isActive,
      startsAt: coupon.startsAt ? coupon.startsAt.substring(0, 16) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 16) : '',
    });
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (id: string): void => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleField = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return;
    const payload = buildPayload(form);
    try {
      if (editingCoupon) {
        await updateMutation.mutateAsync({ id: editingCoupon.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsFormOpen(false);
    } catch {
      // Error shown by mutation
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      setIsConfirmOpen(false);
      setDeletingId(null);
    } catch {
      // Error shown by mutation
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Breadcrumb
          items={[{ label: 'Admin', href: '/admin' }, { label: 'Kuponlar' }]}
        />
        <PageHeader
          title="Kuponların İdarə Edilməsi"
          description="Endirim kuponları yaradın, redaktə edin, aktiv/deaktiv edin."
          actions={
            <Button
              onClick={openCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kupon
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            id="coupon-search"
            placeholder="Kupon kodu axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50/50 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={[
                  'rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 capitalize',
                  statusFilter === f
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-450',
                ].join(' ')}
              >
                {f === 'all' ? 'Hamısı' : f === 'active' ? 'Aktiv' : 'Deaktiv'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <Spinner className="h-8 w-8 text-indigo-600" />
            <p className="text-sm font-semibold text-slate-500">Kuponlar yüklənir...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-500">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white">Xəta baş verdi</h4>
            <p className="text-sm text-slate-500 max-w-sm">Kupon siyahısını yükləmək mümkün olmadı.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400">
              <TicketPercent className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white">Kupon tapılmadı</h4>
            <p className="text-sm text-slate-500 max-w-xs">
              {searchTerm ? 'Axtarışa uyğun kupon yoxdur.' : 'Hələ heç bir kupon yaradılmayıb.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Kod</th>
                  <th className="px-6 py-4">Tip</th>
                  <th className="px-6 py-4">Dəyər</th>
                  <th className="px-6 py-4">Min. Sifariş</th>
                  <th className="px-6 py-4">İstifadə</th>
                  <th className="px-6 py-4">Bitmə tarixi</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filtered.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="group hover:bg-slate-50/30 dark:hover:bg-slate-950/5 transition-colors"
                  >
                    {/* Code */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white tracking-wider">
                          {coupon.code}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {coupon.type === 'PERCENTAGE' ? (
                        <Badge variant="secondary">% Faiz</Badge>
                      ) : (
                        <Badge variant="secondary">Sabit AZN</Badge>
                      )}
                    </td>

                    {/* Value */}
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                      {coupon.type === 'PERCENTAGE'
                        ? `${coupon.value}%`
                        : `${coupon.value.toFixed(2)} AZN`}
                      {coupon.maxDiscount != null && (
                        <span className="ml-1.5 text-xs font-normal text-slate-400">
                          (max {coupon.maxDiscount} AZN)
                        </span>
                      )}
                    </td>

                    {/* Min order */}
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {coupon.minOrderValue != null
                        ? `${coupon.minOrderValue.toFixed(2)} AZN`
                        : '—'}
                    </td>

                    {/* Usage */}
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {coupon.usedCount}
                      {coupon.maxUses != null && (
                        <span className="text-slate-400"> / {coupon.maxUses}</span>
                      )}
                    </td>

                    {/* Expires at */}
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString('az-AZ')
                        : '—'}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      {coupon.isActive ? (
                        <Badge variant="success" className="inline-flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="inline-flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Deaktiv
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => openEdit(coupon)}
                          className="p-2 h-auto text-slate-600 hover:text-indigo-650 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-indigo-950/20 rounded-lg transition-colors"
                          title="Redaktə Et"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => openDeleteConfirm(coupon.id)}
                          className="p-2 h-auto text-slate-600 hover:text-red-650 bg-slate-50 hover:bg-red-50 dark:bg-slate-950 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCoupon ? 'Kuponu Redaktə Et' : 'Yeni Kupon Yarat'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Code */}
          <div className="space-y-1.5">
            <Label htmlFor="couponCode">Kupon Kodu *</Label>
            <Input
              id="couponCode"
              value={form.code}
              onChange={(e) => handleField('code', e.target.value.toUpperCase())}
              placeholder="YENI20"
              required
              className="rounded-xl font-mono font-bold tracking-widest"
              disabled={!!editingCoupon}
            />
            {!!editingCoupon && (
              <p className="text-xs text-slate-400">Mövcud kupon kodu dəyişdirilə bilməz.</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label htmlFor="couponType">Kupon Tipi *</Label>
            <select
              id="couponType"
              value={form.type}
              onChange={(e) => handleField('type', e.target.value as CouponType)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              {(Object.entries(COUPON_TYPE_LABELS) as [CouponType, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div className="space-y-1.5">
            <Label htmlFor="couponValue">
              {form.type === 'PERCENTAGE' ? 'Faiz dəyəri (0–100) *' : 'Endirim məbləği (AZN) *'}
            </Label>
            <Input
              id="couponValue"
              type="number"
              min="0.01"
              max={form.type === 'PERCENTAGE' ? '100' : undefined}
              step="0.01"
              value={form.value}
              onChange={(e) => handleField('value', e.target.value)}
              placeholder={form.type === 'PERCENTAGE' ? '20' : '15.00'}
              required
              className="rounded-xl"
            />
          </div>

          {/* Max discount (only for PERCENTAGE) */}
          {form.type === 'PERCENTAGE' && (
            <div className="space-y-1.5">
              <Label htmlFor="couponMaxDiscount">Maksimum endirim (AZN) — ixtiyari</Label>
              <Input
                id="couponMaxDiscount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.maxDiscount}
                onChange={(e) => handleField('maxDiscount', e.target.value)}
                placeholder="50.00"
                className="rounded-xl"
              />
            </div>
          )}

          {/* Min order value */}
          <div className="space-y-1.5">
            <Label htmlFor="couponMinOrder">Minimum sifariş məbləği (AZN) — ixtiyari</Label>
            <Input
              id="couponMinOrder"
              type="number"
              min="0"
              step="0.01"
              value={form.minOrderValue}
              onChange={(e) => handleField('minOrderValue', e.target.value)}
              placeholder="100.00"
              className="rounded-xl"
            />
          </div>

          {/* Max uses */}
          <div className="space-y-1.5">
            <Label htmlFor="couponMaxUses">Maksimum istifadə sayı — ixtiyari</Label>
            <Input
              id="couponMaxUses"
              type="number"
              min="1"
              step="1"
              value={form.maxUses}
              onChange={(e) => handleField('maxUses', e.target.value)}
              placeholder="100"
              className="rounded-xl"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="couponStartsAt">Başlanğıc tarixi</Label>
              <Input
                id="couponStartsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => handleField('startsAt', e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="couponExpiresAt">Bitmə tarixi</Label>
              <Input
                id="couponExpiresAt"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => handleField('expiresAt', e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          {/* isActive toggle */}
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="couponIsActive"
              checked={form.isActive}
              onChange={(e) => handleField('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="couponIsActive" className="cursor-pointer select-none">
              Bu kupon aktivdir
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
              className="rounded-xl font-bold"
            >
              Ləğv Et
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.code.trim() || !form.value}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/10 transition-all"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCoupon ? 'Dəyişiklikləri Saxla' : 'Kupon Yarat'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Kuponu Sil"
        message="Bu kuponu silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
        confirmText="Bəli, Sil"
        cancelText="Ləğv Et"
        variant="destructive"
      />
    </div>
  );
}
