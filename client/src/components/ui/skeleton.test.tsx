// src/components/ui/skeleton.test.tsx
// Tests for Skeleton component: base pulse rendering, ProductCardSkeleton, and ProductGridSkeleton count matching

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton, ProductCardSkeleton, ProductGridSkeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders base skeleton correctly with pulse animation classes", () => {
    render(<Skeleton className="w-10 h-10" />);
    const pulse = screen.getByTestId("skeleton-pulse");
    expect(pulse).toBeInTheDocument();
    expect(pulse).toHaveClass("animate-pulse");
  });

  it("renders ProductCardSkeleton correctly", () => {
    render(<ProductCardSkeleton />);
    expect(screen.getByTestId("product-card-skeleton")).toBeInTheDocument();
  });

  it("renders ProductGridSkeleton with default count of items", () => {
    render(<ProductGridSkeleton count={4} />);
    expect(screen.getByTestId("product-grid-skeleton")).toBeInTheDocument();
    const cards = screen.getAllByTestId("product-card-skeleton");
    expect(cards).toHaveLength(4);
  });
});
