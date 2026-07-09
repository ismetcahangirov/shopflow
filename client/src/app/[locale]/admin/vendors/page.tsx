'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  RefreshCw,
  Store,
  Clock,
  XCircle,
  PauseCircle,
  Check,
  X,
  Pause,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  useAdminVendors,
  useUpdateVendorStatus,
  type AdminVendor,
  type AdminVendorsParams,
  type VendorStatus,
} from '@/hooks/useVendor';

type StatusFilter = 'ALL' | VendorStatus;

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

/** Allowed status transitions from each current status (unchanged business logic). */
function getAvailableActions(vendor: AdminVendor): VendorStatus[] {
  switch (vendor.status) {
    case 'PENDING':
      return ['APPROVED', 'REJECTED'];
    case 'APPROVED':
      return ['SUSPENDED', 'REJECTED'];
    case 'REJECTED':
      return ['APPROVED'];
    case 'SUSPENDED':
      return ['APPROVED', 'REJECTED'];
    default:
      return [];
  }
}

const ACTION_META: Record<
  'APPROVED' | 'REJECTED' | 'SUSPENDED',
  { icon: React.ReactNode; titleKey: 'approve' | 'reject' | 'suspend'; destructive: boolean }
> = {
  APPROVED: { icon: <Check className="h-4 w-4" />, titleKey: 'approve', destructive: false },
  SUSPENDED: { icon: <Pause className="h-4 w-4" />, titleKey: 'suspend', destructive: false },
  REJECTED: { icon: <X className="h-4 w-4" />, titleKey: 'reject', destructive: true },
};

const SUCCESS_KEY: Record<VendorStatus, 'approve_success' | 'reject_success' | 'suspend_success'> = {
  APPROVED: 'approve_success',
  REJECTED: 'reject_success',
  SUSPENDED: 'suspend_success',
  PENDING: 'approve_success',
};

