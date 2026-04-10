export interface BasketItem {
  _id: string;
  name: string;
  displayPrice: number;
  stock: number;
  quantity: number;
  image: string;
  slug: string;
  stripePriceId?: string;
}
