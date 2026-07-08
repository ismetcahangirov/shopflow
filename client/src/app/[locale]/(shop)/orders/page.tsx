// src/app/[locale]/(shop)/orders/page.tsx

import type { Metadata } from 'next';
import OrdersPageClient from './OrdersPageClient';

export const metadata: Metadata = {
  title: 'Sifarişlərim',
  robots: 'noindex, nofollow',
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
