import type { DerivedOption, FieldStat } from '@/features/product-filtering/core/types/facetProjection';
import { humanizeFacetValue } from './humanizeFacetValue';

/** Checkbox options of one field: its distinct values from the data, labelled by the humanize rule. */
export function deriveOptions(stat: FieldStat): DerivedOption[] {
  return stat.values.map((value) => ({ value, label: humanizeFacetValue(value) }));
}
