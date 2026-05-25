// src/app/[locale]/layout.tsx
// Main localized layout combining next-intl, TanStack Query, and aesthetic base layouts

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { routing } from '@/i18n/routing';
import Providers from '@/components/providers/Providers';
import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    template: '%s | ShopFlow',
    default: 'ShopFlow — E-Ticarət Platforması',
  },
  description: 'Azərbaycanın ən böyük e-ticarət platforması. Ən yeni məhsullar, sürətli çatdırılma və təhlükəsiz ödəniş.',
};

export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  // Validate that the incoming locale is supported
  if (!routing.locales.includes(locale as 'az' | 'en' | 'ru')) {
    notFound();
  }

  // Retrieve translation messages for the current locale
  const messages = useMessages();

  return (
    <html lang={locale} className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans antialiased selection:bg-primary-500 selection:text-white transition-colors duration-300">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <div className="relative flex min-h-screen flex-col overflow-hidden">
              {/* Decorative radial gradients for rich premium aesthetics */}
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%)]" />
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.05),transparent_50%)]" />
              
              <main className="flex-1 flex flex-col">{children}</main>
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
