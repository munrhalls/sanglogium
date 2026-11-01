// Read use case: the control list the Studio's Filter labels draws. Takes its port as the first parameter. Each slice is the
// products at its catalogue root or below; the raw map lists what each slice holds; the list merges the slices (a label key has no slice).

import { CATEGORIES } from '@/features/product-filtering/core/definitions/category';
import { buildRawMap } from '@/features/product-filtering/core/rules/buildRawMap';
import { listControlLabels } from '@/features/product-filtering/core/rules/listControlLabels';
import { sliceByCatalogue } from '@/features/product-filtering/core/rules/sliceByCatalogue';
import type { OptionMapPorts } from '@/features/product-filtering/core/ports';
import type { ControlLabels } from '@/features/product-filtering/core/types/optionMaps';

export async function getControlLabels(ports: OptionMapPorts): Promise<ControlLabels[]> {
  const { alwaysOn, picks, items, products } = await ports.fetchOptionMapData();
  const slices = Object.fromEntries(CATEGORIES.map((category) => [category, sliceByCatalogue(items, products, category)]));
  return listControlLabels(buildRawMap({ alwaysOn, picks }, slices));
}
