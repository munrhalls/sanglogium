'use client';

import React from 'react';
import { Warning } from '@phosphor-icons/react';

interface SearchErrorProps {
  onRetry?: () => void;
}

export function SearchError({ onRetry }: SearchErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Warning size={48} className="text-accent-500 mb-4" aria-hidden="true" />
      <h2 className="type-h5 text-primary mb-2">Search temporarily unavailable</h2>
      <p className="type-body text-secondary max-w-md mb-6">
        We&apos;re having trouble loading search results. This is usually a temporary issue.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-2.5 bg-brand-400 text-brand-900 rounded-md type-button hover:bg-brand-300 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
