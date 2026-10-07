// Pure category constants and guard.

export const CATEGORIES = ['headphones', 'audio-electronics', 'accessories'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  headphones: 'Headphones',
  'audio-electronics': 'Audio Electronics',
  accessories: 'Accessories',
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
