# SEO.md — SEO Strategiyası

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. SEO Arxitekturası

```
┌─────────────────────────────────────────────────────────────┐
│                      SEO LAYERLARI                          │
├─────────────────────────────────────────────────────────────┤
│  1. RENDERING           SSG + ISR (məhsullar, kateqoriyalar)│
│                         SSR (siyahı + filter)               │
│                         CSR noindex (səbət, admin, profil)  │
├─────────────────────────────────────────────────────────────┤
│  2. METADATA            generateMetadata() hər səhifədə     │
│                         title, description, keywords        │
│                         Open Graph, Twitter Card            │
├─────────────────────────────────────────────────────────────┤
│  3. STRUKTURLAŞDIRILMIŞ Product, BreadcrumbList,            │
│     DATA (JSON-LD)      Organization, WebSite+SearchAction  │
├─────────────────────────────────────────────────────────────┤
│  4. TEXNİKİ SEO          Canonical, hreflang, robots.txt    │
│                          sitemap.xml (statik + dinamik)     │
├─────────────────────────────────────────────────────────────┤
│  5. PERFORMANS           Core Web Vitals (LCP, CLS, INP)    │
│                          Lighthouse 95+ hədəf               │
├─────────────────────────────────────────────────────────────┤
│  6. DİL/BEYNƏLXALQ       /az/ /en/ /ru/ URL prefiksi        │
│                          hreflang + x-default               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Rendering Strategiyası (SEO Cəhətdən)

| Səhifə | Rendering | `revalidate` | SEO Əhəmiyyəti |
|---|---|---|---|
| Ana Səhifə | SSG + ISR | 3600s | ⭐⭐⭐⭐⭐ |
| Məhsul Detalı | SSG + ISR | 1800s | ⭐⭐⭐⭐⭐ |
| Kateqoriya | SSG + ISR | 3600s | ⭐⭐⭐⭐⭐ |
| Məhsul Siyahısı | SSR | — | ⭐⭐⭐⭐ |
| Axtarış | SSR + noindex | — | ⭐ |
| Səbət / Checkout | CSR + noindex | — | ❌ |
| Admin / Vendor | CSR + noindex | — | ❌ |
| Profil / Sifarişlər | CSR + noindex | — | ❌ |

```typescript
// ── ISR nümunəsi — məhsul detalı ─────────────────────────
// src/app/[locale]/(shop)/products/[slug]/page.tsx

export const revalidate = 1800;  // 30 dəqiqə

// Populyar məhsulları build zamanı pre-render et
export async function generateStaticParams() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?limit=100&sort=sales_desc`
  );
  const { data } = await res.json();

  return data.flatMap((product: { slug: string }) =>
    ['az', 'en', 'ru'].map((locale) => ({
      locale,
      slug: product.slug,
    }))
  );
}
```

---

## 3. Metadata Sistemi

### 3.1 Root Metadata

```typescript
// src/app/[locale]/layout.tsx

import type { Metadata, Viewport } from 'next';
import { getTranslations }         from 'next-intl/server';

const siteUrl = 'https://shopflow.az';

export const viewport: Viewport = {
  width:         'device-width',
  initialScale:  1,
  themeColor:    '#0F172A',
};

export async function generateMetadata({
  params: { locale },
}: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default:  t('site_title'),
      template: `%s | ${t('site_name')}`,
    },
    description: t('site_description'),
    keywords:    ['onlayn alış-veriş', 'Azərbaycan', 'mağaza', 'ShopFlow'],
    authors:     [{ name: 'ShopFlow', url: siteUrl }],
    creator:     'ShopFlow',
    publisher:   'ShopFlow',
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'az':        `${siteUrl}/az`,
        'en':        `${siteUrl}/en`,
        'ru':        `${siteUrl}/ru`,
        'x-default': `${siteUrl}/az`,
      },
    },
    openGraph: {
      type:      'website',
      siteName:  t('site_name'),
      locale:    locale === 'az' ? 'az_AZ' : locale === 'en' ? 'en_US' : 'ru_RU',
      url:       `${siteUrl}/${locale}`,
      images: [{
        url:    `${siteUrl}/og-image.jpg`,
        width:  1200,
        height: 630,
        alt:    t('site_name'),
      }],
    },
    twitter: {
      card:    'summary_large_image',
      creator: '@shopflow_az',
      images:  [`${siteUrl}/og-image.jpg`],
    },
    robots: {
      index:            true,
      follow:           true,
      googleBot: {
        index:  true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet':       -1,
      },
    },
    verification: {
      google: 'google_verification_code',  // Google Search Console
    },
    manifest: '/manifest.json',
    icons: {
      icon:    [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple:   '/apple-touch-icon.png',
      other:   [{ rel: 'mask-icon', url: '/safari-pinned-tab.svg' }],
    },
  };
}
```

