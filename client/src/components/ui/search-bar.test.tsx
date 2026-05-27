// src/components/ui/search-bar.test.tsx
// Tests for SearchBar component: input processing, clear triggers, and debounce timing checks

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "./search-bar";

describe("SearchBar", () => {
  const onSearch = vi.fn();

  beforeEach(() => {
    onSearch.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with placeholder correctly", () => {
    render(<SearchBar onSearch={onSearch} placeholder="Məhsul axtar..." />);
    expect(screen.getByPlaceholderText("Məhsul axtar...")).toBeInTheDocument();
  });

  it("triggers onSearch only after the debounce delay", () => {
    render(<SearchBar onSearch={onSearch} debounceMs={300} />);
    const input = screen.getByTestId("search-bar-input");

    fireEvent.change(input, { target: { value: "Ayaqqabı" } });

    // Should NOT trigger instantly
    expect(onSearch).not.toHaveBeenCalled();

    // Fast-forward 150ms - should still NOT trigger
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(onSearch).not.toHaveBeenCalled();

    // Fast-forward another 150ms (total 300ms) - should trigger
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("Ayaqqabı");
  });

  it("renders clear button when value is entered and clears correctly on click", () => {
    render(<SearchBar onSearch={onSearch} initialValue="Telefon" />);
    
    const clearBtn = screen.getByTestId("search-bar-clear");
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);

    const input = screen.getByTestId("search-bar-input") as HTMLInputElement;
    expect(input.value).toBe("");

    // Advance timer to trigger debounced onSearch after clear
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenLastCalledWith("");
  });
});
