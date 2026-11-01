// Read use case: everything a listing route needs from the filter feature, from one read of the route's controls and one decoded URL state. Takes its ports as the first parameter.
// Order: the route answer (controls, labels, sorts and the route's products), the control model, the state decoded from the address, the sections, the counts of the snapshot,
// the panel, the chips, the current sort and the narrowing. Nothing here is a rule; each step is a rule or a use case proven on its own. A failed read of the controls or of the
// sections degrades to a smaller panel (no controls, or no headings), never to an error: the products request still works from the narrowing.

import { getRouteControls } from '@/features/product-filtering/queries/getRouteControls';
import { getRouteSections } from '@/features/product-filtering/queries/getRouteSections';
import { buildChips } from '@/features/product-filtering/core/rules/buildChips';
import { buildControlModel } from '@/features/product-filtering/core/rules/buildControlModel';
import { buildCounts } from '@/features/product-filtering/core/rules/buildCounts';
import { buildPanel } from '@/features/product-filtering/core/rules/buildPanel';
import type { RouteMapPorts, SectionPorts } from '@/features/product-filtering/core/ports';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { FilterPanelResult } from '@/features/product-filtering/core/types/filterPanel';
import type { Narrowing } from '@/features/product-filtering/core/types/narrowing';
import type { PicklistScope } from '@/features/product-filtering/core/types/picklist';
import type { SortSelection, UrlInput, UrlState } from '@/features/product-filtering/core/types/urlState';

export interface FilterPanelPorts extends RouteMapPorts, SectionPorts {
  /** The URL state of an address under the control model's contract. */
  decode: (model: ControlModel, query: UrlInput) => UrlState;
  /** The narrowing the host's products request embeds (`where`, `order`, `params`). */
  narrow: (model: ControlModel, state: UrlState, onProduct: string[]) => Narrowing;
}

export async function getFilterPanel(
  ports: FilterPanelPorts,
  { keys, scope, query }: { keys: string[]; scope: PicklistScope; query: UrlInput },
): Promise<FilterPanelResult> {
  const answer = await getRouteControls(ports, { keys, scope });
  const model = buildControlModel(answer);
  const state = ports.decode(model, query);
  const sections = await getRouteSections(ports, { scope, controlPaths: model.controls.map((control) => control.path) });
  const counts = buildCounts(model, state, answer.products, answer.onProduct);
  const sort = state.sort;
  const selection: SortSelection | null =
    sort !== null && typeof sort === 'object' && !Array.isArray(sort) && 'field' in sort && 'direction' in sort ? { field: sort.field, direction: sort.direction } : null;
  return {
    scope,
    model,
    panel: buildPanel(model, sections, counts, state),
    chips: buildChips(model, state),
    sort: selection,
    narrowing: ports.narrow(model, state, answer.onProduct),
  };
}
