// src/app/[locale]/(shop)/orders/[id]/page.tsx

import type { Metadata } from 'next';
import OrderDetailClient from './OrderDetailClient';

export const metadata: Metadata = {
  title: 'Sifariş Detalı — ShopFlow',
  robots: 'noindex, nofollow',
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailClient orderId={id} />;
}
