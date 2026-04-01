"use client";

import React, { useCallback, useEffect } from 'react';
import { CounterClockwiseClock } from '@phosphor-icons/react';

interface StockMinimumSliderProps {
  maxStock: number;
  value: number;
  onChange: (value: number) => void;
  onClear: () => void;
}

export function StockMinimumSlider({ maxStock, value, onChange, onClear }: StockMinimumSliderProps) {
  // Detect and fix invalid state (negative values)
  useEffect(() => {
    if (value < 0) {
      onChange(0);
    }
  }, [value, onChange]);

  const isActive = value > 0;

  const handleSliderChange = useCallback((newValue: number) => {
    // If slider moved to 0, clear the filter instead of setting value
    if (newValue === 0) {
      onClear();
      return;
    }
    onChange(newValue);
  }, [onChange, onClear]);

  const handleClear = useCallback(() => {
    onClear();
  }, [onClear]);

  // Dynamic label based on value
  const getSliderLabel = () => {
    if (value === 0) return "Any";
    return `At least ${value} items`;
  };

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="type-overline text-accent-500 section-header-anchor">
          Availability
        </legend>
        {isActive && (
          <button
            type="button"
            onClick={handleClear}
            className={`p-1 rounded transition-colors ${
              isActive ? 'text-accent-500 hover:text-accent-400' : 'text-secondary-500 hover:text-secondary-400'
            }`}
            data-testid="clear-stock-minimum"
            title="Clear filter"
          >
            <CounterClockwiseClock size={16} weight="bold" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="type-caption text-secondary-500">Minimum Stock</label>
            <span className="type-caption text-secondary-500">{getSliderLabel()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxStock || 100}
            value={value}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-opacity ${
              isActive ? 'bg-accent-500 accent-accent-500' : 'opacity-60 bg-surface-tertiary accent-surface-tertiary'
            }`}
            data-testid="stock-minimum-slider"
            style={{
              WebkitAppearance: 'none',
              background: isActive
                ? `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(value / (maxStock || 100)) * 100}%, #2E2E2D ${(value / (maxStock || 100)) * 100}%, #2E2E2D 100%)`
                : `linear-gradient(to right, #6B7280 0%, #6B7280 ${(value / (maxStock || 100)) * 100}%, #374151 ${(value / (maxStock || 100)) * 100}%, #374151 100%)`
            }}
          />
        </div>
      </div>
    </fieldset>
  );
}
