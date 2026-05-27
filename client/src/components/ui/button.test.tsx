// src/components/ui/button.test.tsx
// Tests for Button component: render, loading state, disabled state, interaction

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with content correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("renders loading spinner and disables button when isLoading is true", () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Submit
      </Button>
    );

    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toBeDisabled();
    
    // Check if the svg spinner is rendered
    const spinner = button.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();

    // Click shouldn't trigger handler
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does not click when disabled is true", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    const button = screen.getByRole("button", { name: /disabled button/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("triggers onClick handler when active", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
