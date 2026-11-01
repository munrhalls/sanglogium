// Read use case: the control list the Studio's Filter labels draws, one section per scope. Takes its port as the first parameter. A scope is a slice
// (the products at its catalogue root or below) or all products (the /products page: the products of the three slices together, with the picks the owner
// chose for it); the raw map lists what each scope holds; the list keeps the scopes apart (a label key has no scope).

import { CATEGORIES } from '@/features/product-filtering/core/definitions/category';
import { ALL_PRODUCTS } from '@/features/product-filtering/core/definitions/picklist';
import { buildRawMap } from '@/features/product-filtering/core/rules/buildRawMap';
import { listControlLabels } from '@/features/product-filtering/core/rules/listControlLabels';
import { sliceByCatalogue } from '@/features/product-filtering/core/rules/sliceByCatalogue';
import type { OptionMapPorts } from '@/features/product-filtering/core/ports';
import type { SliceControls } from '@/features/product-filtering/core/types/optionMaps';

export async function getControlLabels(ports: OptionMapPorts): Promise<SliceControls[]> {
  const { alwaysOn, picks, items, products } = await ports.fetchOptionMapData();
  const slices = Object.fromEntries(CATEGORIES.map((category) => [category, sliceByCatalogue(items, products, category)]));
  // All products is the products of the three slices together: a product in no slice is not in the catalogue.
  const inCatalogue = new Set(Object.values(slices).flat().map((p) => p._id));
  slices[ALL_PRODUCTS] = products.filter((p) => inCatalogue.has(p._id));
  return listControlLabels(buildRawMap({ alwaysOn, picks }, slices));
}
