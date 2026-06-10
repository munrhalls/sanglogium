"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: { min?: number; max?: number };
  onChange: (range: { min?: number; max?: number }) => void;
  onClear: () => void;
}

const DEBOUNCE_MS = 300;

export function PriceRangeSlider({ min, max, value, onChange, onClear }: PriceRangeSliderProps) {
  // Local state for immediate visual feedback during drag
  const [localValue, setLocalValue] = React.useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when prop changes (e.g., from URL or parent)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Cancel pending debounce on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Detect and fix invalid URL-injected state (min > max)
  useEffect(() => {
    if (value.min !== undefined && value.max !== undefined && value.min > value.max) {
      onChange({ min: value.max - 1, max: value.max });
    }
  }, [value.min, value.max, onChange]);

  // Clamp values to ensure min <= max
  const clampedValue = React.useMemo(() => {
    if (localValue.min !== undefined && localValue.max !== undefined && localValue.min > localValue.max) {
      return { ...localValue, min: localValue.max - 1 };
    }
    return localValue;
  }, [localValue]);

  const isActive = (clampedValue.min !== undefined && clampedValue.min !== min) || (clampedValue.max !== undefined && clampedValue.max !== max);

  const scheduleCommit = useCallback((range: { min?: number; max?: number }) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onChange(range);
    }, DEBOUNCE_MS);
  }, [onChange]);

  const handleMinSliderChange = useCallback((newMin: number) => {
    const currentMax = clampedValue.max ?? max;
    // If both values are at defaults, clear the filter instead of setting values
    if (newMin === min && currentMax === max) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setLocalValue({});
      onClear();
      return;
    }
    const validMin = Math.min(newMin, currentMax - 1);
    const next = { min: validMin, max: clampedValue.max };
    setLocalValue(next);
    scheduleCommit(next);
  }, [clampedValue.max, min, max, scheduleCommit, onClear]);

  const handleMaxSliderChange = useCallback((newMax: number) => {
    const currentMin = clampedValue.min ?? min;
    // If both values are at defaults, clear the filter instead of setting values
    if (newMax === max && currentMin === min) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setLocalValue({});
      onClear();
      return;
    }
    const validMax = Math.max(newMax, currentMin + 1);
    const next = { min: clampedValue.min, max: validMax };
    setLocalValue(next);
    scheduleCommit(next);
  }, [clampedValue.min, min, max, scheduleCommit, onClear]);

  const handleClear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLocalValue({});
    onClear();
  }, [onClear]);

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="type-overline text-accent-500 section-header-anchor">
          Price Range
        </legend>
        <button
            type="button"
            onClick={handleClear}
            className={`p-1 rounded transition-colors ${
              isActive ? 'text-brand-400 hover:text-brand-300' : 'text-secondary-600 opacity-50 cursor-not-allowed'
            }`}
            data-testid="clear-price-range"
            title={isActive ? "Clear filter" : "Filter not active"}
            disabled={!isActive}
          >
            <ClockCounterClockwise size={16} weight="bold" />
          </button>
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
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-opacity ${
                isActive ? 'bg-accent-500 accent-accent-500' : 'opacity-60 bg-surface-tertiary accent-surface-tertiary'
              }`}
              data-testid="price-min-slider"
              style={{
                WebkitAppearance: 'none',
                background: isActive
                  ? `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${((clampedValue.min ?? min) / max) * 100}%, #2E2E2D ${((clampedValue.min ?? min) / max) * 100}%, #2E2E2D 100%)`
                  : `linear-gradient(to right, #6B7280 0%, #6B7280 ${((clampedValue.min ?? min) / max) * 100}%, #374151 ${((clampedValue.min ?? min) / max) * 100}%, #374151 100%)`
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
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-opacity ${
                isActive ? 'bg-accent-500 accent-accent-500' : 'opacity-60 bg-surface-tertiary accent-surface-tertiary'
              }`}
              data-testid="price-max-slider"
              style={{
                WebkitAppearance: 'none',
                background: isActive
                  ? `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${((clampedValue.max ?? max) / max) * 100}%, #2E2E2D ${((clampedValue.max ?? max) / max) * 100}%, #2E2E2D 100%)`
                  : `linear-gradient(to right, #6B7280 0%, #6B7280 ${((clampedValue.max ?? max) / max) * 100}%, #374151 ${((clampedValue.max ?? max) / max) * 100}%, #374151 100%)`
              }}
            />
          </div>
        </div>

      </fieldset>
  );
}
