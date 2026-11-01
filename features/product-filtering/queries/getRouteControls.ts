// Read use case: one scope's controls and sorts for one route, and the products they were computed from. The controls are the raw map (per control,
// the sorted distinct values the route's products hold) and the labels map (each control's text and each option's text). The sorts are the fields the
// shopper can sort by on this route, each with its name: the scope's sort fields are the always-on sorts first, then the scope's sort picks, each once,
// and a field no route product holds is dropped, as a control with no value is. A sort is named like the filter control of the same field.
// Takes its port as the first parameter. A control no product on the route holds is dropped: a control with no value cannot be drawn, and the raw map
// keeps it as an empty list. The whole read-and-build is one try/catch because one request has one failure mode; on failure it logs once and returns
// the empty answer.

import { buildRawMap } from '@/features/product-filtering/core/rules/buildRawMap';
import { buildLabelsMap } from '@/features/product-filtering/core/rules/buildLabelsMap';
import { buildSortLabels } from '@/features/product-filtering/core/rules/buildSortLabels';
import { sortFieldsOf } from '@/features/product-filtering/core/rules/sortFields';
import type { RouteMapPorts } from '@/features/product-filtering/core/ports';
import type { PicklistScope } from '@/features/product-filtering/core/types/picklist';
import type { RouteControls } from '@/features/product-filtering/core/types/optionMaps';

export async function getRouteControls(
  ports: RouteMapPorts,
  { keys, scope }: { keys: string[]; scope: PicklistScope },
): Promise<RouteControls> {
  try {
    const { alwaysOn, picks, sortAlwaysOn, sortPicks, products, rows } = await ports.fetchRouteMapData({ keys });
    const all = buildRawMap({ alwaysOn, picks: { [scope]: picks[scope] } }, { [scope]: products })[scope];
    const raw = Object.fromEntries(Object.entries(all).filter(([, values]) => values.length > 0));
    const labels = buildLabelsMap({ [scope]: raw }, rows)[scope];

    // The always-on sorts are read from the product, the picks from its filterAttributes, as the raw map reads its controls; a pick that is also an always-on sort is read once, from the product.
    const sortFields = sortFieldsOf(sortAlwaysOn, sortPicks)[scope];
    const held = buildRawMap(
      { alwaysOn: sortAlwaysOn, picks: { [scope]: sortFields.filter((field) => !sortAlwaysOn.includes(field)) } },
      { [scope]: products },
    )[scope];
    const sorts = buildSortLabels({ [scope]: sortFields.filter((field) => held[field].length > 0) }, rows)[scope];

    return { raw, labels, sorts, products };
  } catch (error) {
    console.error(`[getRouteControls] failed for ${keys.length} keys, scope "${scope}"`, error);
    return { raw: {}, labels: {}, sorts: {}, products: [] };
  }
}
