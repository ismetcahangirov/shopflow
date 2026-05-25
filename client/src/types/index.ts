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
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
  images: string[];
  vendorId: string;
  categoryId: string;
  averageRating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    name: string;
    storeName?: string | null;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  productId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
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
