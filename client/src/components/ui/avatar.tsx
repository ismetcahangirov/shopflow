// src/components/ui/avatar.tsx
// High-fidelity premium Avatar component with multiple sizes, initials fallback, dynamic loading indicator, and error recovery

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback: string; // Initials or character like "JD"
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg font-bold",
  xl: "h-20 w-20 text-2xl font-bold",
  "2xl": "h-28 w-28 text-4xl font-bold",
};

export function Avatar({
  src,
  alt = "User Avatar",
  fallback,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extract up to 2 characters for initials
  const initials = fallback
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const showImage = src && !hasError;

  return (
    <div
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50 text-slate-600 font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showImage && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 10vw, 5vw"
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          onLoad={() => setIsLoading(false)}
          className={cn(
            "object-cover transition-opacity duration-200",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          data-testid="avatar-image"
        />
      )}

      {(!showImage || isLoading) && (
        <span
          className="absolute inset-0 flex items-center justify-center bg-indigo-50/60 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400"
          data-testid="avatar-fallback"
        >
          {initials}
        </span>
      )}
    </div>
  );
}
