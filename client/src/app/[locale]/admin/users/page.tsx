'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  X,
  Check,
  RefreshCw,
  Users,
  ShieldAlert,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
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

import { useAdminUsers, useToggleUserStatus, type AdminUsersParams } from '@/hooks/useUser';
import type { AdminUser } from '@/hooks/useUser';

export default function AdminUsersPage(): React.JSX.Element {
  const t = useTranslations('admin_users');
  const tc = useTranslations('common');

  // Search and filter states
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'VENDOR' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Confirm dialog state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const queryParams = useMemo<AdminUsersParams>(() => {
    const params: AdminUsersParams = { page, limit };
    if (searchQuery.trim()) params.search = searchQuery;
    if (roleFilter !== 'ALL') params.role = roleFilter;
    if (statusFilter !== 'ALL') params.isActive = statusFilter === 'ACTIVE';
    return params;
  }, [page, searchQuery, roleFilter, statusFilter]);

  const { data: usersData, isLoading, isError, refetch } = useAdminUsers(queryParams);
  const toggleStatusMutation = useToggleUserStatus();

  const handleRoleFilterChange = useCallback((role: string) => {
    setRoleFilter(role as 'ALL' | 'CUSTOMER' | 'VENDOR' | 'ADMIN');
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status as 'ALL' | 'ACTIVE' | 'INACTIVE');
    setPage(1);
  }, []);

  const handleOpenConfirm = useCallback((user: AdminUser) => {
    if (user.role === 'ADMIN') return;
    setSelectedUser(user);
  }, []);

  const handleConfirmToggle = useCallback(async () => {
    if (!selectedUser) return;
    try {
      await toggleStatusMutation.mutateAsync({
        id: selectedUser.id,
        isActive: !selectedUser.isActive,
      });
      toast.success(t('toggle_success'));
      setSelectedUser(null);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  }, [selectedUser, toggleStatusMutation, t]);

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: 'name',
        meta: { title: t('name') },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('name')} />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} fallback={user.name || user.email || 'U'} size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {user.name || 'İstifadəçi'}
                </span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        meta: { title: t('role') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('role')}
          </span>
        ),
        cell: ({ row }) => {
          const role = row.original.role;
          return role === 'ADMIN' ? (
            <Badge variant="destructive">{t('admin')}</Badge>
          ) : role === 'VENDOR' ? (
            <Badge variant="default">{t('vendor')}</Badge>
          ) : (
            <Badge variant="secondary">{t('customer')}</Badge>
          );
        },
        enableSorting: false,
      },
      {
        id: 'orders_count',
        accessorFn: (row) => row._count?.orders ?? 0,
        meta: { title: t('orders_count'), className: 'text-center', headerClassName: 'text-center' },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('orders_count')} className="justify-center" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {row.original._count?.orders ?? 0}
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
            <Badge variant="destructive" className="inline-flex items-center gap-1">
              <X className="h-3 w-3" />
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
          const user = row.original;
          if (user.role === 'ADMIN') {
            return (
              <Button
                variant="ghost"
                size="icon-sm"
                disabled
                aria-label={t('cannot_toggle_admin')}
                title={t('cannot_toggle_admin')}
                className="ml-auto cursor-not-allowed text-muted-foreground"
              >
                <ShieldAlert className="h-4 w-4" />
              </Button>
            );
          }
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
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => handleOpenConfirm(user)}
                  disabled={toggleStatusMutation.isPending}
                  variant={user.isActive ? 'destructive' : 'default'}
                >
                  {user.isActive ? (
                    <>
                      <X className="h-4 w-4" />
                      {t('deactivate')}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {t('activate')}
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, handleOpenConfirm, toggleStatusMutation.isPending],
  );

  const users = usersData?.data ?? [];
  const pagination = usersData?.pagination;

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
        data={users}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyIcon={<Users className="h-7 w-7" />}
        emptyTitle={t('no_users')}
        emptyDescription={t('no_users_desc')}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder={t('search_placeholder')}
        filters={
          <>
            <DataTableFilterSelect
              value={roleFilter}
              onValueChange={handleRoleFilterChange}
              ariaLabel={t('role_filter')}
              placeholder={t('role_filter')}
              options={[
                { value: 'ALL', label: t('all') },
                { value: 'CUSTOMER', label: t('customer') },
                { value: 'VENDOR', label: t('vendor') },
                { value: 'ADMIN', label: t('admin') },
              ]}
            />
            <DataTableFilterSelect
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
              ariaLabel={t('status_filter')}
              placeholder={t('status_filter')}
              options={[
                { value: 'ALL', label: t('all') },
                { value: 'ACTIVE', label: t('active') },
                { value: 'INACTIVE', label: t('inactive') },
              ]}
            />
          </>
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
        open={selectedUser !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
        onConfirm={handleConfirmToggle}
        title={t('toggle_status_title')}
        description={t('toggle_status_confirm')}
        confirmLabel={t('confirm_btn')}
        cancelLabel={t('cancel_btn')}
        variant={selectedUser?.isActive ? 'destructive' : 'default'}
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
}
