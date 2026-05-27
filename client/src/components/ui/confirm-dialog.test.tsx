// src/components/ui/confirm-dialog.test.tsx
// Tests for ConfirmDialog component: triggers confirm, triggers cancel, and validates variant color classes

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    onConfirm.mockClear();
    onClose.mockClear();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Sil"
        message="Əminsiniz?"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders title, message, and actions when open", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Silmək istəyirsiniz?"
        message="Bu əməliyyat geri qaytarıla bilməz."
        confirmText="Bəli, sil"
        cancelText="Geri"
      />
    );

    expect(screen.getByText("Silmək istəyirsiniz?")).toBeInTheDocument();
    expect(screen.getByText("Bu əməliyyat geri qaytarıla bilməz.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bəli, sil/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /geri/i })).toBeInTheDocument();
  });

  it("triggers onConfirm when confirm button clicked", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Təsdiq"
        message="Əminsiniz?"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /təsdiqlə/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("triggers onClose when cancel button clicked", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Təsdiq"
        message="Əminsiniz?"
      />
    );

    fireEvent.click(screen.getByText("İmtina"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders correct style variant classes", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Sil"
        message="Məlumat silinəcək"
        variant="destructive"
      />
    );

    const iconBg = screen.getByTestId("confirm-dialog-icon");
    expect(iconBg).toHaveClass("bg-rose-50");
  });
});
