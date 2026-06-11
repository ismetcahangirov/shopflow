'use client';

// src/components/reviews/ProductReviewSection.tsx
// Full review section: summary + paginated list + write-a-review form

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, MessageSquarePlus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

import { useReviews } from '@/hooks/useReviews';
import { useAuthStore } from '@/store/authStore';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/products/StarRating';

interface ProductReviewSectionProps {
  productId: string;
  avgRating: number;
  reviewCount: number;
}

const REVIEWS_PER_PAGE = 5;

export function ProductReviewSection({
  productId,
  avgRating,
  reviewCount,
}: ProductReviewSectionProps) {
  const t = useTranslations('product');
  const { isAuthenticated } = useAuthStore();

  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, isError } = useReviews(productId, page, REVIEWS_PER_PAGE);

  const totalPages = data ? Math.ceil((data.summary?.totalCount ?? reviewCount) / REVIEWS_PER_PAGE) : 1;
  const distribution = data?.summary?.distribution ?? {};
  const liveAvg = data?.summary?.avgRating ?? avgRating;
  const liveTotal = data?.summary?.totalCount ?? reviewCount;

  return (
    <section
      id="reviews"
      className="lg:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-10 space-y-8"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          {t('reviews')}
          {liveTotal > 0 && (
            <span className="text-sm font-normal text-slate-400 ml-1">({liveTotal})</span>
          )}
        </h2>
        {isAuthenticated && !showForm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowForm(true)}
            className="gap-1.5 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
          >
            <MessageSquarePlus className="h-4 w-4" />
            {t('write_review')}
          </Button>
        )}
      </div>

      {/* ── Rating Summary ── */}
      {liveTotal > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          {/* Average score */}
          <div className="flex flex-col items-center justify-center min-w-[80px]">
            <span className="text-5xl font-extrabold text-slate-900 dark:text-white leading-none">
              {liveAvg.toFixed(1)}
            </span>
            <StarRating rating={liveAvg} size="sm" className="mt-1.5" />
            <span className="text-xs text-slate-400 mt-1">{liveTotal} rəy</span>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 w-full space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[String(star)] ?? 0;
              const pct = liveTotal > 0 ? Math.round((count / liveTotal) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right text-slate-500 font-medium">{star}</span>
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-slate-500">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Write Review Form ── */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onSuccess={() => {
            setShowForm(false);
            setPage(1);
          }}
        />
      )}

      {/* ── Review List ── */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      )}

      {isError && (
        <p className="text-center text-sm text-red-500 py-8">Rəylər yüklənərkən xəta baş verdi.</p>
      )}

      {!isLoading && !isError && data && (
        <>
          {data.reviews.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Star className="h-10 w-10 text-slate-200 dark:text-slate-700 mx-auto" />
              <p className="text-sm text-slate-400">{t('no_reviews')}</p>
              {isAuthenticated && !showForm && (
                <Button
                  size="sm"
                  onClick={() => setShowForm(true)}
                  className="mt-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  {t('be_first')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {data.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
