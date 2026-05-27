// src/components/ui/stat-card.test.tsx
// Tests for StatCard component: rendering labels, values, trend directions, and icon slots

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./stat-card";
import { DollarSign } from "lucide-react";

describe("StatCard", () => {
  it("renders title and value correctly", () => {
    render(<StatCard title="Ümumi Gəlir" value="2,400 AZN" />);
    expect(screen.getByText("Ümumi Gəlir")).toBeInTheDocument();
    expect(screen.getByText("2,400 AZN")).toBeInTheDocument();
  });

  it("renders upward trends correctly", () => {
    render(
      <StatCard
        title="Sifarişlər"
        value="120"
        trend={{ value: "+12.4%", direction: "up", label: "keçən aya görə" }}
      />
    );

    const trendText = screen.getByTestId("stat-trend");
    expect(trendText).toBeInTheDocument();
    expect(trendText).toHaveClass("text-emerald-600");
    expect(trendText).toHaveTextContent("+12.4%");
    expect(screen.getByText("keçən aya görə")).toBeInTheDocument();
  });

  it("renders downward trends correctly", () => {
    render(
      <StatCard
        title="Gedişlər"
        value="45"
        trend={{ value: "-4.2%", direction: "down" }}
      />
    );

    const trendText = screen.getByTestId("stat-trend");
    expect(trendText).toBeInTheDocument();
    expect(trendText).toHaveClass("text-rose-600");
    expect(trendText).toHaveTextContent("-4.2%");
  });

  it("renders custom icon slot correctly", () => {
    render(
      <StatCard
        title="Gəlir"
        value="500$"
        icon={<DollarSign data-testid="custom-dollar-icon" />}
      />
    );

    expect(screen.getByTestId("custom-dollar-icon")).toBeInTheDocument();
  });
});
