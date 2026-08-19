"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: { min?: number; max?: number };
  onChange: (range: { min?: number; max?: number }) => void;
  onClear: () => void;
}
export function PriceRangeSlider({ min, max, value, onChange, onClear }: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(value.min ?? min);
  const [localMax, setLocalMax] = useState(value.max ?? max);
  const isDragging = useRef(false);
  const isKeyboardRef = useRef(false);
  // Unique ids (the slider renders in both the sidebar and the mobile drawer,
  // so static ids would collide); used to bind each label to its input (G9).
  const minInputId = useId();
  const maxInputId = useId();

  const isActive = (value.min !== undefined && value.min !== min) || (value.max !== undefined && value.max !== max);

  useEffect(() => {
    if (!isDragging.current) {
      setLocalMin(value.min ?? min);
      setLocalMax(value.max ?? max);
    }
  }, [value.min, value.max, min, max]);

  const commitRange = useCallback((nextMin: number, nextMax: number) => {
    const shouldClear = nextMin === min && nextMax === max;

    if (shouldClear) {
      onClear();
      return;
    }

    const nextRange: { min?: number; max?: number } = {};

    if (nextMin !== min) {
      nextRange.min = nextMin;
    }

    if (nextMax !== max) {
      nextRange.max = nextMax;
    }

    onChange(nextRange);
  }, [min, max, onChange, onClear]);

  const handleMinChange = useCallback((newMin: number) => {
    const validMin = Math.min(newMin, localMax - 1);
    setLocalMin(validMin);

    if (!isDragging.current && !isKeyboardRef.current) {
      commitRange(validMin, localMax);
    }
  }, [localMax, commitRange]);

  const handleMaxChange = useCallback((newMax: number) => {
    const validMax = Math.max(newMax, localMin + 1);
    setLocalMax(validMax);

    if (!isDragging.current && !isKeyboardRef.current) {
      commitRange(localMin, validMax);
    }
  }, [localMin, commitRange]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) {
      return;
    }

    isDragging.current = false;
    commitRange(localMin, localMax);
  }, [commitRange, localMin, localMax]);

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
    setLocalMin(min);
    setLocalMax(max);
    onClear();
  }, [min, max, onClear]);

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
            <label htmlFor={minInputId} className="type-caption text-secondary-500">Min</label>
            <span className="type-caption text-secondary-500">${localMin}</span>
          </div>
          <input
            id={minInputId}
            type="range"
            min={min}
            max={max}
            value={localMin}
            onChange={(e) => handleMinChange(parseInt(e.target.value, 10))}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
                isKeyboardRef.current = true;
              }
            }}
            onKeyUp={() => {
              if (isKeyboardRef.current) {
                isKeyboardRef.current = false;
                commitRange(localMin, localMax);
              }
            }}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-opacity ${
              isActive ? 'bg-accent-500 accent-accent-500' : 'opacity-60 bg-surface-tertiary accent-surface-tertiary'
            }`}
            data-testid="price-min-slider"
            style={{
              WebkitAppearance: 'none',
              background: isActive
                ? `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(localMin / max) * 100}%, #2E2E2D ${(localMin / max) * 100}%, #2E2E2D 100%)`
                : `linear-gradient(to right, #6B7280 0%, #6B7280 ${(localMin / max) * 100}%, #374151 ${(localMin / max) * 100}%, #374151 100%)`
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor={maxInputId} className="type-caption text-secondary-500">Max</label>
            <span className="type-caption text-secondary-500">${localMax}</span>
          </div>
          <input
            id={maxInputId}
            type="range"
            min={min}
            max={max}
            value={localMax}
            onChange={(e) => handleMaxChange(parseInt(e.target.value, 10))}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
                isKeyboardRef.current = true;
              }
            }}
            onKeyUp={() => {
              if (isKeyboardRef.current) {
                isKeyboardRef.current = false;
                commitRange(localMin, localMax);
              }
            }}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-opacity ${
              isActive ? 'bg-accent-500 accent-accent-500' : 'opacity-60 bg-surface-tertiary accent-surface-tertiary'
            }`}
            data-testid="price-max-slider"
            style={{
              WebkitAppearance: 'none',
              background: isActive
                ? `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(localMax / max) * 100}%, #2E2E2D ${(localMax / max) * 100}%, #2E2E2D 100%)`
                : `linear-gradient(to right, #6B7280 0%, #6B7280 ${(localMax / max) * 100}%, #374151 ${(localMax / max) * 100}%, #374151 100%)`
            }}
          />
        </div>
      </div>
    </fieldset>
  );
}
