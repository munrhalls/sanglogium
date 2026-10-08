import type { BasketProduct } from './types/basketTypes';

type GetBasketProducts = (ids: string[]) => Promise<BasketProduct[]>;

export interface BasketProductsPort {
  getBasketProducts: GetBasketProducts;
}
