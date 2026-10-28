import type { FacetControl, FieldStat } from '@/features/product-filtering/core/types/facetProjection';

/** The control a field is shown with, from the kinds of value its products carry; null when it has no value to select. */
export function deriveControl(stat: FieldStat): FacetControl | null {
  const { kinds, values, min } = stat;
  if (kinds.length === 0) return null;
  if (kinds.every((kind) => kind === 'boolean')) return 'boolean';
  if (kinds.every((kind) => kind === 'number') && min !== null) return 'range';
  // A list of objects records no value, so `values` is empty and it gets no control.
  if (kinds.every((kind) => kind === 'string' || kind === 'array') && values.length > 0) return 'checkbox';
  return null;
}
