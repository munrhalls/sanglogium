export interface AccessoryItem {
  readonly _id: string;
  readonly brand: string;
  readonly name: string;
  readonly slug: string;
  readonly displayPrice: number;
  readonly imageUrl: string;
  readonly category?: string;
}

export interface AccessoryCategory {
  readonly name: string;
  readonly filter: string;
}
