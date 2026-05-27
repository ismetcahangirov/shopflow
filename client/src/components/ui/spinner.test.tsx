// src/components/ui/spinner.test.tsx
// Tests for Spinner component: render and size classes

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("renders correctly with role status", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("applies sizing and variant classes", () => {
    const { container: primaryContainer } = render(<Spinner variant="primary" size="lg" />);
    expect(primaryContainer.firstChild).toHaveClass("h-12");
    expect(primaryContainer.firstChild).toHaveClass("w-12");
    expect(primaryContainer.firstChild).toHaveClass("border-indigo-600");

    const { container: whiteContainer } = render(<Spinner variant="white" size="xs" />);
    expect(whiteContainer.firstChild).toHaveClass("h-3.5");
    expect(whiteContainer.firstChild).toHaveClass("w-3.5");
    expect(whiteContainer.firstChild).toHaveClass("border-white");
  });
});
