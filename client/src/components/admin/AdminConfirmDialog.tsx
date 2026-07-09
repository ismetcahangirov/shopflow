// src/components/admin/AdminConfirmDialog.tsx
// Reusable confirmation dialog for admin resource pages, built on the shadcn/
// Base UI `Dialog` primitive (replaces the old Modal-based ConfirmDialog). Use
// it for deletes and status changes; pass `children` to embed extra controls
// such as a moderation-note textarea.

"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface AdminConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  /** When false, hides the leading warning icon (e.g. for neutral confirmations). */
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function AdminConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Təsdiqlə",
  cancelLabel = "İmtina",
  variant = "default",
  isLoading = false,
  showIcon = true,
  children,
}: AdminConfirmDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isLoading} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {showIcon && (
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  variant === "destructive"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary",
                )}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <div className="space-y-1.5">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {children && <div className="py-1">{children}</div>}

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={isLoading}>
                {cancelLabel}
              </Button>
            }
          />
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
