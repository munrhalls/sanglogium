import type { FacetControl, FieldStat } from '@/features/product-filtering/core/types/facetProjection';

/** The control a field is shown with, from the kinds of value its products carry; null when it cannot be a filter control. */
export function deriveControl(stat: FieldStat): FacetControl | null {
  const { kinds, values, min } = stat;
  if (kinds.length === 0) return null;
  if (kinds.every((kind) => kind === 'boolean')) return 'boolean';
  // Numbers stored plainly or inside an array: `values` holds only strings and booleans, so none plus a numeric span means every value is a number.
  if (kinds.every((kind) => kind === 'number' || kind === 'array') && values.length === 0 && min !== null) return 'range';
  if (kinds.every((kind) => kind === 'string' || kind === 'array')) return 'checkbox';
  return null;
}
