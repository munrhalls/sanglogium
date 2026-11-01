import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { SortOption } from '@/features/product-filtering/core/types/sortMenu';

// The entries of the sort menu: first the route's own order (what the URL means when it carries no sort), then each of the model's sorts in the model's order, ascending before descending.
// A model with no sort has no menu. The words for a direction depend on the field's kind, which the model does not carry: only the field `name` is text, every other sort field holds plain numbers.
// DEFAULT_SORT_LABEL names the order the narrowing uses when the URL has no sort (newest first, `DEFAULT_ORDER` in adapters/sanity/buildNarrowing.ts); the two are kept in step by hand.

export const DEFAULT_SORT_LABEL = 'Recently added';
const TEXT_SORT = 'name';

export function buildSortOptions(model: ControlModel): SortOption[] {
  if (model.sorts.length === 0) return [];
  const options: SortOption[] = [{ id: '', label: DEFAULT_SORT_LABEL, selection: null }];
  for (const sort of model.sorts) {
    const [up, down] = sort.value === TEXT_SORT ? ['A to Z', 'Z to A'] : ['low to high', 'high to low'];
    options.push({ id: JSON.stringify([sort.value, 'asc']), label: `${sort.text}: ${up}`, selection: { field: sort.value, direction: 'asc' } });
    options.push({ id: JSON.stringify([sort.value, 'desc']), label: `${sort.text}: ${down}`, selection: { field: sort.value, direction: 'desc' } });
  }
  return options;
}
