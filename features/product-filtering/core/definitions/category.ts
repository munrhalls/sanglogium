// Pure category constants and guard.

export const CATEGORIES = ['headphones', 'audio-electronics', 'accessories'] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
