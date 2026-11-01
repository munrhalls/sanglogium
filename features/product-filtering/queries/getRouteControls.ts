// Read use case: one scope's controls for one route — the raw map (per control, the sorted distinct values the route's
// products hold) and the labels map (each control's text and each option's text). Takes its port as the first parameter.
// A control no product on the route holds is dropped: a control with no value cannot be drawn, and the raw map keeps it
// as an empty list. The whole read-and-build is one try/catch because one request has one failure mode; on failure it
// logs once and returns the empty answer.

import { buildRawMap } from '@/features/product-filtering/core/rules/buildRawMap';
import { buildLabelsMap } from '@/features/product-filtering/core/rules/buildLabelsMap';
import type { RouteMapPorts } from '@/features/product-filtering/core/ports';
import type { PicklistScope } from '@/features/product-filtering/core/types/picklist';
import type { RouteControls } from '@/features/product-filtering/core/types/optionMaps';

const EMPTY: RouteControls = { raw: {}, labels: {} };

export async function getRouteControls(
  ports: RouteMapPorts,
  { keys, scope }: { keys: string[]; scope: PicklistScope },
): Promise<RouteControls> {
  try {
    const { alwaysOn, picks, products, rows } = await ports.fetchRouteMapData({ keys });
    const all = buildRawMap({ alwaysOn, picks: { [scope]: picks[scope] } }, { [scope]: products })[scope];
    const raw = Object.fromEntries(Object.entries(all).filter(([, values]) => values.length > 0));
    const labels = buildLabelsMap({ [scope]: raw }, rows)[scope];
    return { raw, labels };
  } catch (error) {
    console.error(`[getRouteControls] failed for ${keys.length} keys, scope "${scope}"`, error);
    return { raw: {}, labels: {} };
  }
}
