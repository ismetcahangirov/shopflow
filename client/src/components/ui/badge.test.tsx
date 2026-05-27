// src/components/ui/badge.test.tsx
// Tests for Badge component: render, variant classes, and dot indicator

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders children correctly", () => {
    render(<Badge>New Item</Badge>);
    expect(screen.getByText("New Item")).toBeInTheDocument();
  });

  it("renders with a dot indicator when showDot is true", () => {
    render(<Badge showDot>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByTestId("badge-dot")).toBeInTheDocument();
  });

  it("does not render dot when showDot is false", () => {
    render(<Badge>Inactive</Badge>);
    expect(screen.queryByTestId("badge-dot")).not.toBeInTheDocument();
  });

  it("applies variant styling", () => {
    const { container: successContainer } = render(<Badge variant="success">Success</Badge>);
    expect(successContainer.firstChild).toHaveClass("text-emerald-700");

    const { container: destructiveContainer } = render(
      <Badge variant="destructive">Destructive</Badge>
    );
    expect(destructiveContainer.firstChild).toHaveClass("text-rose-700");
  });
});
