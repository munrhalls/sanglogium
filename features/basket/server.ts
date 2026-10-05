import 'server-only';

import { getBasketProducts as getBasketProductsAdapter } from './adapters/sanity/getBasketProducts';
import { getBasketProducts as getBasketProductsQuery } from './queries/getBasketProducts';
import type { BasketProductsPort } from './core/ports';
import type { BasketProduct } from './core/rules/basketTypes';

const basketProducts: BasketProductsPort = {
  getBasketProducts: getBasketProductsAdapter,
};

export function getBasketProducts(ids: string[]): Promise<BasketProduct[]> {
  return getBasketProductsQuery(basketProducts, ids);
}
export type { BasketProduct };
