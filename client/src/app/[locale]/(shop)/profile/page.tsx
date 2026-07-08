import type { Metadata } from 'next';
import ProfilePageClient from './ProfilePageClient';

export const metadata: Metadata = {
  title: 'Profilim',
  robots: 'noindex, nofollow',
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