function VendorStatusBadge({
  status,
  label,
}: {
  status: VendorStatus;
  label: string;
}): React.JSX.Element {
  if (status === 'APPROVED') {
    return (
      <Badge variant="success" className="inline-flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        {label}
      </Badge>
    );
  }
  if (status === 'PENDING') {
    return (
      <Badge variant="warning" className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {label}
      </Badge>
    );
  }
  if (status === 'SUSPENDED') {
    return (
      <Badge variant="secondary" className="inline-flex items-center gap-1">
        <PauseCircle className="h-3 w-3" />
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="inline-flex items-center gap-1">
      <XCircle className="h-3 w-3" />
      {label}
    </Badge>
  );
}

const STATUS_LABEL_KEY: Record<VendorStatus, 'pending' | 'approved' | 'rejected' | 'suspended'> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

export default function AdminVendorsPage(): React.JSX.Element {
  const t = useTranslations('admin_vendors');
  const tc = useTranslations('common');

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedVendor, setSelectedVendor] = useState<AdminVendor | null>(null);
  const [targetStatus, setTargetStatus] = useState<VendorStatus | null>(null);
  const [noteValue, setNoteValue] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const queryParams = useMemo<AdminVendorsParams>(() => {
    const params: AdminVendorsParams = { page, limit };
    if (searchQuery.trim()) params.search = searchQuery;
    if (statusFilter !== 'ALL') params.status = statusFilter;
    return params;
  }, [page, searchQuery, statusFilter]);

  const { data: vendorsData, isLoading, isError, refetch } = useAdminVendors(queryParams);
  const updateStatusMutation = useUpdateVendorStatus();

  const handleStatusFilterChange = useCallback((s: string) => {
    setStatusFilter(s as StatusFilter);
    setPage(1);
  }, []);

  const handleOpenConfirm = useCallback((vendor: AdminVendor, newStatus: VendorStatus) => {
    setSelectedVendor(vendor);
    setTargetStatus(newStatus);
    setNoteValue('');
  }, []);

  const closeConfirm = useCallback(() => {
    setSelectedVendor(null);
    setTargetStatus(null);
    setNoteValue('');
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedVendor || !targetStatus) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedVendor.id,
        status: targetStatus,
        note: noteValue.trim() || undefined,
      });
      toast.success(t(SUCCESS_KEY[targetStatus]));
      closeConfirm();
    } catch (err) {
      toast.error(parseApiError(err));
    }
  }, [selectedVendor, targetStatus, noteValue, updateStatusMutation, t, closeConfirm]);

  const columns = useMemo<ColumnDef<AdminVendor>[]>(
    () => [
      {
        accessorKey: 'storeName',
        meta: { title: t('store_name') },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('store_name')} />
        ),
        cell: ({ row }) => {
          const vendor = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar src={vendor.logo} fallback={vendor.storeName} size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{vendor.storeName}</span>
                <span className="text-xs text-muted-foreground">/{vendor.slug}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'owner',
        accessorFn: (row) => row.user.name,
        meta: { title: t('owner') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('owner')}
          </span>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{row.original.user.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.user.email}</span>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'productCount',
        meta: { title: t('products_count'), className: 'text-center', headerClassName: 'text-center' },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('products_count')} className="justify-center" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.productCount}</span>
        ),
      },
      {
        accessorKey: 'totalSales',
        meta: { title: t('total_sales'), className: 'text-center', headerClassName: 'text-center' },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('total_sales')} className="justify-center" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            ₼{row.original.totalSales.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        meta: { title: t('created_at') },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('created_at')} />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString('az-AZ', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        meta: { title: t('status'), className: 'text-center', headerClassName: 'text-center' },
        header: () => (
          <span className="block text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('status')}
          </span>
        ),
        cell: ({ row }) => (
          <VendorStatusBadge
            status={row.original.status}
            label={t(STATUS_LABEL_KEY[row.original.status])}
          />
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
          const vendor = row.original;
          const actions = getAvailableActions(vendor);
          if (actions.length === 0) return null;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('actions')}
                    className="ml-auto"
                    data-testid={`vendor-actions-${vendor.id}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44">
                {actions.map((target) => {
                  const meta = ACTION_META[target as 'APPROVED' | 'REJECTED' | 'SUSPENDED'];
                  return (
                    <DropdownMenuItem
                      key={target}
                      onClick={() => handleOpenConfirm(vendor, target)}
                      disabled={updateStatusMutation.isPending}
                      variant={meta.destructive ? 'destructive' : 'default'}
                      data-testid={`action-${target.toLowerCase()}-${vendor.id}`}
                    >
                      {meta.icon}
                      {t(meta.titleKey)}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, handleOpenConfirm, updateStatusMutation.isPending],
  );

  const vendors = vendorsData?.data ?? [];
  const pagination = vendorsData?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: t('title') }]} />
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
          actions={
            <Button variant="outline" onClick={() => refetch()} className="rounded-xl">
              <RefreshCw className="mr-2 h-4 w-4" />
              {tc('refresh')}
            </Button>
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={vendors}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        errorTitle={t('error_occurred')}
        emptyIcon={<Store className="h-7 w-7" />}
        emptyTitle={t('no_vendors')}
        emptyDescription={t('no_vendors_desc')}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder={t('search_placeholder')}
        filters={
          <DataTableFilterSelect
            value={statusFilter}
            onValueChange={handleStatusFilterChange}
            ariaLabel={t('status_filter')}
            placeholder={t('status_filter')}
            options={STATUS_FILTERS.map((s) => ({
              value: s,
              label: s === 'ALL' ? t('all') : t(STATUS_LABEL_KEY[s]),
            }))}
          />
        }
        showViewOptions
        viewOptionsLabel={tc('columns')}
        page={page}
        pageCount={pagination?.pages ?? 1}
        total={pagination?.total}
        pageSize={limit}
        onPageChange={setPage}
      />

      <AdminConfirmDialog
        open={selectedVendor !== null && targetStatus !== null}
        onOpenChange={(open) => {
          if (!open) closeConfirm();
        }}
        onConfirm={handleConfirm}
        title={t('status_change_title')}
        description={t('status_change_confirm')}
        confirmLabel={t('confirm_btn')}
        cancelLabel={t('cancel_btn')}
        variant={targetStatus === 'REJECTED' ? 'destructive' : 'default'}
        isLoading={updateStatusMutation.isPending}
      >
        <div className="space-y-1.5">
          <label
            htmlFor="vendor-status-note"
            className="text-xs font-semibold text-foreground"
          >
            {t('note_label')}
          </label>
          <Textarea
            id="vendor-status-note"
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder={t('note_placeholder')}
            rows={3}
            className="resize-none"
            data-testid="vendor-status-note"
          />
        </div>
      </AdminConfirmDialog>
    </div>
  );
}
