"use client";

import { useEffect } from 'react';
import { ErrorPanel } from '@/platform/design/ui/ErrorPanel';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return <ErrorPanel message="Failed to load product details" onRetry={reset} />;
}
