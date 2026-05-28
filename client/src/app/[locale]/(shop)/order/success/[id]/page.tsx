// src/app/[locale]/(shop)/order/success/[id]/page.tsx

import type { Metadata } from 'next';
import OrderSuccessClient from './OrderSuccessClient';

export const metadata: Metadata = {
  title: 'Sifariş Təsdiqləndi — ShopFlow',
  robots: 'noindex, nofollow',
};

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderSuccessClient orderId={id} />;
}
