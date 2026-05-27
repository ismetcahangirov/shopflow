// src/components/ui/error-boundary.tsx
// React class-based ErrorBoundary component to capture client runtime crashes and render a clean premium ErrorState screen

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorState } from "./error-state";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Custom callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Call custom callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      // Standard log
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-6">
          <ErrorState
            title="Sistem xətası baş verdi"
            message={
              this.state.error?.message ||
              "Gözlənilməz bir xəta baş verdi. Zəhmət olmasa səhifəni yeniləyin."
            }
            onRetry={this.handleReset}
            retryText="Yenidən yüklə"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
