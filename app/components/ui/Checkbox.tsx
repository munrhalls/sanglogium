"use client";

import React from 'react';

interface CheckboxProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function Checkbox({ name, value, checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <div
          className={`
            w-4 h-4 border rounded-sm transition-all duration-150
            ${checked
              ? 'bg-brand-400 border-brand-400'
              : 'border-border-primary bg-transparent group-hover:border-brand-400'
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
    </label>
  );
}
