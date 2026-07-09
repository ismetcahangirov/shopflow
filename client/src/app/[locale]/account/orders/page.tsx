// src/app/[locale]/account/orders/page.tsx

import type { Metadata } from 'next';
import { OrderList } from '@/components/orders/OrderList';

export const metadata: Metadata = {
  title: 'Sifarişlərim',
  robots: 'noindex, nofollow',
};

export default function AccountOrdersPage() {
  return <OrderList />;
}
