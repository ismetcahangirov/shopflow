'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Store,
  Clock,
  XCircle,
  PauseCircle,
  Check,
  X,
  Pause,
} from 'lucide-react';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

import {
  useAdminVendors,
  useUpdateVendorStatus,
  type AdminVendor,
  type AdminVendorsParams,
  type VendorStatus,
} from '@/hooks/useVendor';

type StatusFilter = 'ALL' | VendorStatus;

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

const PENDING_ACTION_STATUSES: VendorStatus[] = ['APPROVED', 'REJECTED'];
const APPROVED_ACTION_STATUSES: VendorStatus[] = ['SUSPENDED', 'REJECTED'];
const REJECTED_ACTION_STATUSES: VendorStatus[] = ['APPROVED'];
const SUSPENDED_ACTION_STATUSES: VendorStatus[] = ['APPROVED', 'REJECTED'];

function getAvailableActions(vendor: AdminVendor): VendorStatus[] {
  switch (vendor.status) {
    case 'PENDING':
      return PENDING_ACTION_STATUSES;
    case 'APPROVED':
      return APPROVED_ACTION_STATUSES;
    case 'REJECTED':
      return REJECTED_ACTION_STATUSES;
    case 'SUSPENDED':
      return SUSPENDED_ACTION_STATUSES;
    default:
      return [];
  }
}

interface ActionButton {
  targetStatus: VendorStatus;
  icon: React.ReactNode;
  className: string;
  titleKey: 'approve' | 'reject' | 'suspend';
}

function buildActionButtons(vendor: AdminVendor): ActionButton[] {
  const actions = getAvailableActions(vendor);
  return actions.map((targetStatus) => {
    if (targetStatus === 'APPROVED') {
      return {
        targetStatus,
        icon: <Check className="h-4 w-4" />,
        className:
          'p-2 h-auto rounded-lg text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30',
        titleKey: 'approve' as const,
      };
    }
    if (targetStatus === 'SUSPENDED') {
      return {
        targetStatus,
        icon: <Pause className="h-4 w-4" />,
        className:
          'p-2 h-auto rounded-lg text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/30',
        titleKey: 'suspend' as const,
      };
    }
    return {
      targetStatus,
      icon: <X className="h-4 w-4" />,
      className:
        'p-2 h-auto rounded-lg text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30',
      titleKey: 'reject' as const,
    };
  });
}

