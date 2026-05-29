'use client';

import React from 'react';
import { SearchError } from '@/app/components/features/search/SearchError';

export default function SearchErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log to console for observability
    console.error('[SearchErrorBoundary] Caught error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-content px-4 md:px-8 pt-6 pb-12">
      <SearchError onRetry={reset} />
    </div>
  );
}
