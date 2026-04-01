import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFilterNuqs } from '../../../app/components/features/filters/useFilterNuqs';

// Mock nuqs with proper structure
const mockUseQueryState = vi.fn();
vi.mock('nuqs', () => ({
  useQueryState: mockUseQueryState,
  parseAsArrayOf: {
    withOptions: vi.fn(() => ({
      withDefault: vi.fn(() => [])
    }))
  },
  parseAsString: vi.fn()
}));

describe('useFilterNuqs - Stock Minimum State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 0 as default stock minimum', () => {
    mockUseQueryState.mockReturnValue([[], vi.fn()]);

    const { result } = renderHook(() => useFilterNuqs());

    expect(result.current.getStockMinimum()).toBe(0);
  });

  it('parses stock minimum from URL filters', () => {
    mockUseQueryState.mockReturnValue([['stockMin:5'], vi.fn()]);

    const { result } = renderHook(() => useFilterNuqs());

    expect(result.current.getStockMinimum()).toBe(5);
  });

  it('handles invalid stock filter gracefully', () => {
    mockUseQueryState.mockReturnValue([['stockMin:invalid'], vi.fn()]);

    const { result } = renderHook(() => useFilterNuqs());

    expect(result.current.getStockMinimum()).toBe(0); // Should fallback to 0
  });

  it('sets stock minimum and updates URL', () => {
    const mockSetFilters = vi.fn();
    mockUseQueryState.mockReturnValue([[], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    result.current.setStockMinimum(10);

    expect(mockSetFilters).toHaveBeenCalledWith(expect.any(Function));
    const updateFn = mockSetFilters.mock.calls[0][0];
    const resultFilters = updateFn([]);
    expect(resultFilters).toContain('stockMin:10');
  });

  it('clears stock minimum when value is 0 or negative', () => {
    const mockSetFilters = vi.fn();
    mockUseQueryState.mockReturnValue([['stockMin:5', 'brand:test'], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    result.current.setStockMinimum(0);

    expect(mockSetFilters).toHaveBeenCalledWith(expect.any(Function));
    const updateFn = mockSetFilters.mock.calls[0][0];
    const resultFilters = updateFn(['stockMin:5', 'brand:test']);
    expect(resultFilters).not.toContain('stockMin:0');
    expect(resultFilters).toContain('brand:test');
  });

  it('clears stock minimum filter', () => {
    const mockSetFilters = vi.fn();
    mockUseQueryState.mockReturnValue([['stockMin:5', 'brand:test'], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    result.current.clearStockMinimum();

    expect(mockSetFilters).toHaveBeenCalledWith(expect.any(Function));
    const updateFn = mockSetFilters.mock.calls[0][0];
    const resultFilters = updateFn(['stockMin:5', 'brand:test']);
    expect(resultFilters).not.toContain('stockMin:5');
    expect(resultFilters).toContain('brand:test');
  });

  it('detects when stock minimum is active', () => {
    // Test inactive
    mockUseQueryState.mockReturnValue([[], vi.fn()]);
    const { result: resultInactive } = renderHook(() => useFilterNuqs());
    expect(resultInactive.current.isStockMinimumActive()).toBe(false);

    // Test active
    mockUseQueryState.mockReturnValue([['stockMin:5'], vi.fn()]);
    const { result: resultActive } = renderHook(() => useFilterNuqs());
    expect(resultActive.current.isStockMinimumActive()).toBe(true);
  });
});
