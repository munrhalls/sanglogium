export interface SpotlightRelease {
  readonly _id: string;
  readonly tag: string;
  readonly name: string;
  readonly brand: string;
  readonly displayPrice: number;
  readonly description: string;
  readonly imageUrl: string;
  readonly images: readonly string[];
  readonly slug?: string;
}
