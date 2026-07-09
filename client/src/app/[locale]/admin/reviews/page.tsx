'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  AlertCircle,
  Trash2,
  Check,
  X,
  RefreshCw,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StarRating } from '@/components/products/StarRating';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableFilterSelect,
} from '@/components/admin/data-table';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { parseApiError } from '@/lib/api';

import {
  useAdminReviews,
  useApproveReview,
  useDeleteReview,
  type AdminReviewsParams,
} from '@/hooks/useReviews';
import type { Review } from '@/types';

export default function AdminReviewsPage(): React.JSX.Element {
  const t = useTranslations('admin_reviews');
  const tc = useTranslations('common');

  // Filter and pagination states
  const [isApprovedFilter, setIsApprovedFilter] = useState<'' | 'true' | 'false'>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Confirm-delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Queries and mutations
  const queryParams = useMemo<AdminReviewsParams>(() => {
    const params: AdminReviewsParams = { page, limit };
    if (isApprovedFilter === 'true') params.isApproved = true;
    if (isApprovedFilter === 'false') params.isApproved = false;
    return params;
  }, [page, isApprovedFilter]);

  const { data: reviewsData, isLoading, isError, refetch } = useAdminReviews(queryParams);
  const approveMutation = useApproveReview();
  const deleteMutation = useDeleteReview();

  const handleFilterChange = useCallback((val: string) => {
    setIsApprovedFilter(val as '' | 'true' | 'false');
    setPage(1);
  }, []);

  const handleToggleApprove = useCallback(
    async (review: Review) => {
      const nextApproved = !review.isApproved;
      try {
        await approveMutation.mutateAsync({ id: review.id, isApproved: nextApproved });
        toast.success(nextApproved ? t('approve_success') : t('reject_success'));
      } catch (err) {
        toast.error(parseApiError(err));
      }
    },
    [approveMutation, t],
  );

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success(t('delete_success'));
      setDeletingId(null);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  }, [deletingId, deleteMutation, t]);

  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      {
        accessorKey: 'product',
        meta: { title: t('product') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('product')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.product?.name || 'Məhsul Silinib'}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'customer',
        meta: { title: t('customer') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('customer')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-foreground">
            {row.original.user?.name || 'Anonim'}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'rating',
        meta: { title: t('rating') },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('rating')} />
        ),
        cell: ({ row }) => (
          <div className="flex">
            <StarRating rating={row.original.rating} size="sm" />
          </div>
        ),
      },
      {
        accessorKey: 'body',
        meta: { title: t('comment') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('comment')}
          </span>
        ),
        cell: ({ row }) => (
          <div className="max-w-xs text-sm">
            {row.original.title && (
              <div className="mb-0.5 font-semibold text-foreground">
                {row.original.title}
              </div>
            )}
            <div className="line-clamp-2 text-muted-foreground">{row.original.body}</div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'createdAt',
        meta: { title: t('date') },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('date')} />
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
        accessorKey: 'isApproved',
        meta: { title: t('status_filter') },
        header: () => (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('status_filter')}
          </span>
        ),
        cell: ({ row }) =>
          row.original.isApproved ? (
            <Badge variant="success" className="inline-flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {t('approved')}
            </Badge>
          ) : (
            <Badge variant="warning" className="inline-flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {t('pending')}
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
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('actions')}
          </span>
        ),
        cell: ({ row }) => {
          const review = row.original;
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
                  onClick={() => handleToggleApprove(review)}
                  disabled={approveMutation.isPending}
                >
                  {review.isApproved ? (
                    <>
                      <X className="h-4 w-4" />
                      {t('reject')}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {t('approve')}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeletingId(review.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, handleToggleApprove, approveMutation.isPending],
  );

  const reviews = reviewsData?.data ?? [];
  const pagination = reviewsData?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: t('title') }]} />

        <PageHeader
          title={t('title')}
          description={t('subtitle')}
          actions={
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="rounded-xl"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {tc('refresh')}
            </Button>
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyIcon={<MessageSquare className="h-7 w-7" />}
        emptyTitle={t('no_reviews')}
        emptyDescription={t('empty_description')}
        filters={
          <DataTableFilterSelect
            value={isApprovedFilter || 'all'}
            onValueChange={(v) => handleFilterChange(v === 'all' ? '' : v)}
            ariaLabel={t('status_filter')}
            placeholder={t('status_filter')}
            options={[
              { value: 'all', label: t('all') },
              { value: 'false', label: t('pending') },
              { value: 'true', label: t('approved') },
            ]}
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
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title={t('delete')}
        description={t('delete_confirm')}
        confirmLabel={t('delete')}
        cancelLabel={tc('cancel')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
