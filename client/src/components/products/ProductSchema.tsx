import * as React from 'react';
import { Product } from '@/types';

export interface ProductSchemaProps {
  product: Product;
}

export function ProductSchema({ product }: ProductSchemaProps) {
  const {
    name,
    description,
    slug,
    price,
    stock,
    brand,
    avgRating,
    reviewCount,
    images,
    sku,
  } = product;

  // Generate complete URLs for search engine parsing
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopflow.az';
  const productUrl = `${baseUrl}/products/${slug}`;
  const imageUrls = images && images.length > 0
    ? images.map((img) => img.url)
    : [`${baseUrl}/images/placeholder-product.jpg`];

  const inStock = stock > 0;

  // Construct structured data object according to schema.org
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    image: imageUrls,
    description: description || name,
    sku: sku || `SF-${product.id}`,
    url: productUrl,
    ...(brand && {
      brand: {
        '@type': 'Brand',
        name: brand,
      },
    }),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'AZN',
      price: price.toString(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toString(),
        reviewCount: reviewCount.toString(),
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      data-testid="product-schema"
    />
  );
}
