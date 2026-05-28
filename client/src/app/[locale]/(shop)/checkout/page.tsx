// src/app/[locale]/(shop)/checkout/page.tsx

import type { Metadata } from 'next';
import CheckoutPageClient from './CheckoutPageClient';

export const metadata: Metadata = {
  title: 'Sifarişi rəsmiləşdir — ShopFlow',
  description: 'Sifarişinizi tamamlayın',
  robots: 'noindex, nofollow',
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
