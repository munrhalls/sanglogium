"use client";

import { useEffect } from 'react';
import { ErrorPanel } from '@/platform/design/ui/ErrorPanel';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CategoryError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Category page error:', error);
  }, [error]);

  return <ErrorPanel message="Failed to load category products" onRetry={reset} />;
}
