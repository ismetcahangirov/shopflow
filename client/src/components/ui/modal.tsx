// src/components/ui/modal.tsx
// High-fidelity premium styled Modal/Dialog component with sizes, close on backdrop click, backdrop animation, scale animation, and keyboard support

"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-md w-full",
  md: "max-w-lg w-full",
  lg: "max-w-2xl w-full",
  xl: "max-w-5xl w-full",
  full: "max-w-full w-full h-[100dvh] md:h-auto md:max-w-[95vw] md:max-h-[90vh]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  showCloseButton = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Esc key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === overlayRef.current) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all duration-300",
        "animate-[fadeIn_0.2s_ease-out]"
      )}
      data-testid="modal-overlay"
    >
      <div
        className={cn(
          "relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800",
          "animate-[scaleUp_0.2s_ease-out] transition-all duration-300",
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
        data-testid="modal-content"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
            {title ? (
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-650 dark:text-slate-300">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/30">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