function VendorStatusBadge({ status }: { status: VendorStatus }): React.JSX.Element {
  if (status === 'APPROVED') {
    return (
      <Badge variant="success" className="inline-flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Approved
      </Badge>
    );
  }
  if (status === 'PENDING') {
    return (
      <Badge variant="warning" className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  }
  if (status === 'SUSPENDED') {
    return (
      <Badge variant="secondary" className="inline-flex items-center gap-1">
        <PauseCircle className="h-3 w-3" />
        Suspended
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="inline-flex items-center gap-1">
      <XCircle className="h-3 w-3" />
      Rejected
    </Badge>
  );
}

export default function AdminVendorsPage(): React.JSX.Element {
  const t = useTranslations('admin_vendors');

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<AdminVendor | null>(null);
  const [targetStatus, setTargetStatus] = useState<VendorStatus | null>(null);
  const [noteValue, setNoteValue] = useState('');

  // 300ms debounce on search
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

  const handleStatusFilterChange = (s: StatusFilter): void => {
    setStatusFilter(s);
    setPage(1);
  };

  const handleOpenConfirm = (vendor: AdminVendor, newStatus: VendorStatus): void => {
    setSelectedVendor(vendor);
    setTargetStatus(newStatus);
    setNoteValue('');
    setIsConfirmOpen(true);
  };

  const handleConfirm = async (): Promise<void> => {
    if (!selectedVendor || !targetStatus) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedVendor.id,
        status: targetStatus,
        note: noteValue.trim() || undefined,
      });
      setIsConfirmOpen(false);
      setSelectedVendor(null);
      setTargetStatus(null);
      setNoteValue('');
    } catch {
      // Error handled by mutation — do not swallow silently in production
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div>
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: t('title') }]} />
        <PageHeader
          title={t('title')}
          description={t('subtitle')}
          actions={
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="rounded-xl border-slate-200 dark:border-slate-800"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenilə
            </Button>
          }
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-full md:flex-row md:items-center">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-4 py-2 w-full rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 dark:border-slate-800"
            data-testid="search-vendors-input"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
            {t('status_filter')}:
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex-wrap gap-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusFilterChange(s)}
                data-testid={`status-filter-${s}`}
                className={[
                  'rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200',
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white',
                ].join(' ')}
              >
                {t(s === 'ALL' ? 'all' : s === 'PENDING' ? 'pending' : s === 'APPROVED' ? 'approved' : s === 'REJECTED' ? 'rejected' : 'suspended')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-500 dark:text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white">{t('error_occurred')}</h4>
          </div>
        ) : !vendorsData?.data || vendorsData.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400">
              <Store className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white">{t('no_vendors')}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-450 max-w-xs">{t('no_vendors_desc')}</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-4">{t('store_name')}</TableHead>
                    <TableHead className="px-6 py-4">{t('owner')}</TableHead>
                    <TableHead className="px-6 py-4 text-center">{t('products_count')}</TableHead>
                    <TableHead className="px-6 py-4 text-center">{t('total_sales')}</TableHead>
                    <TableHead className="px-6 py-4">{t('created_at')}</TableHead>
                    <TableHead className="px-6 py-4 text-center">{t('status')}</TableHead>
                    <TableHead className="px-6 py-4 text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorsData.data.map((vendor) => {
                    const actionButtons = buildActionButtons(vendor);
                    return (
                      <TableRow
                        key={vendor.id}
                        className="group hover:bg-slate-50/20 dark:hover:bg-slate-950/5"
                        data-testid={`vendor-row-${vendor.id}`}
                      >
                        {/* Store name */}
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={vendor.logo}
                              fallback={vendor.storeName}
                              size="sm"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {vendor.storeName}
                              </span>
                              <span className="text-xs text-slate-450 dark:text-slate-500">
                                /{vendor.slug}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Owner */}
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {vendor.user.name}
                            </span>
                            <span className="text-xs text-slate-450 dark:text-slate-500">
                              {vendor.user.email}
                            </span>
                          </div>
                        </TableCell>

                        {/* Products count */}
                        <TableCell className="px-6 py-4 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                          {vendor.productCount}
                        </TableCell>

                        {/* Total sales */}
                        <TableCell className="px-6 py-4 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                          ₼{vendor.totalSales.toFixed(2)}
                        </TableCell>

                        {/* Created at */}
                        <TableCell className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(vendor.createdAt).toLocaleDateString('az-AZ', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-6 py-4 text-center">
                          <VendorStatusBadge status={vendor.status} />
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {actionButtons.map((btn) => (
                              <Button
                                key={btn.targetStatus}
                                variant="secondary"
                                onClick={() => handleOpenConfirm(vendor, btn.targetStatus)}
                                disabled={updateStatusMutation.isPending}
                                className={btn.className}
                                title={t(btn.titleKey)}
                                data-testid={`action-${btn.targetStatus.toLowerCase()}-${vendor.id}`}
                              >
                                {btn.icon}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {vendorsData.pagination && (
              <div className="border-t border-slate-50 dark:border-slate-800/80 px-4">
                <Pagination
                  currentPage={page}
                  totalPages={vendorsData.pagination.pages}
                  onPageChange={setPage}
                  totalEntries={vendorsData.pagination.total}
                  pageSize={limit}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note textarea inside confirm dialog area */}
      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          data-testid="status-confirm-dialog"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {t('status_change_title')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('status_change_confirm')}
            </p>
            {/* Note */}
            <div className="space-y-1">
              <label
                htmlFor="vendor-status-note"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t('note_label')}
              </label>
              <textarea
                id="vendor-status-note"
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                placeholder={t('note_placeholder')}
                rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 resize-none"
                data-testid="vendor-status-note"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setSelectedVendor(null);
                  setTargetStatus(null);
                  setNoteValue('');
                }}
                data-testid="cancel-btn"
              >
                {t('cancel_btn')}
              </Button>
              <Button
                variant="default"
                onClick={handleConfirm}
                disabled={updateStatusMutation.isPending}
                data-testid="confirm-btn"
              >
                {updateStatusMutation.isPending ? '...' : t('confirm_btn')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden ConfirmDialog to keep accessibility pattern consistent */}
      <ConfirmDialog
        isOpen={false}
        onClose={() => undefined}
        onConfirm={() => undefined}
        title=""
        message=""
      />
    </div>
  );
}
