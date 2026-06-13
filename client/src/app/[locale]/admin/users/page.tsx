'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Check,
  RefreshCw,
  Users,
  ShieldAlert
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
  TableCell
} from '@/components/ui/table';

import { useAdminUsers, useToggleUserStatus, type AdminUsersParams } from '@/hooks/useUser';
import type { AdminUser } from '@/hooks/useUser';

export default function AdminUsersPage(): React.JSX.Element {
  const t = useTranslations('admin_users');

  // Search and filter states
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'VENDOR' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Confirm dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Query parameters memo
  const queryParams = useMemo<AdminUsersParams>(() => {
    const params: AdminUsersParams = {
      page,
      limit,
    };

    if (searchQuery.trim()) {
      params.search = searchQuery;
    }

    if (roleFilter !== 'ALL') {
      params.role = roleFilter;
    }

    if (statusFilter !== 'ALL') {
      params.isActive = statusFilter === 'ACTIVE';
    }

    return params;
  }, [page, searchQuery, roleFilter, statusFilter]);

  // API Hooks
  const { data: usersData, isLoading, isError, refetch } = useAdminUsers(queryParams);
  const toggleStatusMutation = useToggleUserStatus();

  // Reset page on filter changes
  const handleRoleFilterChange = (role: typeof roleFilter) => {
    setRoleFilter(role);
    setPage(1);
  };

  const handleStatusFilterChange = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  // Status toggle handler
  const handleOpenConfirm = (user: AdminUser) => {
    if (user.role === 'ADMIN') return;
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!selectedUser) return;
    try {
      await toggleStatusMutation.mutateAsync({
        id: selectedUser.id,
        isActive: !selectedUser.isActive,
      });
      setIsConfirmOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
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

      {/* Filters & Search Control */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-full md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-4 py-2 w-full rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 dark:border-slate-800"
            data-testid="search-users-input"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
          {/* Role filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              {t('role_filter')}:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-955 border border-slate-100 dark:border-slate-850">
              {(['ALL', 'CUSTOMER', 'VENDOR', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleFilterChange(r)}
                  className={[
                    'rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200',
                    roleFilter === r
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white',
                  ].join(' ')}
                >
                  {r === 'ALL'
                    ? t('all')
                    : r === 'CUSTOMER'
                    ? t('customer')
                    : r === 'VENDOR'
                    ? t('vendor')
                    : t('admin')}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              {t('status_filter')}:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-955 border border-slate-100 dark:border-slate-850">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusFilterChange(s)}
                  className={[
                    'rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200',
                    statusFilter === s
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white',
                  ].join(' ')}
                >
                  {s === 'ALL'
                    ? t('all')
                    : s === 'ACTIVE'
                    ? t('active')
                    : t('inactive')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
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
            <h4 className="font-extrabold text-slate-900 dark:text-white">Xəta baş verdi</h4>
            <p className="text-sm text-slate-500 dark:text-slate-450 max-w-sm">
              İstifadəçilər yüklənərkən xəta baş verdi. Yenidən cəhd edin.
            </p>
          </div>
        ) : !usersData?.data || usersData.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400">
              <Users className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white">{t('no_users')}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-450 max-w-xs">
              {t('no_users_desc')}
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-4">{t('name')}</TableHead>
                    <TableHead className="px-6 py-4">{t('role')}</TableHead>
                    <TableHead className="px-6 py-4 text-center">{t('orders_count')}</TableHead>
                    <TableHead className="px-6 py-4">{t('created_at')}</TableHead>
                    <TableHead className="px-6 py-4 text-center">{t('status')}</TableHead>
                    <TableHead className="px-6 py-4 text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData.data.map((user) => {
                    const fallbackInitials = user.name || user.email || 'U';
                    const isUserAdmin = user.role === 'ADMIN';

                    return (
                      <TableRow key={user.id} className="group hover:bg-slate-50/20 dark:hover:bg-slate-950/5">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.avatar}
                              fallback={fallbackInitials}
                              size="sm"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {user.name || 'İstifadəçi'}
                              </span>
                              <span className="text-xs text-slate-450 dark:text-slate-500">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {user.role === 'ADMIN' ? (
                            <Badge variant="destructive">{t('admin')}</Badge>
                          ) : user.role === 'VENDOR' ? (
                            <Badge variant="default">{t('vendor')}</Badge>
                          ) : (
                            <Badge variant="secondary">{t('customer')}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                          {user._count?.orders ?? 0}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString('az-AZ', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          {user.isActive ? (
                            <Badge variant="success" className="inline-flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {t('active')}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="inline-flex items-center gap-1">
                              <X className="h-3 w-3" />
                              {t('inactive')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isUserAdmin ? (
                              <Button
                                variant="secondary"
                                disabled
                                className="p-2 h-auto text-slate-350 dark:text-slate-600 bg-slate-50 dark:bg-slate-950/20 rounded-lg cursor-not-allowed"
                                title={t('cannot_toggle_admin')}
                              >
                                <ShieldAlert className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                onClick={() => handleOpenConfirm(user)}
                                disabled={toggleStatusMutation.isPending}
                                className={[
                                  'p-2 h-auto rounded-lg transition-colors duration-200',
                                  user.isActive
                                    ? 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/30'
                                    : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30'
                                ].join(' ')}
                                title={user.isActive ? t('deactivate') : t('activate')}
                              >
                                {user.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {usersData.pagination && (
              <div className="border-t border-slate-50 dark:border-slate-800/80 px-4">
                <Pagination
                  currentPage={page}
                  totalPages={usersData.pagination.pages}
                  onPageChange={setPage}
                  totalEntries={usersData.pagination.total}
                  pageSize={limit}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmToggle}
        title={t('toggle_status_title')}
        message={t('toggle_status_confirm')}
        confirmText={t('confirm_btn')}
        cancelText={t('cancel_btn')}
        variant={selectedUser?.isActive ? 'destructive' : 'primary'}
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
}
