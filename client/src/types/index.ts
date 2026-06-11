// src/types/index.ts
// Unified TypeScript types for UI components, API payloads, and state management

import { User, UserRole } from '@/store/authStore';

export type { User, UserRole };

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  metaTitle?: string | null;
  metaDesc?: string | null;
  children?: Category[];
  _count?: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isMain: boolean;
  sortOrder: number;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  sku: string;
  barcode?: string | null;
  stock: number;
  lowStockAlert?: number;
  weight?: number | null;
  brand?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  avgRating: number;
  reviewCount: number;
  salesCount: number;
  metaTitle?: string | null;
  metaDesc?: string | null;
  categoryId: string;
  vendorId: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  vendor?: {
    id: string;
    storeName: string | null;
  };
  images: ProductImage[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
}

export interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  isApproved: boolean;
  isVerified: boolean;
  helpfulCount: number;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };

  product?: {
    id: string;
    name: string;
    slug: string;
  };
}


export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image: string | null;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: CartProduct;
}

export interface Cart {
  id: string;
  itemCount: number;
  subtotal: number;
  items: CartItem[];
}


export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'COD';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    district: string;
    street: string;
    building: string;
    apartment?: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  building: string | null;
  apartment: string | null;
  zip: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidateResponse {
  coupon: Coupon;
  discount: number;
  finalTotal: number;
}
