// src/controllers/cartController.ts
// Cart Controller — GET (retrieve), POST (add), PATCH (update quantity), DELETE (remove item), DELETE (clear cart)

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

// ── Helper to retrieve and format the cart ──────────────────
async function getFormattedCart(userId: string): Promise<{
  id: string;
  itemCount: number;
  subtotal: number;
  items: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      stock: number;
      image: string | null;
    };
  }[];
}> {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
  }

  const items = cart.items.map((item) => {
    const mainImage = item.product.images.find((img) => img.isMain) || item.product.images[0];
    return {
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: Number(item.product.price),
        stock: item.product.stock,
        image: mainImage ? mainImage.url : null,
      },
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Return exactly the shape documented in API.md
  return {
    id: cart.id,
    itemCount,
    subtotal: Number(subtotal.toFixed(2)),
    items,
  };
}

// ── GET /api/cart ──────────────────────────────────────────
export const getCart = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
    const cart = await getFormattedCart(userId);

    successResponse(res, {
      message: 'Səbət uğurla gətirildi',
      data: cart,
    });
  },
);

// ── POST /api/cart/items ───────────────────────────────────
export const addToCart = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
    const { productId, quantity = 1 } = req.body as { productId: string; quantity?: number };

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw new AppError('Məhsul tapılmadı', 404, 'PRODUCT_NOT_FOUND');
    }

    // Get user's cart or create it
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if the item already exists in the cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    const targetQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (product.stock < targetQuantity) {
      throw new AppError('Məhsul stokda kifayət qədər yoxdur', 422, 'OUT_OF_STOCK');
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
      update: { quantity: targetQuantity },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity: targetQuantity,
      },
    });

    logger.info(`Product ${product.id} added/updated in cart for user ${userId} (qty: ${targetQuantity})`);

    const updatedCart = await getFormattedCart(userId);
    successResponse(res, {
      message: 'Məhsul səbətə əlavə edildi',
      data: updatedCart,
    });
  },
);

// ── PATCH /api/cart/items/:productId ───────────────────────
export const updateCartItem = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
    const productId = req.params.productId as string;
    const { quantity } = req.body as { quantity: number };

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new AppError('Məhsul səbətdə tapılmadı', 404, 'CART_ITEM_NOT_FOUND');
    }

    // Find the cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new AppError('Məhsul səbətdə tapılmadı', 404, 'CART_ITEM_NOT_FOUND');
    }

    if (cartItem.product.stock < quantity) {
      throw new AppError('Məhsul stokda kifayət qədər yoxdur', 422, 'OUT_OF_STOCK');
    }

    await prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: { quantity },
    });

    logger.info(`Cart item ${cartItem.id} quantity updated to ${quantity} for user ${userId}`);

    const updatedCart = await getFormattedCart(userId);
    successResponse(res, {
      message: 'Məhsulun miqdarı yeniləndi',
      data: updatedCart,
    });
  },
);

// ── DELETE /api/cart/items/:productId ─────────────────────
export const deleteCartItem = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
    const productId = req.params.productId as string;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new AppError('Məhsul səbətdə tapılmadı', 404, 'CART_ITEM_NOT_FOUND');
    }

    // Find the cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new AppError('Məhsul səbətdə tapılmadı', 404, 'CART_ITEM_NOT_FOUND');
    }

    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });

    logger.info(`Cart item ${cartItem.id} removed from cart for user ${userId}`);

    const updatedCart = await getFormattedCart(userId);
    successResponse(res, {
      message: 'Məhsul səbətdən silindi',
      data: updatedCart,
    });
  },
);

// ── DELETE /api/cart ───────────────────────────────────────
export const clearCart = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new AppError('Səbət tapılmadı', 404, 'CART_NOT_FOUND');
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    logger.info(`Cart cleared for user ${userId}`);

    const updatedCart = await getFormattedCart(userId);
    successResponse(res, {
      message: 'Səbət təmizləndi',
      data: updatedCart,
    });
  },
);
