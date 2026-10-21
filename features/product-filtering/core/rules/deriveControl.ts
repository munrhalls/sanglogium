import type { FacetControl, FieldStat } from '@/features/product-filtering/core/types/facetProjection';

/** The control a field is shown with, from the kinds of value its products carry; null when it cannot be a filter control. */
export function deriveControl(stat: FieldStat): FacetControl | null {
  const { kinds } = stat;
  if (kinds.length === 0) return null;
  if (kinds.every((kind) => kind === 'boolean')) return 'boolean';
  if (kinds.every((kind) => kind === 'number')) return 'range';
  if (kinds.every((kind) => kind === 'string' || kind === 'array')) return 'checkbox';
  return null;
}
