// src/app/[locale]/(shop)/orders/[id]/page.tsx
// Legacy path — order detail now lives under the account section. Redirect to keep old links working.

import { redirect } from 'next/navigation';

export default async function OrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  redirect(`/${locale}/account/orders/${id}`);
}
