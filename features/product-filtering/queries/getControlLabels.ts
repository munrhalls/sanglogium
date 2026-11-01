// Read use case: the control list the Studio's Filter labels draws, one section per scope. Takes its port as the first parameter. A scope is a slice
// (the products at its catalogue root or below) or all products (the /products page: the products of the three slices together, with the picks the owner
// chose for it); the raw map lists what each scope holds; the list keeps the scopes apart (a label key has no scope). Each section also carries the scope's
// sorts (the always-on sorts, then the owner's sort picks) with their automatic names, apart from the controls.

import { CATEGORIES } from '@/features/product-filtering/core/definitions/category';
import { ALL_PRODUCTS } from '@/features/product-filtering/core/definitions/picklist';
import { buildRawMap } from '@/features/product-filtering/core/rules/buildRawMap';
import { buildSortLabels } from '@/features/product-filtering/core/rules/buildSortLabels';
import { listControlLabels } from '@/features/product-filtering/core/rules/listControlLabels';
import { sliceByCatalogue } from '@/features/product-filtering/core/rules/sliceByCatalogue';
import { sortFieldsOf } from '@/features/product-filtering/core/rules/sortFields';
import type { OptionMapPorts } from '@/features/product-filtering/core/ports';
import type { SliceControls } from '@/features/product-filtering/core/types/optionMaps';

export async function getControlLabels(ports: OptionMapPorts): Promise<SliceControls[]> {
  const { alwaysOn, picks, sortAlwaysOn, sortPicks, items, products } = await ports.fetchOptionMapData();
  const slices = Object.fromEntries(CATEGORIES.map((category) => [category, sliceByCatalogue(items, products, category)]));
  // All products is the products of the three slices together: a product in no slice is not in the catalogue.
  const inCatalogue = new Set(Object.values(slices).flat().map((p) => p._id));
  slices[ALL_PRODUCTS] = products.filter((p) => inCatalogue.has(p._id));
  const sortNames = buildSortLabels(sortFieldsOf(sortAlwaysOn, sortPicks), []);
  return listControlLabels(buildRawMap({ alwaysOn, picks }, slices), sortNames);
}
