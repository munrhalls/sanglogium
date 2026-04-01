"use client";

import React, { useCallback } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: { min?: number; max?: number };
  onChange: (range: { min?: number; max?: number }) => void;
  onClear: () => void;
}

export function PriceRangeSlider({ min, max, value, onChange, onClear }: PriceRangeSliderProps) {
  const isActive = (value.min !== undefined) || (value.max !== undefined);

  const handleMinSliderChange = useCallback((newMin: number) => {
    const currentMax = value.max ?? max;
    const validMin = Math.min(newMin, currentMax - 1);
    onChange({ min: validMin, max: value.max });
  }, [value.max, max, onChange]);

  const handleMaxSliderChange = useCallback((newMax: number) => {
    const currentMin = value.min ?? min;
    const validMax = Math.max(newMax, currentMin + 1);
    onChange({ min: value.min, max: validMax });
  }, [value.min, min, onChange]);

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
              <span className="type-caption text-secondary-500">${value.min ?? min}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={value.min ?? min}
              onChange={(e) => handleMinSliderChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-accent-500 rounded-lg appearance-none cursor-pointer accent-accent-500"
              data-testid="price-min-slider"
              style={{
                WebkitAppearance: 'none',
                background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${((value.min ?? min) / max) * 100}%, #2E2E2D ${((value.min ?? min) / max) * 100}%, #2E2E2D 100%)`
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="type-caption text-secondary-500">Max</label>
              <span className="type-caption text-secondary-500">${value.max ?? max}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={value.max ?? max}
              onChange={(e) => handleMaxSliderChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-accent-500 rounded-lg appearance-none cursor-pointer accent-accent-500"
              data-testid="price-max-slider"
              style={{
                WebkitAppearance: 'none',
                background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${((value.max ?? max) / max) * 100}%, #2E2E2D ${((value.max ?? max) / max) * 100}%, #2E2E2D 100%)`
              }}
            />
          </div>
        </div>

      </fieldset>
  );
}
