// src/components/ui/modal.test.tsx
// Tests for Modal component: render, close buttons, escape key, backdrop click, and layout

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./modal";

describe("Modal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={onClose}>
        Modal content
      </Modal>
    );
    expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
  });

  it("renders content, title, and close button when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Title">
        Modal content
      </Modal>
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close modal/i })).toBeInTheDocument();
  });

  it("triggers onClose when the close button is clicked", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Title">
        Modal content
      </Modal>
    );

    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("triggers onClose when clicking on overlay if closeOnBackdrop is true", () => {
    render(
      <Modal isOpen={true} onClose={onClose} closeOnBackdrop={true}>
        Modal content
      </Modal>
    );

    // Click backdrop (the outer overlay)
    fireEvent.click(screen.getByTestId("modal-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onClose when clicking on overlay if closeOnBackdrop is false", () => {
    render(
      <Modal isOpen={true} onClose={onClose} closeOnBackdrop={false}>
        Modal content
      </Modal>
    );

    // Click backdrop
    fireEvent.click(screen.getByTestId("modal-overlay"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not trigger onClose when clicking inside the modal content", () => {
    render(
      <Modal isOpen={true} onClose={onClose} closeOnBackdrop={true}>
        <div data-testid="inner-content">Modal content</div>
      </Modal>
    );

    fireEvent.click(screen.getByTestId("inner-content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("triggers onClose when Escape key is pressed", () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        Modal content
      </Modal>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders custom footer", () => {
    render(
      <Modal isOpen={true} onClose={onClose} footer={<button>Save Changes</button>}>
        Modal content
      </Modal>
    );

    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });
});
