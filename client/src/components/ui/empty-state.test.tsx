// src/components/ui/empty-state.test.tsx
// Tests for EmptyState component: render text, action nodes, and custom icons

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";
import { Search } from "lucide-react";

describe("EmptyState", () => {
  it("renders title and description correctly", () => {
    render(<EmptyState title="No Products" description="Try adding some products first." />);
    expect(screen.getByText("No Products")).toBeInTheDocument();
    expect(screen.getByText("Try adding some products first.")).toBeInTheDocument();
  });

  it("renders custom action node when provided", () => {
    render(
      <EmptyState
        title="No items"
        description="Add items to cart"
        action={<button>Shop Now</button>}
      />
    );
    expect(screen.getByRole("button", { name: /shop now/i })).toBeInTheDocument();
  });

  it("renders custom leading icon when passed", () => {
    render(
      <EmptyState
        title="No results"
        description="Refine your filters"
        icon={<Search data-testid="custom-search-icon" />}
      />
    );
    expect(screen.getByTestId("custom-search-icon")).toBeInTheDocument();
  });
});
