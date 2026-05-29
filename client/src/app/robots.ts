import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/vendor/', '/cart/', '/checkout/', '/profile/', '/orders/'],
      },
    ],
    sitemap: [
      'https://shopflow.az/sitemap.xml',
      'https://shopflow.az/server-sitemap.xml',
    ],
  };
}
