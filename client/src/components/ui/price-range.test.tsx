// src/components/ui/price-range.test.tsx
// Tests for PriceRange component: renders bounds, active tracks, and handles range changes

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PriceRange } from "./price-range";

describe("PriceRange", () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it("renders boundaries and values correctly", () => {
    render(
      <PriceRange
        min={0}
        max={1000}
        value={[200, 800]}
        onChange={onChange}
        currencySymbol="AZN"
      />
    );

    expect(screen.getByText("200 AZN")).toBeInTheDocument();
    expect(screen.getByText("800 AZN")).toBeInTheDocument();

    const minSlider = screen.getByTestId("price-min-slider") as HTMLInputElement;
    const maxSlider = screen.getByTestId("price-max-slider") as HTMLInputElement;

    expect(minSlider.value).toBe("200");
    expect(maxSlider.value).toBe("800");
  });

  it("triggers onChange when min slider changes", () => {
    render(
      <PriceRange
        min={0}
        max={1000}
        value={[200, 800]}
        onChange={onChange}
      />
    );

    const minSlider = screen.getByTestId("price-min-slider");
    fireEvent.change(minSlider, { target: { value: "350" } });
    expect(onChange).toHaveBeenCalledWith([350, 800]);
  });

  it("triggers onChange when max slider changes", () => {
    render(
      <PriceRange
        min={0}
        max={1000}
        value={[200, 800]}
        onChange={onChange}
      />
    );

    const maxSlider = screen.getByTestId("price-max-slider");
    fireEvent.change(maxSlider, { target: { value: "750" } });
    expect(onChange).toHaveBeenCalledWith([200, 750]);
  });
});
