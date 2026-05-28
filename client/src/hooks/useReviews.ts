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
