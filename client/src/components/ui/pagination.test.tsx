// src/components/ui/pagination.test.tsx
// Tests for Pagination component: page switches, boundaries, and info display

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  const onPageChange = vi.fn();

  beforeEach(() => {
    onPageChange.mockClear();
  });

  it("does not render when totalPages is 1 or less", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders correct totalPages and active page button", () => {
    render(<Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />);

    const infoElement = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === "p" &&
        /səhifə\s*2\s*\/\s*3/i.test(element.textContent || "")
      );
    });
    expect(infoElement).toBeInTheDocument();
    
    // Page 2 button should be active
    const activeBtn = screen.getByRole("button", { name: /səhifə 2/i });
    expect(activeBtn).toHaveAttribute("aria-current", "page");
  });

  it("renders totalEntries information correctly if provided", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalEntries={45}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );
    const infoElement = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === "p" &&
        /toplam\s*45\s*nəticədən\s*1-10\s*arası\s*göstərilir/i.test(element.textContent || "")
      );
    });
    expect(infoElement).toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />);

    const prevBtn = screen.getByRole("button", { name: /əvvəlki səhifə/i });
    expect(prevBtn).toBeDisabled();

    const nextBtn = screen.getByRole("button", { name: /növbəti səhifə/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(<Pagination currentPage={3} totalPages={3} onPageChange={onPageChange} />);

    const nextBtn = screen.getByRole("button", { name: /növbəti səhifə/i });
    expect(nextBtn).toBeDisabled();
  });

  it("calls onPageChange with correct page index", () => {
    render(<Pagination currentPage={2} totalPages={4} onPageChange={onPageChange} />);

    // Click on page 3 button
    fireEvent.click(screen.getByRole("button", { name: /səhifə 3/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    // Click next page button (which will trigger currentPage + 1 = 3)
    fireEvent.click(screen.getByRole("button", { name: /növbəti səhifə/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it("renders ellipsis for large page count", () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />);

    // Two ellipsis symbols should be present (start & end)
    const ellipses = screen.getAllByTestId("pagination-ellipsis");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });
});
