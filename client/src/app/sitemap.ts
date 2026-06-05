import type { MetadataRoute } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.shopflow.az';

interface SlugEntry {
  slug: string;
  updatedAt?: string;
  children?: SlugEntry[];
}

function flattenSlugEntries(entries: SlugEntry[]): SlugEntry[] {
  return entries.flatMap((entry) => [
    entry,
    ...(Array.isArray(entry.children) ? flattenSlugEntries(entry.children) : []),
  ]);
}

async function fetchSlugs(endpoint: string): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}?limit=1000`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const payload = data.data;
    const entries = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload?.categories)
          ? payload.categories
          : [];

    return flattenSlugEntries(entries)
      .filter((entry) => typeof entry.slug === 'string' && entry.slug.length > 0)
      .map((entry) => ({
        slug: entry.slug,
        updatedAt: entry.updatedAt ?? new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://shopflow.az';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/az`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/ru`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/az/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/en/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/ru/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/az/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/en/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/ru/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/az/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/en/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/ru/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  const [products, categories] = await Promise.all([
    fetchSlugs('/products'),
    fetchSlugs('/categories'),
  ]);

  const productEntries: MetadataRoute.Sitemap = [];
  for (const p of products) {
    for (const locale of ['az', 'en', 'ru'] as const) {
      productEntries.push({
        url: `${baseUrl}/${locale}/products/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      });
    }
  }

  const categoryEntries: MetadataRoute.Sitemap = [];
  for (const c of categories) {
    for (const locale of ['az', 'en', 'ru'] as const) {
      categoryEntries.push({
        url: `${baseUrl}/${locale}/category/${c.slug}`,
        lastModified: new Date(c.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    }
  }

  return [...staticRoutes, ...productEntries, ...categoryEntries];
}
