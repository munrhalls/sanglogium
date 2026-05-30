export interface AccessoryItem {
  readonly _id: string;
  readonly brand: {
    _id: string;
    name: string;
    slug: string;
  };
  readonly name: string;
  readonly slug: string;
  readonly price_data: { currency: string; unit_amount: number };
  readonly imageUrl: string;
  readonly image: { asset: { _id: string; url: string }; alt?: string };
  readonly category?: string;
}

export interface AccessoryCategory {
  readonly name: string;
  readonly filter: string;
}
