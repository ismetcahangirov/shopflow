// src/app/layout.tsx
// Root layout wrapper for Next.js App Router

import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
