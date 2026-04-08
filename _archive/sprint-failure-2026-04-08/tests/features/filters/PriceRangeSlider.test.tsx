import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PriceRangeSlider } from '../../../app/components/features/filters/PriceRangeSlider';

// Mock phosphor icon
vi.mock('@phosphor-icons/react', () => ({
  ClockCounterClockwise: ({ size, weight }: { size: number; weight: string }) =>
    React.createElement('svg', { width: size, height: size, 'data-weight': weight }, 'icon')
}));

describe('PriceRangeSlider', () => {
  const mockOnChange = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    min: 0,
    max: 10000,
    value: { min: undefined, max: undefined },
    onChange: mockOnChange,
    onClear: mockOnClear,
  };

  it('renders price range controls', () => {
    render(<PriceRangeSlider {...defaultProps} />);

    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByTestId('price-min-slider')).toBeInTheDocument();
    expect(screen.getByTestId('price-max-slider')).toBeInTheDocument();
  });

  it('shows current price values', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 100, max: 500 }} />);

    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('calls onChange when min slider changes', () => {
    render(<PriceRangeSlider {...defaultProps} />);

    const minSlider = screen.getByTestId('price-min-slider');
    fireEvent.change(minSlider, { target: { value: '200' } });

    expect(mockOnChange).toHaveBeenCalledWith({ min: 200, max: undefined });
  });

  it('calls onChange when max slider changes', () => {
    render(<PriceRangeSlider {...defaultProps} />);

    const maxSlider = screen.getByTestId('price-max-slider');
    fireEvent.change(maxSlider, { target: { value: '800' } });

    expect(mockOnChange).toHaveBeenCalledWith({ min: undefined, max: 800 });
  });

  it('clamps min to be less than max', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 500, max: 501 }} />);

    const minSlider = screen.getByTestId('price-min-slider');
    fireEvent.change(minSlider, { target: { value: '502' } });

    // When trying to set min to 502 (>= max of 501), it should be clamped to max-1 = 500
    // Max value should remain unchanged
    expect(mockOnChange).toHaveBeenCalledWith({ min: 500, max: 501 });
  });

  it('clamps max to be greater than min', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 500, max: 501 }} />);

    const maxSlider = screen.getByTestId('price-max-slider');
    fireEvent.change(maxSlider, { target: { value: '500' } });

    // When trying to set max to 500 (<= min of 500), it should be clamped to min+1 = 501
    // Min value should remain unchanged
    expect(mockOnChange).toHaveBeenCalledWith({ min: 500, max: 501 });
  });

  it('validates slider values', () => {
    render(<PriceRangeSlider {...defaultProps} />);

    // Test that sliders work within bounds
    const minSlider = screen.getByTestId('price-min-slider');
    const maxSlider = screen.getByTestId('price-max-slider');

    expect(minSlider).toHaveAttribute('min', '0');
    expect(minSlider).toHaveAttribute('max', '10000');
    expect(maxSlider).toHaveAttribute('min', '0');
    expect(maxSlider).toHaveAttribute('max', '10000');
  });

  it('shows clear button when range has values different from defaults', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 100, max: 5000 }} />);

    expect(screen.getByTestId('clear-price-range')).toBeInTheDocument();
  });

  it('does not show clear button when range matches defaults', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 0, max: 10000 }} />);

    // the range is considered inactive and clear button should not show
    expect(screen.queryByTestId('clear-price-range')).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 100, max: 5000 }} />);

    const clearButton = screen.getByTestId('clear-price-range');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('handles URL injected invalid range (min > max) by calling onChange to fix state', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 10500, max: 10000 }} />);

    // Component should detect invalid state and call onChange to fix it
    // When min (10500) > max (10000), should call onChange with corrected values
    // Expected: min should be clamped to max-1 = 9999
    expect(mockOnChange).toHaveBeenCalledWith({ min: 9999, max: 10000 });
  });

  it('calls onClear when min slider moved to default and max is already at default', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 1000, max: 10000 }} />);

    const minSlider = screen.getByTestId('price-min-slider');
    fireEvent.change(minSlider, { target: { value: '0' } });

    // When min moved to 0 (defaultMin) and max is already 10000 (defaultMax)
    // Should call onClear to remove filter from URL, not onChange with default values
    expect(mockOnClear).toHaveBeenCalled();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('calls onClear when max slider moved to default and min is already at default', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 0, max: 5000 }} />);

    const maxSlider = screen.getByTestId('price-max-slider');
    fireEvent.change(maxSlider, { target: { value: '10000' } });

    // When max moved to 10000 (defaultMax) and min is already 0 (defaultMin)
    // Should call onClear to remove filter from URL, not onChange with default values
    expect(mockOnClear).toHaveBeenCalled();
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