### 3.2 Məhsul Detalı Metadata

```typescript
// src/app/[locale]/(shop)/products/[slug]/page.tsx

export async function generateMetadata({
  params: { locale, slug },
}: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title:  'Məhsul tapılmadı',
      robots: { index: false },
    };
  }

  const siteUrl = 'https://shopflow.az';
  const canonicalUrl = `${siteUrl}/${locale}/products/${slug}`;

  // Açıqlama 160 simvol limiti
  const description = product.description.length > 160
    ? product.description.slice(0, 157) + '...'
    : product.description;

  // Keywords: məhsul adı + brend + kateqoriya + tags
  const keywords = [
    product.name,
    product.brand,
    product.category.name,
    ...product.tags,
  ].filter(Boolean).join(', ');

  return {
    title:       product.name,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'az':        `${siteUrl}/az/products/${slug}`,
        'en':        `${siteUrl}/en/products/${slug}`,
        'ru':        `${siteUrl}/ru/products/${slug}`,
        'x-default': `${siteUrl}/az/products/${slug}`,
      },
    },
    openGraph: {
      type:        'website',
      title:       product.name,
      description,
      url:         canonicalUrl,
      images: product.images.map((img, i) => ({
        url:    img.url,
        width:  1200,
        height: 1200,
        alt:    img.alt || `${product.name} - ${i + 1}`,
      })),
    },
    twitter: {
      card:        'summary_large_image',
      title:       product.name,
      description,
      images:      [product.images[0]?.url],
    },
  };
}
```

### 3.3 Kateqoriya Metadata

```typescript
// src/app/[locale]/(shop)/category/[slug]/page.tsx

export async function generateMetadata({
  params: { locale, slug },
}: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const category = await getCategoryBySlug(slug);

  if (!category) return { robots: { index: false } };

  const siteUrl = 'https://shopflow.az';

  return {
    title:       category.metaTitle  ?? `${category.name} | ShopFlow`,
    description: category.metaDesc   ??
      `ShopFlow-da ${category.name} kateqoriyasında ən yaxşı məhsullar. Sərfəli qiymətlər, sürətli çatdırılma.`,
    alternates: {
      canonical: `${siteUrl}/${locale}/category/${slug}`,
      languages: {
        'az':        `${siteUrl}/az/category/${slug}`,
        'en':        `${siteUrl}/en/category/${slug}`,
        'ru':        `${siteUrl}/ru/category/${slug}`,
        'x-default': `${siteUrl}/az/category/${slug}`,
      },
    },
    openGraph: {
      title:  category.name,
      images: category.image ? [{ url: category.image }] : [],
    },
  };
}
```

---

## 4. JSON-LD Strukturlaşdırılmış Data

### 4.1 Məhsul Schema (Product)

```typescript
// src/components/shop/ProductSchema.tsx
// Server Component — 'use client' yoxdur

interface ProductSchemaProps {
  product: {
    name:         string;
    slug:         string;
    description:  string;
    price:        number;
    comparePrice?: number;
    sku:          string;
    stock:        number;
    brand?:       string;
    images:       { url: string }[];
    avgRating:    number;
    reviewCount:  number;
    category:     { name: string };
  };
}

export function ProductSchema({ product }: ProductSchemaProps) {
  const siteUrl = 'https://shopflow.az';

  // Etibarlılıq tarixi — 7 gün
  const priceValidUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const schema = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        product.name,
    description: product.description,
    image:       product.images.map((img) => img.url),
    sku:         product.sku,
    url:         `${siteUrl}/az/products/${product.slug}`,

    ...(product.brand && {
      brand: {
        '@type': 'Brand',
        name:    product.brand,
      },
    }),

    offers: {
      '@type':         'Offer',
      url:              `${siteUrl}/az/products/${product.slug}`,
      priceCurrency:   'AZN',
      price:            product.price,
      priceValidUntil,
      availability:     product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition:   'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name:    'ShopFlow',
      },
    },

    ...(product.comparePrice && {
      offers: {
        '@type':         'AggregateOffer',
        priceCurrency:   'AZN',
        lowPrice:         product.price,
        highPrice:        product.comparePrice,
      },
    }),

    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type':      'AggregateRating',
        ratingValue:   product.avgRating.toFixed(1),
        reviewCount:   product.reviewCount,
        bestRating:   '5',
        worstRating:  '1',
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  );
}
```

