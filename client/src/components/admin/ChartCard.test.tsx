// src/components/admin/ChartCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartCard } from './ChartCard';

describe('ChartCard', () => {
  it('renders title, description, action and children in the default state', () => {
    render(
      <ChartCard title="Revenue" description="Last 30 days" action={<button>Export</button>}>
        <div data-testid="chart-body">chart</div>
      </ChartCard>,
    );
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByTestId('chart-body')).toBeInTheDocument();
  });

  it('shows a loading skeleton and hides children when isLoading', () => {
    render(
      <ChartCard title="Revenue" isLoading>
        <div data-testid="chart-body">chart</div>
      </ChartCard>,
    );
    expect(screen.queryByTestId('chart-body')).not.toBeInTheDocument();
  });

  it('shows the error state when isError', () => {
    render(
      <ChartCard title="Revenue" isError errorText="Boom">
        <div data-testid="chart-body">chart</div>
      </ChartCard>,
    );
    expect(screen.getByTestId('chart-card-error')).toHaveTextContent('Boom');
    expect(screen.queryByTestId('chart-body')).not.toBeInTheDocument();
  });

  it('shows the empty state when isEmpty', () => {
    render(
      <ChartCard title="Revenue" isEmpty emptyText="Nothing here">
        <div data-testid="chart-body">chart</div>
      </ChartCard>,
    );
    expect(screen.getByTestId('chart-card-empty')).toHaveTextContent('Nothing here');
    expect(screen.queryByTestId('chart-body')).not.toBeInTheDocument();
  });

  it('prioritises the error state over the empty state', () => {
    render(<ChartCard title="Revenue" isError isEmpty errorText="Err" emptyText="Empty" />);
    expect(screen.getByTestId('chart-card-error')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-card-empty')).not.toBeInTheDocument();
  });
});
