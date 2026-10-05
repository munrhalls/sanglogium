import type { BasketProduct } from './rules/basketTypes';

export type GetBasketProducts = (ids: string[]) => Promise<BasketProduct[]>;

export interface BasketProductsPort {
  getBasketProducts: GetBasketProducts;
}
