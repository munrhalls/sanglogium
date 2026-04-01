import { render, screen, fireEvent } from '@testing-library/react';
import { FilterSidebar } from '../../app/components/features/filters/FilterSidebar';

// Mock the useFilterNuqs hook
jest.mock('../../app/components/features/filters/useFilterNuqs', () => ({
  useFilterNuqs: jest.fn(),
}));

const mockUseFilterNuqs = require('../../app/components/features/filters/useFilterNuqs').useFilterNuqs;

// Mock PriceRangeSlider
jest.mock('../../app/components/features/filters/PriceRangeSlider', () => ({
  PriceRangeSlider: jest.fn(({ onChange, onClear, value }) => (
    <div data-testid="price-range-slider">
      <button onClick={() => onChange({ min: 100, max: 500 })}>Set Range</button>
      <button onClick={onClear}>Clear Range</button>
      <div data-testid="price-range-value">{JSON.stringify(value)}</div>
    </div>
  )),
}));

describe('FilterSidebar - Price Range Integration', () => {
  const mockFilters = [
    {
      field: 'brand',
      label: 'Brand',
      options: [
        { value: 'sony', label: 'Sony' },
        { value: 'bose', label: 'Bose' },
      ],
    },
    {
      field: 'type',
      label: 'Type',
      options: [
        { value: 'wireless', label: 'Wireless' },
        { value: 'wired', label: 'Wired' },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseFilterNuqs.mockReturnValue({
      getPriceRange: jest.fn().mockReturnValue({ min: undefined, max: undefined }),
      setPriceRange: jest.fn(),
      clearPriceRange: jest.fn(),
      isFilterActive: jest.fn().mockReturnValue(false),
      toggleFilter: jest.fn(),
    });
  });

  it('renders PriceRangeSlider component', () => {
    render(<FilterSidebar filters={mockFilters} />);
    
    expect(screen.getByTestId('price-range-slider')).toBeInTheDocument();
  });

  it('passes correct price range to PriceRangeSlider', () => {
    const mockPriceRange = { min: 100, max: 500 };
    mockUseFilterNuqs.mockReturnValue({
      getPriceRange: jest.fn().mockReturnValue(mockPriceRange),
      setPriceRange: jest.fn(),
      clearPriceRange: jest.fn(),
      isFilterActive: jest.fn().mockReturnValue(false),
      toggleFilter: jest.fn(),
    });

    render(<FilterSidebar filters={mockFilters} />);
    
    expect(screen.getByTestId('price-range-value')).toHaveTextContent(JSON.stringify(mockPriceRange));
  });

  it('calls setPriceRange when PriceRangeSlider onChange is called', () => {
    const mockSetPriceRange = jest.fn();
    mockUseFilterNuqs.mockReturnValue({
      getPriceRange: jest.fn().mockReturnValue({}),
      setPriceRange: mockSetPriceRange,
      clearPriceRange: jest.fn(),
      isFilterActive: jest.fn().mockReturnValue(false),
      toggleFilter: jest.fn(),
    });

    render(<FilterSidebar filters={mockFilters} />);
    
    fireEvent.click(screen.getByText('Set Range'));
    
    expect(mockSetPriceRange).toHaveBeenCalledWith({ min: 100, max: 500 });
  });

  it('calls clearPriceRange when PriceRangeSlider onClear is called', () => {
    const mockClearPriceRange = jest.fn();
    mockUseFilterNuqs.mockReturnValue({
      getPriceRange: jest.fn().mockReturnValue({}),
      setPriceRange: jest.fn(),
      clearPriceRange: mockClearPriceRange,
      isFilterActive: jest.fn().mockReturnValue(false),
      toggleFilter: jest.fn(),
    });

    render(<FilterSidebar filters={mockFilters} />);
    
    fireEvent.click(screen.getByText('Clear Range'));
    
    expect(mockClearPriceRange).toHaveBeenCalled();
  });

  it('renders other filter components alongside price range', () => {
    render(<FilterSidebar filters={mockFilters} />);
    
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Sony')).toBeInTheDocument();
    expect(screen.getByText('Bose')).toBeInTheDocument();
    expect(screen.getByText('Wireless')).toBeInTheDocument();
    expect(screen.getByText('Wired')).toBeInTheDocument();
  });

  it('maintains filter functionality with price range', () => {
    const mockToggleFilter = jest.fn();
    mockUseFilterNuqs.mockReturnValue({
      getPriceRange: jest.fn().mockReturnValue({}),
      setPriceRange: jest.fn(),
      clearPriceRange: jest.fn(),
      isFilterActive: jest.fn().mockReturnValue(false),
      toggleFilter: mockToggleFilter,
    });

    render(<FilterSidebar filters={mockFilters} />);
    
    // Find and click a checkbox (this would require the actual Checkbox component implementation)
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 0) {
      fireEvent.click(checkboxes[0]);
      expect(mockToggleFilter).toHaveBeenCalled();
    }
  });
});
