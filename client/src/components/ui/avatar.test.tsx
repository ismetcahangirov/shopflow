// src/components/ui/avatar.test.tsx
// Tests for Avatar component: render image, fallback initials, loading state, error handling

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("renders initials fallback when src is not provided", () => {
    render(<Avatar fallback="John Doe" />);
    const fallback = screen.getByTestId("avatar-fallback");
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent("JD");
  });

  it("renders image and hides fallback once image is loaded", () => {
    render(<Avatar src="https://example.com/avatar.png" fallback="John Doe" />);
    
    const img = screen.getByTestId("avatar-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/avatar.png");

    // Trigger load event
    fireEvent.load(img);

    // After loading, the fallback layer (if any is shown during loading) doesn't overlay the image
    expect(img).toHaveClass("opacity-100");
  });

  it("switches to initials fallback if image load fails", () => {
    render(<Avatar src="https://example.com/invalid.png" fallback="John Doe" />);
    
    const img = screen.getByTestId("avatar-image");
    
    // Trigger error event
    fireEvent.error(img);

    // Fallback initials are visible
    const fallback = screen.getByTestId("avatar-fallback");
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent("JD");
  });
});
