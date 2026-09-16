// Pure category constants/guard, deliberately split out of facetRegistry.ts
// (which is 'use client') so Server Components can import them directly --
// a function from a 'use client' module can only be rendered as a Component
// or passed as a prop, never called from server code.

export const CATEGORIES = ['headphones', 'audio-electronics', 'accessories'] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
