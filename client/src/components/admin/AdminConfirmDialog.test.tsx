import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminConfirmDialog } from './AdminConfirmDialog';

describe('AdminConfirmDialog', () => {
  it('renders nothing meaningful when closed', () => {
    render(
      <AdminConfirmDialog
        open={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
      />,
    );
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('renders title, description and children when open', () => {
    render(
      <AdminConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete item"
        description="This cannot be undone"
        variant="destructive"
      >
        <div data-testid="extra">note</div>
      </AdminConfirmDialog>,
    );
    expect(screen.getByText('Delete item')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone')).toBeInTheDocument();
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <AdminConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        title="Confirm"
        confirmLabel="Yes"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('supports the default (non-destructive) variant without an icon', () => {
    render(
      <AdminConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title="Neutral"
        showIcon={false}
        confirmLabel="OK"
        cancelLabel="Cancel"
      />,
    );
    expect(screen.getByText('Neutral')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });
});
