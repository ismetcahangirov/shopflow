// src/components/ui/skeleton.tsx
// High-fidelity premium Skeleton components with smooth pulse animations and helper skeletons like ProductCardSkeleton and ProductGridSkeleton

import * as React from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800",
        className
      )}
      data-testid="skeleton-pulse"
      {...props}
    />
  );
}

// Product Card Skeleton - premium styling
export function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      data-testid="product-card-skeleton"
    >
      {/* Product Image Area */}
      <Skeleton className="aspect-square w-full rounded-xl" />

      {/* Brand & Category */}
      <Skeleton className="mt-4 h-3.5 w-1/3 rounded-lg" />

      {/* Title */}
      <Skeleton className="mt-2 h-5 w-3/4 rounded-lg" />

      {/* Rating & Reviews */}
      <Skeleton className="mt-2 h-4 w-1/2 rounded-lg" />

      {/* Price & Action Area */}
      <div className="mt-5 flex items-center justify-between">
        <Skeleton className="h-6 w-1/4 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
    </div>
  );
}

// Product Grid Skeleton - defaults to responsive 4 columns
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      data-testid="product-grid-skeleton"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export { Skeleton };
