'use client';

import React from 'react';
import { User, CheckCircle } from 'lucide-react';

import { StarRating } from '@/components/products/StarRating';

export interface ReviewData {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  user: { id: string; name: string; avatar?: string | null };
}

interface ReviewCardProps {
  review: ReviewData;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{review.user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(review.createdAt).toLocaleDateString('az-AZ')}
            </p>
          </div>
        </div>
        {review.isVerified && (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            Alıcı
          </span>
        )}
      </div>

      <StarRating rating={review.rating} size="sm" />
      {review.title && <h4 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{review.title}</h4>}
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{review.body}</p>
    </div>
  );
}
