import React from 'react';
import { cn } from '@/lib/utils/tailwind';
import { splitHighlight } from './highlight';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

/** Renders `text` with the parts matching `query` emphasised (weight + colour, no extra semantics). */
export function HighlightedText({ text, query, className }: HighlightedTextProps) {
  return (
    <>
      {splitHighlight(text, query).map((part, index) =>
        part.match ? (
          <span key={index} className={cn('font-semibold text-brand-400', className)}>
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
}
