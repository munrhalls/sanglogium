import { render, screen, fireEvent } from '@testing-library/react';
import { PriceRangeSlider } from '../PriceRangeSlider';

describe('PriceRangeSlider', () => {
  const mockOnChange = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('prevents min from exceeding or equaling max', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 500, max: 501 }} />);

    const minSlider = screen.getByTestId('price-min-slider');
    fireEvent.change(minSlider, { target: { value: '502' } });

    expect(mockOnChange).toHaveBeenCalledWith({ min: 500, max: undefined });
  });

  it('prevents max from going below or equaling min', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 500, max: 501 }} />);

    const maxSlider = screen.getByTestId('price-max-slider');
    fireEvent.change(maxSlider, { target: { value: '500' } });

    expect(mockOnChange).toHaveBeenCalledWith({ min: undefined, max: 501 });
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

  it('shows clear button when range is active', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 100, max: 500 }} />);

    expect(screen.getByTestId('clear-price-range')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('does not show clear button when range is inactive', () => {
    render(<PriceRangeSlider {...defaultProps} />);

    expect(screen.queryByTestId('clear-price-range')).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    render(<PriceRangeSlider {...defaultProps} value={{ min: 100, max: 500 }} />);

    const clearButton = screen.getByTestId('clear-price-range');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });
});
