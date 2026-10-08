import type { BasketProduct } from './types/basketTypes';

export type GetBasketProducts = (ids: string[]) => Promise<BasketProduct[]>;

export interface BasketProductsPort {
  getBasketProducts: GetBasketProducts;
}
