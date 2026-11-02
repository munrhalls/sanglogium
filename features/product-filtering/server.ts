import "server-only";

// Server door: wires the Sanity adapters into the ports and exports the bound
// reads under today's names and signatures. Outside code imports these from
// '@/features/product-filtering/server' — never from adapters/ directly.

import { fetchOptionMapData } from './adapters/sanity/fetchOptionMapData';
import { fetchRouteMapData } from './adapters/sanity/fetchRouteMapData';
import { fetchSections } from './adapters/sanity/fetchSections';
import { buildNarrowing } from './adapters/sanity/buildNarrowing';
import { buildUrlContract } from './url/controlUrl';
import { getFilterPanel as getFilterPanelQuery, type FilterPanelPorts } from './queries/getFilterPanel';
import { getControlLabels as getControlLabelsQuery } from './queries/getControlLabels';
import type { SliceControls } from './core/types/optionMaps';

/** The list the Studio's Filter labels draws: one section per slice, each with its controls, their options and the automatic texts. Read through the shop's own cache. */
export const getControlLabels = (): Promise<SliceControls[]> => getControlLabelsQuery({ fetchOptionMapData });

const filterPanelPorts: FilterPanelPorts = {
  fetchRouteMapData,
  fetchSections,
  decode: (model, query) => buildUrlContract(model).decode(query),
  narrow: buildNarrowing,
};

/** Everything a listing route needs from the filter feature for one address: the panel, chips and sort the views draw, and the narrowing the products request embeds. */
export const getFilterPanel = (options: Parameters<typeof getFilterPanelQuery>[1]) => getFilterPanelQuery(filterPanelPorts, options);

export { CATALOGUE_FETCH_CACHE } from './adapters/sanity/catalogueCache';
