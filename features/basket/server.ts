import 'server-only';

import { fetchBasketProducts } from './adapters/sanity/fetchBasketProducts';
import { getBasketProducts as getBasketProductsQuery } from './queries/getBasketProducts';
import type { BasketProductsPort } from './core/ports';
import type { BasketProduct } from './core/rules/basketTypes';

const basketProducts: BasketProductsPort = {
  getBasketProducts: fetchBasketProducts,
};

export function getBasketProducts(ids: string[]): Promise<BasketProduct[]> {
  return getBasketProductsQuery(basketProducts, ids);
}
export type { BasketProduct };
