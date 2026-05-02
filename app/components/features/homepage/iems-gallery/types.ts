export interface IemProduct {
  readonly _id: string;
  readonly brand: string;
  readonly name: string;
  readonly slug: string;
  readonly price_data: { currency: string; unit_amount: number };
  readonly imageUrl: string;
}
