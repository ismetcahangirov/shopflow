// src/app/[locale]/admin/coupons/page.tsx
// Admin Coupon Management — CRUD panel migrated to the shared DataTable + shadcn
// Dialog/Select/Switch + Sonner toasts.

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  CheckCircle,
  XCircle,
  Loader2,
  TicketPercent,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableFilterSelect,
} from '@/components/admin/data-table';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { parseApiError } from '@/lib/api';
import {
  useCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from '@/hooks/useCoupons';
import type { Coupon, CouponType } from '@/types';

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
      form.type === 'PERCENTAGE' && form.maxDiscount ? parseFloat(form.maxDiscount) : null,
    maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
    isActive: form.isActive,
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
  };
}

export default function AdminCouponsPage(): React.JSX.Element {
  const t = useTranslations('admin_coupons');
  const tc = useTranslations('common');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data, isLoading, error } = useCouponsQuery();
  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();
  const deleteMutation = useDeleteCouponMutation();

  const coupons: Coupon[] = useMemo(() => data?.coupons ?? [], [data]);

  const filtered = useMemo(
    () =>
      coupons.filter((c) => {
        const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && c.isActive) ||
          (statusFilter === 'inactive' && !c.isActive);
        return matchesSearch && matchesStatus;
      }),
    [coupons, searchTerm, statusFilter],
  );

  const openCreate = useCallback((): void => {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((coupon: Coupon): void => {
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
  }, []);

  const handleField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]): void => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return;
    const payload = buildPayload(form);
    try {
      if (editingCoupon) {
        await updateMutation.mutateAsync({ id: editingCoupon.id, ...payload });
        toast.success(t('update_success'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('create_success'));
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success(t('delete_success'));
      setDeletingId(null);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  }, [deletingId, deleteMutation, t]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const columns = useMemo<ColumnDef<Coupon>[]>(
    () => [
      {
        accessorKey: 'code',
        meta: { title: t('code') },
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('code')} />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
            <span className="font-mono text-sm font-bold tracking-wider text-foreground">
              {row.original.code}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        meta: { title: t('type') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('type')}
          </span>
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.type === 'PERCENTAGE' ? t('badge_percentage') : t('badge_fixed')}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'value',
        meta: { title: t('value') },
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('value')} />,
        cell: ({ row }) => {
          const coupon = row.original;
          return (
            <span className="text-sm font-bold text-foreground">
              {coupon.type === 'PERCENTAGE'
                ? `${coupon.value}%`
                : `${coupon.value.toFixed(2)} AZN`}
              {coupon.maxDiscount != null && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (max {coupon.maxDiscount} AZN)
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: 'minOrder',
        accessorFn: (row) => row.minOrderValue ?? 0,
        meta: { title: t('min_order') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('min_order')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.minOrderValue != null
              ? `${row.original.minOrderValue.toFixed(2)} AZN`
              : '—'}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'usage',
        meta: { title: t('usage') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('usage')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.usedCount}
            {row.original.maxUses != null && <span> / {row.original.maxUses}</span>}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'expiresAt',
        meta: { title: t('expires') },
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('expires')} />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.expiresAt
              ? new Date(row.original.expiresAt).toLocaleDateString('az-AZ')
              : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'isActive',
        meta: { title: t('status'), className: 'text-center', headerClassName: 'text-center' },
        header: () => (
          <span className="block text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('status')}
          </span>
        ),
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success" className="inline-flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {t('active')}
            </Badge>
          ) : (
            <Badge variant="secondary" className="inline-flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {t('inactive')}
            </Badge>
          ),
        enableSorting: false,
      },
      {
        id: 'actions',
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: 'text-right', className: 'text-right' },
        header: () => (
          <span className="block text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('actions')}
          </span>
        ),
        cell: ({ row }) => {
          const coupon = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('actions')}
                    className="ml-auto"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => openEdit(coupon)}>
                  <Edit2 className="h-4 w-4" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeletingId(coupon.id)}>
                  <Trash2 className="h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, openEdit],
  );

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: t('title') }]} />
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
          actions={
            <Button onClick={openCreate} className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              {t('new_coupon')}
            </Button>
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={!!error}
        emptyIcon={<TicketPercent className="h-7 w-7" />}
        emptyTitle={t('no_coupons')}
        emptyDescription={searchTerm ? t('no_coupons_search') : t('no_coupons_desc')}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('search_placeholder')}
        filters={
          <DataTableFilterSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}
            ariaLabel={t('status_filter')}
            placeholder={t('status_filter')}
            options={[
              { value: 'all', label: t('all') },
              { value: 'active', label: t('active') },
              { value: 'inactive', label: t('inactive') },
            ]}
          />
        }
        showViewOptions
        viewOptionsLabel={tc('columns')}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? t('edit_title') : t('create_title')}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="couponCode">{t('form_code')}</Label>
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
                <p className="text-xs text-muted-foreground">{t('form_code_locked')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="couponType">{t('form_type')}</Label>
              <Select
                value={form.type}
                onValueChange={(v) => handleField('type', v as CouponType)}
                items={{
                  PERCENTAGE: t('type_percentage'),
                  FIXED_AMOUNT: t('type_fixed'),
                }}
              >
                <SelectTrigger id="couponType" className="w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">{t('type_percentage')}</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">{t('type_fixed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="couponValue">
                {form.type === 'PERCENTAGE' ? t('form_value_percent') : t('form_value_fixed')}
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

            {form.type === 'PERCENTAGE' && (
              <div className="space-y-1.5">
                <Label htmlFor="couponMaxDiscount">{t('form_max_discount')}</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="couponMinOrder">{t('form_min_order')}</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="couponMaxUses">{t('form_max_uses')}</Label>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="couponStartsAt">{t('form_starts_at')}</Label>
                <Input
                  id="couponStartsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => handleField('startsAt', e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="couponExpiresAt">{t('form_expires_at')}</Label>
                <Input
                  id="couponExpiresAt"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => handleField('expiresAt', e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Switch
                id="couponIsActive"
                checked={form.isActive}
                onCheckedChange={(checked) => handleField('isActive', checked)}
              />
              <Label htmlFor="couponIsActive" className="cursor-pointer select-none">
                {t('form_is_active')}
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <DialogClose
                render={
                  <Button type="button" variant="outline">
                    {tc('cancel')}
                  </Button>
                }
              />
              <Button type="submit" disabled={isPending || !form.code.trim() || !form.value}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCoupon ? t('save_changes') : t('create_btn')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title={t('delete_title')}
        description={t('delete_confirm')}
        confirmLabel={t('delete')}
        cancelLabel={tc('cancel')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
