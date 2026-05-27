// src/components/ui/error-boundary.test.tsx
// Tests for ErrorBoundary component: catching rendering errors and displaying fallback screens

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "./error-boundary";

// Component that intentionally throws an error
function ProblematicComponent({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Simulated Crash");
  }
  return <div data-testid="success-child">All good!</div>;
}

describe("ErrorBoundary", () => {
  // Prevent React from outputting console errors during the expected crash test
  const consoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = consoleError;
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("success-child")).toBeInTheDocument();
  });

  it("catches errors and renders fallback ErrorState screen", () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Sistem xətası baş verdi")).toBeInTheDocument();
    expect(screen.getByText("Simulated Crash")).toBeInTheDocument();
  });

  it("renders custom fallback node when provided", () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Opps! crashed!</div>}>
        <ProblematicComponent shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
  });

  it("resets hasError when retry is triggered", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Sistem xətası baş verdi")).toBeInTheDocument();

    // Rerender with fixed children (so it doesn't throw again on retry)
    rerender(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    // Trigger retry
    fireEvent.click(screen.getByRole("button", { name: /yenidən yüklə/i }));

    // Child component is rendered successfully
    expect(screen.getByTestId("success-child")).toBeInTheDocument();
  });
});
