"use client";

import { useEffect } from "react";

/**
 * Temporarily suppresses Next.js Image fill warnings in development
 * These warnings are noisy and don't affect functionality
 */
export default function SuppressImageWarnings() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const originalWarn = console.warn;
    
    console.warn = (...args) => {
      const message = args[0];
      
      // Suppress Next.js Image fill warnings
      if (
        typeof message === 'string' &&
        message.includes('has "fill" and a height value of 0')
      ) {
        return;
      }
      
      // Call original warn for other messages
      originalWarn.apply(console, args);
    };

    // Restore original warn on cleanup
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  // This component renders nothing
  return null;
}
