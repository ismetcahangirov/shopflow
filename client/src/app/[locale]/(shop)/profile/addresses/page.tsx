// src/app/[locale]/(shop)/profile/addresses/page.tsx
// Address list page — SSR wrapper with metadata + i18n redirect

import type { Metadata } from 'next';
import AddressListClient from './AddressListClient';

export const metadata: Metadata = {
  title: 'Ünvanlarım — ShopFlow',
  description: 'Çatdırılma ünvanlarınızı idarə edin',
  robots: 'noindex, nofollow',
};

export default function AddressesPage() {
  return <AddressListClient />;
}
