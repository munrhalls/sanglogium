import type { RawMap, SliceControls, SortLabels } from '@/features/product-filtering/core/types/optionMaps';
import { buildLabelsMap } from './buildLabelsMap';

/**
 * The list the Studio draws: one section per scope, in the order the raw map gives the scopes. A section holds that scope's controls,
 * in the order the raw map gives them, each with the options that scope holds (the raw map already sorts them) and the automatic
 * text of the control and of each option; and its sorts, apart from the controls: the scope's sort fields with their names, in the order given.
 * Curated rows are not applied here: the Studio shows them from the stored rows.
 */
export function listControlLabels(raw: RawMap, sortNames: SortLabels = {}): SliceControls[] {
  const automatic = buildLabelsMap(raw, []);
  return Object.entries(raw).map(([slice, controls]) => ({
    slice,
    controls: Object.entries(controls).map(([field, values]) => ({
      field,
      label: automatic[slice][field].label,
      options: values.map((v) => ({ value: String(v), text: automatic[slice][field].options[String(v)] })),
    })),
    sorts: Object.entries(sortNames[slice] ?? {}).map(([field, label]) => ({ field, label })),
  }));
}
