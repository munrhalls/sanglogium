export interface PortableTextBlock {
  readonly _key: string;
  readonly _type: string;
  readonly style: string;
  readonly children: Array<{
    readonly _key: string;
    readonly _type: string;
    readonly text: string;
  }>;
}

export interface SpotlightProduct {
  readonly id: string;
  readonly brand: string;
  readonly name: string;
  readonly slug: string;
  readonly displayPrice: number;
  readonly mainImage: string;
  readonly headline: string;
  readonly subheadline: string;
  readonly description: PortableTextBlock[];
  readonly gallery: readonly string[];
  readonly specs: readonly any[];
  readonly isGold: boolean;
}
