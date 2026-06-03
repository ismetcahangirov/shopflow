'use client';

// src/app/[locale]/(shop)/products/[slug]/ProductDetailClient.tsx
// Interactive product detail — image gallery, variant selector, quantity, add to cart

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, Star, Package, Tag, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ProductImages } from '@/components/products/ProductImages';
import { StarRating } from '@/components/products/StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductDetailClientProps {
  product: Product;
  locale: string;
}

const CURRENCY = '₼';

function formatPrice(price: number): string {
  return `${price.toFixed(2)} ${CURRENCY}`;
}

export function ProductDetailClient({ product, locale }: ProductDetailClientProps) {
  const t = useTranslations('product');
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUiStore((s) => s.openCart);

  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(
    product.variants?.[0]?.id ?? null
  );
  const [isAdding, setIsAdding] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) ?? null;
  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveStock = selectedVariant?.stock ?? product.stock;
  const inStock = effectiveStock > 0;
  const discountPct =
    product.comparePrice && product.comparePrice > effectivePrice
      ? Math.round(((product.comparePrice - effectivePrice) / product.comparePrice) * 100)
      : null;

  const handleDecrease = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrease = () => setQuantity((q) => Math.min(effectiveStock, q + 1));

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    setIsAdding(true);
    setErrorMsg(null);
    try {
      await addItem(product.id, quantity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      openCart();
    } catch (err) {
      console.error(err);
      setErrorMsg('Səbətə əlavə edilərkən xəta baş verdi.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    setIsAdding(true);
    setErrorMsg(null);
    try {
      await addItem(product.id, quantity);
      router.push(`/${locale}/checkout`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Səbətə əlavə edilərkən xəta baş verdi.');
      setIsAdding(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
      {/* ── Left: Image Gallery ── */}
      <div className="w-full">
        <ProductImages images={product.images} />
      </div>

      {/* ── Right: Product Info ── */}
      <div className="flex flex-col gap-6">
        {/* Breadcrumb path badges */}
        {product.category && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Link
              href={`/${locale}/products`}
              className="hover:text-indigo-500 transition-colors"
            >
              {t('filter_title') === 'Filters' ? 'Products' : 'Məhsullar'}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/${locale}/category/${product.category.slug}`}
              className="hover:text-indigo-500 transition-colors"
            >
              {product.category.name}
            </Link>
          </div>
        )}

        {/* Title + badges */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {product.isFeatured && (
              <Badge variant="secondary" className="text-xs font-bold">
                {t('featured_badge')}
              </Badge>
            )}
            {discountPct && (
              <Badge variant="destructive" className="text-xs font-bold">
                -{discountPct}%
              </Badge>
            )}
            {!inStock && (
              <Badge variant="outline" className="text-xs text-red-500 border-red-200">
                {t('out_of_stock')}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
            {product.name}
          </h1>
          {product.brand && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {t('brand')}: <span className="text-indigo-600 dark:text-indigo-400">{product.brand}</span>
            </p>
          )}
        </div>

        {/* Rating */}
        {product.avgRating > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={product.avgRating} size="sm" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {product.avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-slate-400">
              ({product.reviewCount} {t('reviews')})
            </span>
          </div>
        )}

        {/* Price block */}
        <div className="flex items-end gap-3 py-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {formatPrice(effectivePrice)}
          </span>
          {product.comparePrice && product.comparePrice > effectivePrice && (
            <span className="text-lg text-slate-400 line-through mb-0.5">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('variants')}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  disabled={variant.stock === 0}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200',
                    selectedVariantId === variant.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
                    variant.stock === 0 && 'opacity-40 cursor-not-allowed line-through'
                  )}
                >
                  {variant.name}
                  {variant.price !== product.price && (
                    <span className="ml-1 text-xs text-slate-400">
                      {formatPrice(variant.price)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock info */}
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-slate-400" />
          {inStock ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {t('in_stock')} — {effectiveStock} ədəd
            </span>
          ) : (
            <span className="text-red-500 dark:text-red-400 font-medium">{t('out_of_stock')}</span>
          )}
        </div>

        {/* Quantity + CTA */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Quantity selector */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden h-11">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="w-11 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-40 text-lg font-bold transition-colors"
            >
              −
            </button>
            <span className="w-11 h-full flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 border-x border-slate-200 dark:border-slate-700">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={quantity >= effectiveStock || !inStock}
              className="w-11 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-40 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>

          {/* Add to Cart */}
          <Button
            disabled={!inStock || isAdding}
            onClick={handleAddToCart}
            data-testid="add-to-cart-btn"
            size="lg"
            className="flex-1 gap-2 font-bold text-sm h-11 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
          >
            <ShoppingCart className="h-4 w-4" />
            {isAdding ? 'Səbətə əlavə edilir...' : t('add_to_cart')}
          </Button>

          {/* Buy Now */}
          <Button
            disabled={!inStock || isAdding}
            onClick={handleBuyNow}
            variant="outline"
            size="lg"
            className="flex-1 gap-2 font-bold text-sm h-11 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
          >
            <Zap className="h-4 w-4" />
            {t('buy_now')}
          </Button>
        </div>

        {/* Success/Error Alerts */}
        {showSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('added_to_cart')}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300">
            <span className="flex h-2 w-2 rounded-full bg-red-500" />
            {errorMsg}
          </div>
        )}

        {/* SKU + Tags */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
          {product.sku && (
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t('sku')}:</span>{' '}
              {product.sku}
            </p>
          )}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Tag className="h-3 w-3" />
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/${locale}/products?q=${encodeURIComponent(tag)}`}
                  className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Short Description */}
        {product.shortDesc && (
          <div className="pt-2">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {product.shortDesc}
            </p>
          </div>
        )}

        {/* Attributes */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('attributes')}
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {product.attributes.map((attr) => (
                <div key={attr.id} className="flex gap-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {attr.name}:
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Full Description (full-width below) ── */}
      {product.description && (
        <div className="lg:col-span-2 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-indigo-500" />
            {t('description')}
          </h2>
          <div
            className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </div>
  );
}
