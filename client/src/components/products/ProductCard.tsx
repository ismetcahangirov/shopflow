'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { Product } from '@/types';
import { StarRating } from './StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/store/wishlistStore';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations('product');
  const { toggleWishlist, isLiked } = useWishlistStore();
  const liked = isLiked(product.id);

  const {
    slug,
    name,
    price,
    comparePrice,
    stock,
    images,
    avgRating,
    reviewCount,
    brand,
    isFeatured,
  } = product;

  // Find primary image or use first image, fallback to default
  const mainImage = images?.find((img) => img.isMain) || images?.[0];
  const imageUrl = mainImage?.url || '/images/placeholder-product.jpg';

  const isOutOfStock = stock <= 0;

  // Calculate discount percentage
  const discountPercent =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800/40 dark:bg-slate-900',
        isOutOfStock && 'opacity-85'
      )}
      data-testid="product-card"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Link href={`/${locale}/products/${slug}`} className="block h-full w-full">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges Container */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <Badge variant="destructive" className="px-2.5 py-1 text-xs font-semibold shadow-sm">
              -{discountPercent}%
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 text-xs font-semibold shadow-sm dark:bg-indigo-500">
              {t('featured_badge') || 'Featured'}
            </Badge>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-black/20" />

        {/* Quick Action Buttons */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 translate-x-12 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-colors',
              liked
                ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white',
            )}
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn('h-4.5 w-4.5', liked && 'fill-current')} />
          </button>
          <Link
            href={`/${locale}/products/${slug}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            aria-label="View product details"
          >
            <Eye className="h-4.5 w-4.5" />
          </Link>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg dark:bg-red-500">
              {t('out_of_stock')}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4.5">
        {brand && (
          <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {brand}
          </span>
        )}

        <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold text-slate-800 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400">
          <Link href={`/${locale}/products/${slug}`} className="focus:outline-none">
            {name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="mb-3.5 flex items-center gap-1.5">
          <StarRating rating={avgRating} size="sm" />
          {reviewCount > 0 && (
            <span className="text-[11px] font-medium text-slate-450 dark:text-slate-500">
              ({reviewCount})
            </span>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-slate-400 line-through dark:text-slate-500">
                ₼{comparePrice.toFixed(2)}
              </span>
            )}
            <span className="text-base font-bold text-slate-900 dark:text-white">
              ₼{price.toFixed(2)}
            </span>
          </div>

          <Button
            size="sm"
            disabled={isOutOfStock}
            className={cn(
              'h-9 rounded-xl px-3 font-semibold shadow-sm transition-all duration-350',
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/40 dark:text-slate-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500'
            )}
            aria-label={t('add_to_cart')}
          >
            <ShoppingBag className="mr-1.5 h-4 w-4" />
            <span className="text-xs">{t('add_to_cart')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
