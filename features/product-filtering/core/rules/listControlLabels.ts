import type { RawMap, SliceControls } from '@/features/product-filtering/core/types/optionMaps';
import { buildLabelsMap } from './buildLabelsMap';

/**
 * The list the Studio draws: one section per slice, in the order the raw map gives the slices. A section holds that slice's controls,
 * in the order the raw map gives them, each with the options that slice holds (the raw map already sorts them) and the automatic
 * text of the control and of each option. Curated rows are not applied here: the Studio shows them from the stored rows.
 */
export function listControlLabels(raw: RawMap): SliceControls[] {
  const automatic = buildLabelsMap(raw, []);
  return Object.entries(raw).map(([slice, controls]) => ({
    slice,
    controls: Object.entries(controls).map(([field, values]) => ({
      field,
      label: automatic[slice][field].label,
      options: values.map((v) => ({ value: String(v), text: automatic[slice][field].options[String(v)] })),
    })),
  }));
}
