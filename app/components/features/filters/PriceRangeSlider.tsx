"use client";

import React, { useCallback, useEffect } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: { min?: number; max?: number };
  onChange: (range: { min?: number; max?: number }) => void;
  onClear: () => void;
}

export function PriceRangeSlider({ min, max, value, onChange, onClear }: PriceRangeSliderProps) {
  // Detect and fix invalid URL-injected state (min > max)
  useEffect(() => {
    if (value.min !== undefined && value.max !== undefined && value.min > value.max) {
      // Fix invalid state by clamping min to max-1
      onChange({ min: value.max - 1, max: value.max });
    }
  }, [value.min, value.max, onChange]);

  // Clamp initial values to ensure min <= max
  const clampedValue = React.useMemo(() => {
    if (value.min !== undefined && value.max !== undefined && value.min > value.max) {
      // If min > max, clamp min to max-1
      return { ...value, min: value.max - 1 };
    }
    return value;
  }, [value]);

  const isActive = (clampedValue.min !== undefined && clampedValue.min !== min) || (clampedValue.max !== undefined && clampedValue.max !== max);

  const handleMinSliderChange = useCallback((newMin: number) => {
    const currentMax = clampedValue.max ?? max;
    // If both values are at defaults, clear the filter instead of setting values
    if (newMin === min && currentMax === max) {
      onClear();
      return;
    }
    const validMin = Math.min(newMin, currentMax - 1);
    onChange({ min: validMin, max: clampedValue.max });
  }, [clampedValue.max, min, max, onChange, onClear]);

  const handleMaxSliderChange = useCallback((newMax: number) => {
    const currentMin = clampedValue.min ?? min;
    // If both values are at defaults, clear the filter instead of setting values
    if (newMax === max && currentMin === min) {
      onClear();
      return;
    }
    const validMax = Math.max(newMax, currentMin + 1);
    onChange({ min: clampedValue.min, max: validMax });
  }, [clampedValue.min, min, max, onChange, onClear]);

  const handleClear = useCallback(() => {
    onClear();
  }, [onClear]);

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="type-overline text-accent-500 section-header-anchor">
          Price Range
        </legend>
        {isActive && (
          <button
            type="button"
            onClick={handleClear}
            className="type-caption text-secondary-500 hover:text-accent-500 transition-colors"
            data-testid="clear-price-range"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="type-caption text-secondary-500">Min</label>
              <span className="type-caption text-secondary-500">${clampedValue.min ?? min}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={clampedValue.min ?? min}
              onChange={(e) => handleMinSliderChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-accent-500 rounded-lg appearance-none cursor-pointer accent-accent-500"
              data-testid="price-min-slider"
              style={{
                WebkitAppearance: 'none',
                background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${((clampedValue.min ?? min) / max) * 100}%, #2E2E2D ${((clampedValue.min ?? min) / max) * 100}%, #2E2E2D 100%)`
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="type-caption text-secondary-500">Max</label>
              <span className="type-caption text-secondary-500">${clampedValue.max ?? max}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={clampedValue.max ?? max}
              onChange={(e) => handleMaxSliderChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-accent-500 rounded-lg appearance-none cursor-pointer accent-accent-500"
              data-testid="price-max-slider"
              style={{
                WebkitAppearance: 'none',
                background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${((clampedValue.max ?? max) / max) * 100}%, #2E2E2D ${((clampedValue.max ?? max) / max) * 100}%, #2E2E2D 100%)`
              }}
            />
          </div>
        </div>

      </fieldset>
  );
}
