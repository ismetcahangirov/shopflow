// src/app/[locale]/(shop)/orders/page.tsx
// Legacy path — order history now lives under the account section. Redirect to keep old links working.

import { redirect } from 'next/navigation';

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/account/orders`);
}
