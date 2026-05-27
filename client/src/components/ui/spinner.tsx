// src/components/ui/spinner.tsx
// High-fidelity premium loading Spinner component with multiple sizes and variants

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-solid border-t-transparent shrink-0",
  {
    variants: {
      variant: {
        primary: "border-indigo-600 dark:border-indigo-400",
        secondary: "border-slate-400 dark:border-slate-555",
        slate: "border-slate-600 dark:border-slate-300",
        white: "border-white",
      },
      size: {
        xs: "h-3.5 w-3.5 border",
        sm: "h-5 w-5 border-2",
        md: "h-8 w-8 border-[3px]",
        lg: "h-12 w-12 border-[3px]",
        xl: "h-16 w-16 border-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, variant, size, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Spinner, spinnerVariants };