### 4.2 Breadcrumb Schema

```typescript
// src/components/layout/Breadcrumb.tsx

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const siteUrl = 'https://shopflow.az';

  const schema = {
    '@context':        'https://schema.org',
    '@type':           'BreadcrumbList',
    itemListElement:    items.map((item, index) => ({
      '@type':    'ListItem',
      position:    index + 1,
      name:        item.label,
      ...(item.href && { item: `${siteUrl}${item.href}` }),
    })),
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Görünən breadcrumb */}
      <nav aria-label="breadcrumb" className="py-3">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-300">/</span>}
              {item.href && index < items.length - 1 ? (
                <a
                  href={item.href}
                  className="hover:text-accent transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
```

### 4.3 Organization Schema (Ana Səhifə)

```typescript
// src/app/[locale]/(shop)/page.tsx — Server Component

function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type':    'Organization',
    name:       'ShopFlow',
    url:        'https://shopflow.az',
    logo:       'https://shopflow.az/logo.png',
    contactPoint: {
      '@type':        'ContactPoint',
      email:          'info@shopflow.az',
      contactType:    'customer service',
      availableLanguage: ['Azerbaijani', 'English', 'Russian'],
    },
    sameAs: [
      'https://instagram.com/shopflow_az',
      'https://facebook.com/shopflow.az',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### 4.4 WebSite + SearchAction Schema

```typescript
// src/app/[locale]/(shop)/page.tsx — axtarış Google-da görünsün

function WebsiteSchema({ locale }: { locale: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    name:       'ShopFlow',
    url:        `https://shopflow.az/${locale}`,
    potentialAction: {
      '@type':      'SearchAction',
      target: {
        '@type':    'EntryPoint',
        urlTemplate: `https://shopflow.az/${locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

## 5. Robots.txt

```typescript
// src/app/robots.ts — Next.js 14 robots API

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://shopflow.az';

  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow: [
          '/admin',
          '/admin/',
          '/vendor',
          '/vendor/',
          '/checkout',
          '/cart',
          '/profile',
          '/profile/',
          '/orders',
          '/orders/',
          '/wishlist',
          '/login',
          '/register',
          '/reset-password',
          '/*/admin',
          '/*/vendor',
          '/*/checkout',
          '/*/cart',
          '/*/profile',
          '/*/orders',
          '/*/wishlist',
          '/*/login',
          '/*/register',
          '/api/',
        ],
      },
    ],
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/server-sitemap.xml`,
    ],
    host: siteUrl,
  };
}
```

---

## 6. Sitemap

```typescript
// src/app/sitemap.ts — Statik URL-lər

import { MetadataRoute } from 'next';

const siteUrl = 'https://shopflow.az';
const locales  = ['az', 'en', 'ru'];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: '',           priority: 1.0,  changeFreq: 'daily'   as const },
    { path: '/products',  priority: 0.9,  changeFreq: 'daily'   as const },
    { path: '/search',    priority: 0.5,  changeFreq: 'weekly'  as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url:           `${siteUrl}/${locale}${page.path}`,
        lastModified:   new Date(),
        changeFrequency: page.changeFreq,
        priority:       page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${siteUrl}/${l}${page.path}`])
          ),
        },
      });
    }
  }

  return entries;
}
```

```typescript
// src/app/server-sitemap.xml/route.ts — Dinamik (məhsullar + kateqoriyalar)

