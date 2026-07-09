// src/components/ui/button.tsx
// High-fidelity premium styled button with loading state, icons, and focus styles

import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-xl font-bold whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/10 focus:ring-indigo-500",
        outline: "border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-900 focus:ring-slate-500",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus:ring-slate-500",
        ghost: "text-slate-650 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100 focus:ring-slate-500",
        destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/10 focus:ring-rose-500",
        link: "text-indigo-600 hover:underline dark:text-indigo-400 focus:ring-indigo-500",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm gap-2",
        xs: "h-7 px-2.5 text-xs rounded-lg gap-1",
        sm: "h-9 px-3.5 py-2 text-xs rounded-lg gap-1.5",
        lg: "h-12 px-6 py-3 text-base rounded-2xl gap-2.5",
        icon: "h-11 w-11 rounded-xl",
        // Compact icon button used by shadcn primitives (e.g. SidebarTrigger, DialogClose).
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <ButtonPrimitive
        data-slot="button"
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-1.5 shrink-0" />
            {children}
          </>
        ) : (
          children
        )}
      </ButtonPrimitive>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
