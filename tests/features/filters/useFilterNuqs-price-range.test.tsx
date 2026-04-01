import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useFilterNuqs } from '../../app/components/features/filters/useFilterNuqs';

// Mock nuqs
vi.mock('nuqs', () => ({
  useQueryState: vi.fn(),
}));

const mockUseQueryState = vi.hoisted(() => vi.fn());

describe('useFilterNuqs - Price Range', () => {
  const mockSetFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQueryState.mockReturnValue([[], mockSetFilters]);
  });

  it('returns empty price range when no price filters exist', () => {
    mockUseQueryState.mockReturnValue([['brand:sony', 'type:wireless'], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    expect(result.current.getPriceRange()).toEqual({ min: undefined, max: undefined });
    expect(result.current.isPriceRangeActive()).toBe(false);
  });

  it('returns price range when price filters exist', () => {
    mockUseQueryState.mockReturnValue([['priceRange:min:100', 'priceRange:max:500'], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    expect(result.current.getPriceRange()).toEqual({ min: 100, max: 500 });
    expect(result.current.isPriceRangeActive()).toBe(true);
  });

  it('handles min-only price range', () => {
    mockUseQueryState.mockReturnValue([['priceRange:min:200'], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    expect(result.current.getPriceRange()).toEqual({ min: 200, max: undefined });
    expect(result.current.isPriceRangeActive()).toBe(true);
  });

  it('handles max-only price range', () => {
    mockUseQueryState.mockReturnValue([['priceRange:max:800'], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    expect(result.current.getPriceRange()).toEqual({ min: undefined, max: 800 });
    expect(result.current.isPriceRangeActive()).toBe(true);
  });

  it('sets price range with both min and max', () => {
    mockUseQueryState.mockReturnValue([['brand:sony'], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    act(() => {
      result.current.setPriceRange({ min: 300, max: 700 });
    });

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.any(Function)
    );

    const updateFn = mockSetFilters.mock.calls[0][0];
    const resultFilters = updateFn(['brand:sony']);

    expect(resultFilters).toEqual([
      'brand:sony',
      'priceRange:min:300',
      'priceRange:max:700'
    ]);
  });

  it('sets price range with min only', () => {
    mockUseQueryState.mockReturnValue([[], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    act(() => {
      result.current.setPriceRange({ min: 250 });
    });

    const updateFn = mockSetFilters.mock.calls[0][0];
    const resultFilters = updateFn([]);

    expect(resultFilters).toEqual(['priceRange:min:250']);
  });

  it('sets price range with max only', () => {
    mockUseQueryState.mockReturnValue([[], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    act(() => {
      result.current.setPriceRange({ max: 900 });
    });

    const updateFn = mockSetFilters.mock.calls[0][0];
    const resultFilters = updateFn([]);

    expect(resultFilters).toEqual(['priceRange:max:900']);
  });

  it('clears price range while preserving other filters', () => {
    mockUseQueryState.mockReturnValue([
      ['brand:sony', 'priceRange:min:100', 'priceRange:max:500', 'type:wireless'],
      mockSetFilters
    ]);

    const { result } = renderHook(() => useFilterNuqs());

    act(() => {
      result.current.clearPriceRange();
    });

    const updateFn = mockSetFilters.mock.calls[0][0];
    const resultFilters = updateFn(['brand:sony', 'priceRange:min:100', 'priceRange:max:500', 'type:wireless']);

    expect(resultFilters).toEqual(['brand:sony', 'type:wireless']);
  });

  it('replaces existing price range when setting new range', () => {
    mockUseQueryState.mockReturnValue([
      ['priceRange:min:100', 'priceRange:max:500'],
      mockSetFilters
    ]);

    const { result } = renderHook(() => useFilterNuqs());

    act(() => {
      result.current.setPriceRange({ min: 200, max: 800 });
    });

    const updateFn = mockSetFilters.mock.calls[0][0];
    const resultFilters = updateFn(['priceRange:min:100', 'priceRange:max:500']);

    expect(resultFilters).toEqual(['priceRange:min:200', 'priceRange:max:800']);
  });

  it('handles invalid price filter values gracefully', () => {
    mockUseQueryState.mockReturnValue([
      ['priceRange:min:invalid', 'priceRange:max:notanumber'],
      mockSetFilters
    ]);

    const { result } = renderHook(() => useFilterNuqs());

    expect(result.current.getPriceRange()).toEqual({ min: undefined, max: undefined });
    expect(result.current.isPriceRangeActive()).toBe(false);
  });

  it('handles partial invalid price filter values', () => {
    mockUseQueryState.mockReturnValue([
      ['priceRange:min:300', 'priceRange:max:invalid'],
      mockSetFilters
    ]);

    const { result } = renderHook(() => useFilterNuqs());

    expect(result.current.getPriceRange()).toEqual({ min: 300, max: undefined });
    expect(result.current.isPriceRangeActive()).toBe(true);
  });

  it('prevents setting invalid range where min >= max', () => {
    mockUseQueryState.mockReturnValue([[], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    act(() => {
      result.current.setPriceRange({ min: 500, max: 400 });
    });

    expect(mockSetFilters).not.toHaveBeenCalled();
  });

  it('prevents setting range where min == max', () => {
    mockUseQueryState.mockReturnValue([[], mockSetFilters]);

    const { result } = renderHook(() => useFilterNuqs());

    act(() => {
      result.current.setPriceRange({ min: 300, max: 300 });
    });

    expect(mockSetFilters).not.toHaveBeenCalled();
  });
});
