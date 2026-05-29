/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://shopflow.az',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/vendor/*', '/cart/*', '/checkout/*', '/profile/*', '/orders/*', '/server-sitemap.xml'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/vendor/', '/cart/', '/checkout/', '/profile/', '/orders/'] },
    ],
    additionalSitemaps: ['https://shopflow.az/server-sitemap.xml'],
  },
  alternateRefs: [
    { href: 'https://shopflow.az/az', hreflang: 'az' },
    { href: 'https://shopflow.az/en', hreflang: 'en' },
    { href: 'https://shopflow.az/ru', hreflang: 'ru' },
    { href: 'https://shopflow.az', hreflang: 'x-default' },
  ],
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  generateIndexSitemap: false,
};
