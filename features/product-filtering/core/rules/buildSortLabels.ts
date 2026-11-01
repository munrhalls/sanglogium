import type { CuratedLabel, RawMap, SortLabels, SortMap } from '@/features/product-filtering/core/types/optionMaps';
import { buildLabelsMap } from './buildLabelsMap';

/**
 * One name for every sort field of every scope. A sort is named by its field's control name, the same row the filter control of that field uses,
 * so the name is one fact: the owner's curated text when a non-empty row names the field, else the automatic one. This runs the labels map's
 * own rule on fields that have no options (a sort has none of its own: its directions are fixed phrases).
 */
export function buildSortLabels(sorts: SortMap, curated: CuratedLabel[]): SortLabels {
  const fields: RawMap = Object.fromEntries(Object.entries(sorts).map(([scope, list]) => [scope, Object.fromEntries(list.map((field) => [field, []]))]));
  return Object.fromEntries(
    Object.entries(buildLabelsMap(fields, curated)).map(([scope, controls]) => [scope, Object.fromEntries(Object.entries(controls).map(([field, c]) => [field, c.label]))]),
  );
}
