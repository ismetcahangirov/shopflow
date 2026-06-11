'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckCircle,
  AlertCircle,
  Trash2,
  Check,
  X,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StarRating } from '@/components/products/StarRating';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';

import { useAdminReviews, useApproveReview, useDeleteReview, type AdminReviewsParams } from '@/hooks/useReviews';
import type { Review } from '@/types';

export default function AdminReviewsPage(): React.JSX.Element {
  const t = useTranslations('admin_reviews');

  // Filter and pagination states
  const [isApprovedFilter, setIsApprovedFilter] = useState<'' | 'true' | 'false'>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals / Confirm states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Queries and mutations
  const queryParams = useMemo<AdminReviewsParams>(() => {
    const params: AdminReviewsParams = {
      page,
      limit,
    };
    if (isApprovedFilter === 'true') params.isApproved = true;
    if (isApprovedFilter === 'false') params.isApproved = false;
    return params;
  }, [page, isApprovedFilter]);

  const { data: reviewsData, isLoading, isError, refetch } = useAdminReviews(queryParams);
  const approveMutation = useApproveReview();
  const deleteMutation = useDeleteReview();


  // Reset page when filter changes
  const handleFilterChange = (val: '' | 'true' | 'false') => {
    setIsApprovedFilter(val);
    setPage(1);
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      setIsConfirmOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const handleToggleApprove = async (review: Review) => {
    try {
      await approveMutation.mutateAsync({
        id: review.id,
        isApproved: !review.isApproved,
      });
    } catch (err) {
      console.error('Failed to update review approval status:', err);
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

      {/* Filter Options Panel */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-880 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-start">
          <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
            {t('status_filter')}:
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-955 border border-slate-100 dark:border-slate-850">
            {(['', 'false', 'true'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => handleFilterChange(filter)}
                className={[
                  'rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-250',
                  isApprovedFilter === filter
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white',
                ].join(' ')}
              >
                {filter === ''
                  ? t('all')
                  : filter === 'false'
                  ? t('pending')
                  : t('approved')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
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
              Rəylər yüklənərkən xəta baş verdi. Yenidən cəhd edin.
            </p>
          </div>
        ) : !reviewsData?.data || reviewsData.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white">{t('no_reviews')}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-450 max-w-xs">
              Bu kateqoriya üzrə heç bir rəy tapılmadı.
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-4">{t('product')}</TableHead>
                    <TableHead className="px-6 py-4">{t('customer')}</TableHead>
                    <TableHead className="px-6 py-4 text-center">{t('rating')}</TableHead>
                    <TableHead className="px-6 py-4">{t('comment')}</TableHead>
                    <TableHead className="px-6 py-4">{t('date')}</TableHead>
                    <TableHead className="px-6 py-4 text-center">{t('status_filter')}</TableHead>
                    <TableHead className="px-6 py-4 text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewsData.data.map((review) => (
                    <TableRow key={review.id} className="group hover:bg-slate-50/20 dark:hover:bg-slate-950/5">
                      <TableCell className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {review.product?.name || 'Məhsul Silinib'}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {review.user?.name || 'Anonim'}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                            {review.user?.avatar ? 'Avatar mövcuddur' : 'İstifadəçi'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm max-w-xs text-slate-650 dark:text-slate-400">
                        {review.title && (
                          <div className="font-semibold text-slate-900 dark:text-white mb-0.5">
                            {review.title}
                          </div>
                        )}
                        <div className="line-clamp-2">{review.body}</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString('az-AZ', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        {review.isApproved ? (
                          <Badge variant="success" className="inline-flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {t('approved')}
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="inline-flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {t('pending')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleToggleApprove(review)}
                            disabled={approveMutation.isPending}
                            className={[
                              'p-2 h-auto rounded-lg transition-colors duration-200',
                              review.isApproved
                                ? 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/30'
                                : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-105 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30'
                            ].join(' ')}
                            title={review.isApproved ? t('reject') : t('approve')}
                          >
                            {review.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenDeleteConfirm(review.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 h-auto text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 rounded-lg transition-colors duration-200"
                            title={t('delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {reviewsData.pagination && (
              <div className="border-t border-slate-50 dark:border-slate-800/80 px-4">
                <Pagination
                  currentPage={page}
                  totalPages={reviewsData.pagination.pages}
                  onPageChange={setPage}
                  totalEntries={reviewsData.pagination.total}
                  pageSize={limit}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t('delete')}
        message={t('delete_confirm')}
        confirmText="Bəli, Sil"
        cancelText="Ləğv Et"
        variant="destructive"
      />
    </div>
  );
}
