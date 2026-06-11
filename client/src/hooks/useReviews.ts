// src/hooks/useReviews.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';
import type { Review } from '@/types';

interface ReviewSummary {
  avgRating: number;
  totalCount: number;
  distribution: Record<string, number>;
}

interface ReviewsResponse {
  reviews: Review[];
  summary?: ReviewSummary;
}

interface ReviewsApiResponse extends ApiResponse<Review[]> {
  summary?: ReviewSummary;
}

export function useReviews(productId: string, page = 1, limit = 10) {
  return useQuery<ReviewsResponse>({
    queryKey: ['reviews', productId, page],
    queryFn: async () => {
      const res = await api.get<ReviewsApiResponse>(`/reviews?productId=${productId}&page=${page}&limit=${limit}`);
      return {
        reviews: res.data.data,
        summary: res.data.summary,
      };
    },
    enabled: !!productId,
  });
}

interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  body: string;
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateReviewPayload>({
    mutationFn: async (payload) => {
      await api.post('/reviews', payload);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vars.productId] });
    },
  });
}

// ── Admin hooks ──────────────────────────────────────────────────────────────

export interface AdminReviewsParams {
  page?: number;
  limit?: number;
  isApproved?: boolean | '';
}

interface AdminReviewsApiResponse extends ApiResponse<Review[]> {
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export function useAdminReviews(params: AdminReviewsParams = {}) {
  const { page = 1, limit = 10, isApproved = '' } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  if (isApproved !== '') searchParams.set('isApproved', String(isApproved));

  return useQuery<AdminReviewsApiResponse>({
    queryKey: ['admin-reviews', page, limit, isApproved],
    queryFn: async () => {
      const res = await api.get<AdminReviewsApiResponse>(`/reviews/admin?${searchParams.toString()}`);
      return res.data;
    },
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; isApproved: boolean }>({
    mutationFn: async ({ id, isApproved }) => {
      await api.patch(`/reviews/${id}/approve`, { isApproved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
}
