'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { cn } from '@/lib/utils';
import { parseApiError } from '@/lib/api';
import { useCreateReview } from '@/hooks/useReviews';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating required').max(5),
  title: z.string().max(100).optional().or(z.literal('')),
  body: z.string().min(1, 'Comment required').max(1000),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const t = useTranslations('product');
  const [hoverRating, setHoverRating] = useState(0);
  const { mutate, isPending, isError, error } = useCreateReview();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', body: '' },
  });

  const currentRating = watch('rating');

  const onSubmit = (data: ReviewFormData) => {
    mutate(
      { productId, rating: data.rating, title: data.title || undefined, body: data.body },
      {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-200">{t('write_review')}</h3>

      {isError && (
        <p className="mb-3 text-sm text-red-600">{parseApiError(error)}</p>
      )}

      {/* Star Rating */}
      <div className="mb-4 flex items-center gap-2">
        <span className="mr-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t('rating')}:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue('rating', star, { shouldValidate: true })}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'h-6 w-6',
                (hoverRating || currentRating) >= star
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-600',
              )}
            />
          </button>
        ))}
      </div>

      <FormField
        label={t('review_title')}
        htmlFor="review-title"
        type="text"
        placeholder="Başlıq (istəyə bağlı)"
        {...register('title')}
      />

      <div className="mt-3">
        <label htmlFor="review-body" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('review_body') || 'Rəyiniz'}
        </label>
        <textarea
          id="review-body"
          rows={3}
          placeholder="Rəyinizi yazın..."
          className={cn(
            'w-full resize-none rounded-lg border px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2',
            errors.body?.message
              ? 'border-red-300 focus:ring-red-400'
              : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
          )}
          {...register('body')}
        />
        {errors.body?.message && (
          <p className="mt-1 text-xs text-red-500">{errors.body.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} isLoading={isPending} className="mt-4">
        {t('review_send') || 'Göndər'}
      </Button>
    </form>
  );
}
