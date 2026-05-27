// src/components/ui/page-header.test.tsx
// Tests for PageHeader component: render headings, descriptions, actions, and breadcrumb containers

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders title and description correctly", () => {
    render(<PageHeader title="Məhsullar" description="Mağazadakı məhsulların siyahısı" />);
    expect(screen.getByRole("heading", { name: "Məhsullar", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Mağazadakı məhsulların siyahısı")).toBeInTheDocument();
  });

  it("renders breadcrumbs on top when passed", () => {
    render(
      <PageHeader
        title="Məhsullar"
        breadcrumbs={<div data-testid="breadcrumb-mock">Breadcrumbs</div>}
      />
    );
    expect(screen.getByTestId("breadcrumb-mock")).toBeInTheDocument();
  });

  it("renders actions list when passed", () => {
    render(
      <PageHeader
        title="Məhsullar"
        actions={<button data-testid="action-button">Yeni məhsul</button>}
      />
    );
    expect(screen.getByTestId("action-button")).toBeInTheDocument();
  });
});
