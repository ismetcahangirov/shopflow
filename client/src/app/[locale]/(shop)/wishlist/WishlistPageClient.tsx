'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { parseApiError } from '@/lib/api';
import Image from 'next/image';

export default function WishlistPageClient() {
  const t = useTranslations('wishlist');
  const { data: items, isLoading, isError, error, refetch } = useWishlist();
  const removeMutation = useRemoveFromWishlist();
  const addToCart = useCartStore((s) => s.addItem);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <Skeleton className="mb-6 h-10 w-56" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <ErrorState message={parseApiError(error)} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>

      {!items || items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-12 w-12 text-slate-400" />}
          title={t('empty')}
          description={t('empty_desc')}
          action={
            <Link href="/products">
              <Button>{t('browse_products')}</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-slate-200 bg-white p-3 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <Link href={`/products/${item.product.slug}`} className="block">
                <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Heart className="h-10 w-10" />
                    </div>
                  )}
                  {item.product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{t('out_of_stock')}</span>
                    </div>
                  )}
                </div>
                <h3 className="mb-1 font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{item.product.name}</h3>
                <p className="font-bold text-indigo-600 dark:text-indigo-400">{item.product.price.toFixed(2)} AZN</p>
              </Link>

              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={item.product.stock === 0}
                  onClick={() => addToCart(item.product.id)}
                >
                  <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                  {t('add_to_cart')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMutation.mutate(item.product.id)}
                  disabled={removeMutation.isPending}
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/50 dark:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
