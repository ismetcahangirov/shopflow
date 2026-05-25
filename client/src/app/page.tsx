// src/app/page.tsx
// Root page that redirects to the default locale

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/az');
}
