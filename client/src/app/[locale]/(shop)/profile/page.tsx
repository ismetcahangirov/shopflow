// src/app/[locale]/(shop)/profile/page.tsx
// The profile UI has been consolidated into /account/settings. Keep this route
// as a permanent redirect so old links (and the previous header entry) still work.

import { redirect } from 'next/navigation';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/account/settings`);
}
