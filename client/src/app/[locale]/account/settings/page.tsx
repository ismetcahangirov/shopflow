// src/app/[locale]/account/settings/page.tsx

import type { Metadata } from 'next';
import AccountSettingsClient from './AccountSettingsClient';

export const metadata: Metadata = {
  title: 'Ayarlar',
  robots: 'noindex, nofollow',
};

export default function AccountSettingsPage() {
  return <AccountSettingsClient />;
}