import { getServerSideSitemap } from 'next-sitemap';
import type { ISitemapField }   from 'next-sitemap';

const locales  = ['az', 'en', 'ru'];
const siteUrl  = 'https://shopflow.az';

export async function GET() {
  const [productsRes, categoriesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=2000&isActive=true`,
      { next: { revalidate: 3600 } }
    ),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`,
      { next: { revalidate: 86400 } }
    ),
  ]);

  const { data: products }   = await productsRes.json();
  const { data: categories } = await categoriesRes.json();

  const fields: ISitemapField[] = [];

  // Məhsullar — hər dil üçün
  for (const product of products) {
    for (const locale of locales) {
      fields.push({
        loc:        `${siteUrl}/${locale}/products/${product.slug}`,
        changefreq: 'daily',
        priority:   0.85,
        lastmod:    product.updatedAt ?? new Date().toISOString(),
        alternateRefs: locales.map((l) => ({
          href:     `${siteUrl}/${l}/products/${product.slug}`,
          hreflang: l,
        })),
      });
    }
  }

  // Kateqoriyalar
  for (const cat of categories) {
    for (const locale of locales) {
      fields.push({
        loc:        `${siteUrl}/${locale}/category/${cat.slug}`,
        changefreq: 'weekly',
        priority:   0.75,
        alternateRefs: locales.map((l) => ({
          href:     `${siteUrl}/${l}/category/${cat.slug}`,
          hreflang: l,
        })),
      });
    }
  }

  return getServerSideSitemap(fields);
}
```

---

## 7. Core Web Vitals Optimallaşması

### 7.1 LCP (Largest Contentful Paint) — Hədəf: < 2.5s

```typescript
// ✅ Hero şəkli üçün priority={true}
<Image
  src={heroImage}
  alt="ShopFlow Hero"
  fill
  priority={true}      // LCP şəkli — preload edilir
  sizes="100vw"
/>

// ✅ Məhsul siyahısının ilk 4 şəkli priority
{products.map((product, index) => (
  <ProductCard
    key={product.id}
    product={product}
    priority={index < 4}    // İlk 4 şəkil viewport-dadır
  />
))}

// ✅ Font optimallaşması (FOUT yoxdur)
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets:  ['latin', 'cyrillic'],
  display:  'swap',
  preload:  true,
  variable: '--font-inter',
});
```

### 7.2 CLS (Cumulative Layout Shift) — Hədəf: < 0.1

```tsx
// ✅ Şəkil container-ında aspect-ratio
<div className="relative aspect-square">  {/* Yer ayırılır — layout shift yoxdur */}
  <Image src={url} alt={alt} fill className="object-cover" />
</div>

// ✅ Skeleton placeholder — yüklənilərkən
{isLoading ? (
  <ProductGridSkeleton count={8} />
) : (
  <ProductGrid products={products} />
)}

// ✅ Font display: swap (text görünür, sonra font dəyişir)
const inter = Inter({ display: 'swap' });

// ❌ Pis — ölçüsüz şəkil (layout shift baş verir)
<Image src={url} alt={alt} width={300} />  // height verilməyib
```

### 7.3 INP (Interaction to Next Paint) — Hədəf: < 200ms

```typescript
// ✅ Debounce — axtarış inputu
import { useDebounce } from '@/hooks/useDebounce';

const [query,        setQuery]        = useState('');
const debouncedQuery = useDebounce(query, 300);    // 300ms gözlə

useEffect(() => {
  if (debouncedQuery) fetchResults(debouncedQuery);
}, [debouncedQuery]);

// ✅ useTransition — siyahı filter dəyişikliyi
import { useTransition } from 'react';

const [isPending, startTransition] = useTransition();

const handleFilterChange = (newFilter: string) => {
  startTransition(() => {
    setFilter(newFilter);   // UI bloklenmır
  });
};

// ✅ Ağır siyahılar üçün virtualizasiya
// react-virtual və ya @tanstack/react-virtual
```

---

## 8. URL Strukturu (SEO-Friendly)

```
✅  Düzgün URL strukturu:
    /az/products/iphone-15-pro-256gb-natural-titanium
    /az/category/elektronika/telefonlar
    /az/search?q=iphone

