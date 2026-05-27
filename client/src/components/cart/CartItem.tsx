'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import type { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps): React.JSX.Element {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { updateItem, removeItem, isMutating } = useCartStore();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1 || newQty > item.product.stock) return;
    setLocalQuantity(newQty);
    setLoading(true);
    try {
      await updateItem(item.product.id, newQty);
    } catch {
      setLocalQuantity(item.quantity);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeItem(item.product.id);
    } catch {
      // Handled by store
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = item.product.image || '/images/placeholder.png';

  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0 group">
      {/* Product Image Container */}
      <div className="relative aspect-square h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
        <Image
          src={imageUrl}
          alt={item.product.name}
          fill
          sizes="80px"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col min-w-0">
        <Link
          href={`/${locale}/products/${item.product.slug}`}
          className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
        >
          {item.product.name}
        </Link>
        <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t('price')}: <span className="font-semibold text-slate-850 dark:text-slate-200">{item.product.price.toFixed(2)} AZN</span>
        </span>

        {/* Quantity Controls & Delete */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/50">
            <button
              onClick={() => handleQuantityChange(localQuantity - 1)}
              disabled={localQuantity <= 1 || loading || isMutating}
              className="p-1 px-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-xs font-semibold text-slate-800 dark:text-slate-200">
              {localQuantity}
            </span>
            <button
              onClick={() => handleQuantityChange(localQuantity + 1)}
              disabled={localQuantity >= item.product.stock || loading || isMutating}
              className="p-1 px-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={loading || isMutating}
            className="flex items-center text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
            title={t('remove')}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right pl-2 hidden sm:block">
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {(item.product.price * localQuantity).toFixed(2)} AZN
        </span>
      </div>
    </div>
  );
}
