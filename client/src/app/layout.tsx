import { ReactNode } from 'react';

export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}

interface RootLayoutProps {
  children: ReactNode;
}
