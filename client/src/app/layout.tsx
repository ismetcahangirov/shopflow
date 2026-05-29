import { ReactNode } from 'react';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ShopFlow',
  url: 'https://shopflow.az',
  logo: 'https://shopflow.az/logo.png',
  sameAs: [],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ShopFlow',
  url: 'https://shopflow.az',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://shopflow.az/az/products?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, websiteSchema]),
        }}
      />
      {children}
    </>
  );
}

interface RootLayoutProps {
  children: ReactNode;
}
