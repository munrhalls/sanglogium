import type { DerivedOption } from '@/features/product-filtering/core/types/facetProjection';
import { OPTION_LABEL_OVERRIDES } from '@/features/product-filtering/core/definitions/optionLabelOverrides';

/** The option-label adapter: curated override when one exists for this
 *  attribute's value, else the humanize-derived label. Renames labels only —
 *  it never adds, removes or reorders an option. */
export function applyOptionLabels(attribute: string, options: DerivedOption[]): DerivedOption[] {
  const overrides = OPTION_LABEL_OVERRIDES[attribute];
  if (!overrides) return options;
  return options.map((o) => (overrides[o.value] === undefined ? o : { ...o, label: overrides[o.value] }));
}
