"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';

interface StockMinimumSliderProps {
  maxStock: number;
  value: number;
  onChange: (value: number) => void;
  onClear: () => void;
}

export function StockMinimumSlider({ maxStock, value, onChange, onClear }: StockMinimumSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const isDragging = useRef(false);

  const isActive = value > 0;
  const max = maxStock || 100;

  useEffect(() => {
    if (!isDragging.current) {
      setLocalValue(value);
    }
  }, [value]);

  const commitValue = useCallback((nextValue: number) => {
    if (nextValue === 0) {
      onClear();
      return;
    }
    onChange(nextValue);
  }, [onChange, onClear]);

  const handleChange = useCallback((newValue: number) => {
    setLocalValue(newValue);
    if (!isDragging.current) {
      commitValue(newValue);
    }
  }, [commitValue]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) {
      return;
    }
    isDragging.current = false;
    commitValue(localValue);
  }, [commitValue, localValue]);

  useEffect(() => {
    const handleWindowPointerUp = () => {
      if (isDragging.current) {
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleWindowPointerUp);
    window.addEventListener('touchend', handleWindowPointerUp);

    return () => {
      window.removeEventListener('mouseup', handleWindowPointerUp);
      window.removeEventListener('touchend', handleWindowPointerUp);
    };
  }, [handleDragEnd]);

  const handleClear = useCallback(() => {
    isDragging.current = false;
    setLocalValue(0);
    onClear();
  }, [onClear]);

  const getSliderLabel = () => {
    if (localValue === 0) return "Any";
    return `At least ${localValue} items`;
  };

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="type-overline text-accent-500 section-header-anchor">
          Availability
        </legend>
        <button
            type="button"
            onClick={handleClear}
            className={`p-1 rounded transition-colors ${
              isActive ? 'text-brand-400 hover:text-brand-300' : 'text-secondary-600 opacity-50 cursor-not-allowed'
            }`}
            data-testid="clear-stock-minimum"
            title={isActive ? "Clear filter" : "Filter not active"}
            disabled={!isActive}
          >
            <ClockCounterClockwise size={16} weight="bold" />
          </button>
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
            max={max}
            value={localValue}
            onChange={(e) => handleChange(parseInt(e.target.value, 10))}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-opacity ${
              isActive ? 'bg-accent-500 accent-accent-500' : 'opacity-60 bg-surface-tertiary accent-surface-tertiary'
            }`}
            data-testid="stock-minimum-slider"
            style={{
              WebkitAppearance: 'none',
              background: isActive
                ? `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(localValue / max) * 100}%, #2E2E2D ${(localValue / max) * 100}%, #2E2E2D 100%)`
                : `linear-gradient(to right, #6B7280 0%, #6B7280 ${(localValue / max) * 100}%, #374151 ${(localValue / max) * 100}%, #374151 100%)`
            }}
          />
        </div>
      </div>
    </fieldset>
  );
}
