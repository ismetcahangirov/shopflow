// src/app/[locale]/(shop)/cart/page.tsx
// Server-side entry for /cart route defining noindex metadata for privacy/SEO and rendering the client-side cart controller

import React from 'react';
import type { Metadata } from 'next';
import { CartPageClient } from './CartPageClient';

export const metadata: Metadata = {
  title: 'Səbət',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartPage(): React.JSX.Element {
  return <CartPageClient />;
}
