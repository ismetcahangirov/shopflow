// src/components/ui/confirm-dialog.tsx
// High-fidelity premium Confirmation Dialog reusing our beautiful Modal component with primary, destructive, and warning styles

"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "destructive" | "warning";
  isLoading?: boolean;
}

const variantStyles = {
  primary: {
    iconBg: "bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400",
    icon: Info,
    confirmBtn: "default" as const,
  },
  destructive: {
    iconBg: "bg-rose-50 text-rose-650 dark:bg-rose-950/40 dark:text-rose-400",
    icon: AlertCircle,
    confirmBtn: "destructive" as const,
  },
  warning: {
    iconBg: "bg-amber-50 text-amber-650 dark:bg-amber-950/40 dark:text-amber-400",
    icon: AlertTriangle,
    confirmBtn: "default" as const, // default button has primary color, warning confirm button style
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Təsdiqlə",
  cancelText = "İmtina",
  variant = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  const activeStyle = variantStyles[variant];
  const Icon = activeStyle.icon;

  const footer = (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onClose}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {cancelText}
      </Button>
      <Button
        variant={activeStyle.confirmBtn}
        size="sm"
        onClick={onConfirm}
        isLoading={isLoading}
        className={cn(
          "w-full sm:w-auto",
          variant === "warning" &&
            "bg-amber-600 hover:bg-amber-700 shadow-amber-600/10 focus:ring-amber-500"
        )}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!isLoading}
      showCloseButton={!isLoading}
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Animated warning/info Icon */}
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
            activeStyle.iconBg
          )}
          data-testid="confirm-dialog-icon"
        >
          <Icon className="h-6 w-6" />
        </div>

        {/* Text Area */}
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>

        {/* Footer actions rendered directly below inside the content for premium vertical compact layouts */}
        <div className="mt-6 flex w-full flex-col sm:flex-row items-center justify-center gap-2">
          {footer}
        </div>
      </div>
    </Modal>
  );
}
