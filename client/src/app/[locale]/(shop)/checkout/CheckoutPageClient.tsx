'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, MapPin, ShoppingBag, AlertCircle } from 'lucide-react';

import { getStripe } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { parseApiError } from '@/lib/api';
import { useAddresses } from '@/hooks/useAddresses';
import { useCartStore } from '@/store/cartStore';
import { useCouponStore } from '@/store/couponStore';
import { useCreateOrder, useCreatePaymentIntent } from '@/hooks/useOrders';
import type { Address } from '@/types';

const stripePromise = getStripe();

interface StripePaymentFormProps {
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

function StripePaymentForm({ onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations('checkout');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/success`,
      },
      redirect: 'if_required',
    });

    setIsProcessing(false);

    if (error) {
      onError(error.message ?? t('payment_failed'));
    } else {
      onSuccess('confirmed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing} isLoading={isProcessing} className="mt-2 h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700">
        {t('pay_now')}
      </Button>
    </form>
  );
}

export default function CheckoutPageClient() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const cart = useCartStore((s) => s.cart);
  const appliedCoupon = useCouponStore((s) => s.applied);
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const applyCouponDiscount = appliedCoupon?.discount ?? 0;

  const createOrder = useCreateOrder();
  const createPaymentIntent = useCreatePaymentIntent();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shippingCost = subtotal >= 150 ? 0 : 5;
  const discountAmount = appliedCoupon ? applyCouponDiscount : 0;
  const total = subtotal + shippingCost - discountAmount;

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a: Address) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  const handleCreateOrder = useCallback(async () => {
    setError(null);
    createOrder.mutate(
      {
        addressId: selectedAddressId,
        couponCode: appliedCoupon?.code || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: async (order) => {
          setOrderId(order.id);
          createPaymentIntent.mutate(order.id, {
            onSuccess: (intent) => {
              setClientSecret(intent.clientSecret);
              setStep('payment');
            },
            onError: (err) => {
              setError(parseApiError(err));
            },
          });
        },
        onError: (err) => {
          setError(parseApiError(err));
        },
      },
    );
  }, [selectedAddressId, appliedCoupon, notes, createOrder, createPaymentIntent]);

  const handlePaymentSuccess = (resultOrderId: string) => {
    useCartStore.getState().clearCart();
    useCouponStore.getState().clearCoupon();
    router.push(`/order/success/${resultOrderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <ShoppingBag className="h-16 w-16 text-slate-300" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('empty_cart_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400">{t('empty_cart_desc')}</p>
        <Button onClick={() => router.push('/products')}>{t('continue_shopping')}</Button>
      </div>
    );
  }

  const isMutating = createOrder.isPending || createPaymentIntent.isPending;

  if (step === 'payment' && clientSecret) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <StripePaymentForm onSuccess={handlePaymentSuccess} onError={setError} />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Address Selection */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
          <MapPin className="h-5 w-5 text-indigo-500" />
          {t('shipping_address')}
        </h2>
        {addressesLoading ? (
          <Spinner />
        ) : addresses && addresses.length > 0 ? (
          <div className="flex flex-col gap-2">
            {addresses.map((addr: Address) => (
              <label
                key={addr.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all',
                  selectedAddressId === addr.id
                    ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700',
                )}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mt-1 h-4 w-4 text-indigo-600"
                />
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{addr.fullName}</p>
                  <p>{addr.phone}</p>
                  <p>{[addr.street, addr.building, addr.apartment].filter(Boolean).join(', ')}</p>
                  <p>{addr.district}, {addr.city}</p>
                  {addr.isDefault && (
                    <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {t('default')}
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t('no_address')}</p>
        )}

        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/profile/addresses')}>
            + {t('add_address')}
          </Button>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-200">{t('order_notes')}</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('order_notes_placeholder')}
          rows={2}
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Order Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-200">{t('order_summary')}</h2>
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 text-sm dark:border-slate-700">
          {items.map((item: { product: { id: string; name: string; price: number; stock: number; slug: string; image: string | null }; quantity: number }) => (
            <div key={item.product.id} className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{item.product.name} × {item.quantity}</span>
              <span>{(item.product.price * item.quantity).toFixed(2)} AZN</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>{t('subtotal')}</span>
            <span>{subtotal.toFixed(2)} AZN</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>{t('shipping')}</span>
            <span>{shippingCost === 0 ? t('free') : `${shippingCost.toFixed(2)} AZN`}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t('discount')}</span>
              <span>-{discountAmount.toFixed(2)} AZN</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
            <span>{t('total')}</span>
            <span>{total.toFixed(2)} AZN</span>
          </div>
        </div>

        <Button
          onClick={handleCreateOrder}
          disabled={!selectedAddressId || isMutating}
          isLoading={isMutating}
          className="mt-4 h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {t('place_order')}
        </Button>
      </div>
    </div>
  );
}
