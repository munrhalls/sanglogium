import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StockMinimumSlider } from '../../../app/components/features/filters/StockMinimumSlider';

// Mock phosphor icon
vi.mock('@phosphor-icons/react', () => ({
  CounterClockwiseClock: ({ size, weight }: { size: number; weight: string }) =>
    React.createElement('svg', { width: size, height: size, 'data-weight': weight }, 'icon')
}));

describe('StockMinimumSlider', () => {
  const mockOnChange = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    maxStock: 50,
    value: 0,
    onChange: mockOnChange,
    onClear: mockOnClear,
  };

  it('renders availability controls with correct labels', () => {
    render(<StockMinimumSlider {...defaultProps} />);

    expect(screen.getByText('Availability')).toBeInTheDocument();
    expect(screen.getByText('Minimum Stock')).toBeInTheDocument();
    expect(screen.getByText('Any')).toBeInTheDocument(); // Default label
    expect(screen.getByTestId('stock-minimum-slider')).toBeInTheDocument();
  });

  it('shows dynamic label when slider value changes', () => {
    render(<StockMinimumSlider {...defaultProps} value={5} />);

    // Should show "At least 5 items" when value is 5
    expect(screen.getByText('At least 5 items')).toBeInTheDocument();
  });

  it('calls onChange when slider changes', () => {
    render(<StockMinimumSlider {...defaultProps} />);

    const slider = screen.getByTestId('stock-minimum-slider');
    fireEvent.change(slider, { target: { value: '10' } });

    expect(mockOnChange).toHaveBeenCalledWith(10);
  });

  it('calls onClear when slider moved to 0', () => {
    render(<StockMinimumSlider {...defaultProps} value={5} />);

    const slider = screen.getByTestId('stock-minimum-slider');
    fireEvent.change(slider, { target: { value: '0' } });

    // Should call onClear instead of onChange when value is 0
    expect(mockOnClear).toHaveBeenCalled();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('shows clear button when value is greater than 0', () => {
    render(<StockMinimumSlider {...defaultProps} value={5} />);

    expect(screen.getByTestId('clear-stock-minimum')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'icon' })).toBeInTheDocument();
  });

  it('does not show clear button when value is 0', () => {
    render(<StockMinimumSlider {...defaultProps} value={0} />);

    expect(screen.queryByTestId('clear-stock-minimum')).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    render(<StockMinimumSlider {...defaultProps} value={5} />);

    const clearButton = screen.getByTestId('clear-stock-minimum');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('handles maxStock fallback gracefully', () => {
    render(<StockMinimumSlider {...defaultProps} maxStock={0} />);

    const slider = screen.getByTestId('stock-minimum-slider');
    expect(slider).toHaveAttribute('max', '100'); // Should use fallback
  });
});
