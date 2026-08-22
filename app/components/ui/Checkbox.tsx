"use client";

import React from 'react';

interface CheckboxProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
  disabled?: boolean;
}

export function Checkbox({ name, value, checked, onChange, label, count, disabled }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange()}
          disabled={disabled}
          className="peer sr-only"
        />
        <div
          className={`
            w-4 h-4 border rounded-sm transition-all duration-150
            peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500
            ${checked
              ? 'bg-accent-500 border-accent-500'
              : 'border-border-primary bg-transparent group-hover:border-accent-500'
            }
          `}
        >
          {checked && (
            <svg
              className="w-4 h-4 text-brand-900"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8L6.5 11.5L13 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="type-body text-body group-hover:text-primary transition-colors">
        {label}
      </span>
      {count !== undefined && (
        <span className="ml-auto type-caption text-secondary-500" aria-label={`${count} ${count === 1 ? 'product' : 'products'}`}>
          {count}
        </span>
      )}
    </label>
  );
}
