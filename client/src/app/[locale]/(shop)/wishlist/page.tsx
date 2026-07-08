import type { Metadata } from 'next';
import WishlistPageClient from './WishlistPageClient';

export const metadata: Metadata = {
  title: 'İstək Siyahısı',
  robots: 'noindex, nofollow',
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