✅  Slug qaydaları:
    • Yalnız kiçik hərf
    • Boşluq → tire (-)
    • Xüsusi simvollar silinir
    • Azərbaycanca hərf → transliterasiya
    • Maksimum 60 simvol

❌  Pis URL-lər:
    /products?id=clx1234abc        ← ID əsaslı
    /məhsul/iPhone 15 Pro          ← Boşluq + xüsusi simvol
    /products/Product-123-abc-xyz  ← Mənasız
```

---

## 9. Internal Linking Strategiyası

```
Ana Səhifə
├── → Kateqoriyalar (nav)
├── → Öne çıxan məhsullar
└── → Yeni məhsullar

Kateqoriya Səhifəsi
├── → Ana kateqoriya (breadcrumb)
├── → Alt kateqoriyalar (sidebar)
└── → Məhsullar (grid)

Məhsul Detalı
├── → Ana Səhifə (breadcrumb)
├── → Kateqoriya (breadcrumb)
├── → Oxşar məhsullar (eyni kateqoriya)
└── → Eyni brendin məhsulları

Axtarış Nəticələri
└── → Məhsul detalları
```

---

## 10. robots Meta Tag-ları

```typescript
// Noindex olmalı səhifələr:

// Axtarış nəticələri (duplicate content)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Admin panel
// → middleware.ts ilə yönləndirilir (noindex header əlavə edilir)

// Checkout, Səbət, Profil
// → Layout-da noindex metadata
```

---

## 11. Performans Büdcəsi

| Metrik | Hədəf | Ölçü yeri |
|---|---|---|
| Lighthouse Performance | 90+ | Məhsul detalı |
| Lighthouse SEO | 100 | Bütün public səhifələr |
| LCP | < 2.5s | İlk ekran |
| CLS | < 0.1 | Bütün səhifələr |
| INP | < 200ms | İnteraktiv elementlər |
| TTFB | < 800ms | SSG + ISR cache hit |
| Bundle Size | < 150KB (initial JS) | `next build` analiz |

```bash
# Lighthouse CI
npm install --save-dev @lhci/cli

# Analiz
npx lhci autorun

# Bundle analiz
ANALYZE=true npm run build
# → next/bundle-analyzer açılır
```

---

## 12. SEO Yoxlama Siyahısı

```
METADATA
  [ ]  Hər public səhifədə unikal title (50-60 simvol)
  [ ]  Hər public səhifədə unikal description (150-160 simvol)
  [ ]  Open Graph şəkli 1200×630px
  [ ]  Twitter Card konfiqurasiya edilib
  [ ]  Canonical URL hər səhifədə

TEXNİKİ
  [ ]  robots.txt mövcuddur (/robots.txt)
  [ ]  sitemap.xml mövcuddur (/sitemap.xml)
  [ ]  Dinamik sitemap işləyir (/server-sitemap.xml)
  [ ]  hreflang (az/en/ru/x-default) bütün səhifələrdə
  [ ]  404 səhifəsi düzgün HTTP 404 qaytarır
  [ ]  Sıxılmış şəkillər (WebP/AVIF)
  [ ]  HTTPS (HTTP → HTTPS redirect)

STRUKTURLAŞDIRILMIŞ DATA
  [ ]  Product schema məhsul səhifəsində
  [ ]  BreadcrumbList bütün alt səhifələrdə
  [ ]  Organization schema ana səhifədə
  [ ]  SearchAction schema ana səhifədə
  [ ]  Google Rich Results Test keçib

PERFORMANS
  [ ]  Lighthouse Performance 90+
  [ ]  Lighthouse SEO 100
  [ ]  LCP < 2.5s
  [ ]  CLS < 0.1
  [ ]  INP < 200ms

MƏZMUN
  [ ]  Hər məhsulun unikal açıqlaması var
  [ ]  Bütün şəkillərdə alt mətni var
  [ ]  Kateqoriyaların meta title/desc-i var
  [ ]  Internal linklər düzgün qurulub

BEYNƏLXALQ
  [ ]  /az/ /en/ /ru/ URL-lər işləyir
  [ ]  Dil seçici düzgün yönləndirir
  [ ]  Hər dil üçün sitemap mövcuddur
```
