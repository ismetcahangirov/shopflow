// src/components/ui/error-state.test.tsx
// Tests for ErrorState component: render message, custom titles, and click handlers

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("renders default title and error message correctly", () => {
    render(<ErrorState message="Sistem qoşulma xətası" />);
    expect(screen.getByText("Bir xəta baş verdi")).toBeInTheDocument();
    expect(screen.getByText("Sistem qoşulma xətası")).toBeInTheDocument();
  });

  it("renders custom title when provided", () => {
    render(<ErrorState title="Uğursuz ödəniş" message="Kart tapılmadı" />);
    expect(screen.getByText("Uğursuz ödəniş")).toBeInTheDocument();
    expect(screen.getByText("Kart tapılmadı")).toBeInTheDocument();
  });

  it("renders retry button and triggers onRetry callback when clicked", () => {
    const handleRetry = vi.fn();
    render(<ErrorState message="Xəta" onRetry={handleRetry} retryText="Təkrarla" />);

    const btn = screen.getByRole("button", { name: /təkrarla/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
