// src/app/[locale]/account/orders/[id]/page.tsx

import type { Metadata } from 'next';
import { OrderDetail } from '@/components/orders/OrderDetail';

export const metadata: Metadata = {
  title: 'Sifariş Detalı',
  robots: 'noindex, nofollow',
};

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}
