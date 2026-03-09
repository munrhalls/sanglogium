export interface FeaturedProduct {
  readonly _id: string;
  readonly brand: string;
  readonly name: string;
  readonly slug: string;
  readonly displayPrice: number;
  readonly imageUrl: string;
  readonly tag: (string | string[])[];
}

export interface FeaturedCapacity {
  readonly mobilePortrait: number;
  readonly mobileLandscape: number;
  readonly smPortrait: number;
  readonly smLandscape: number;
  readonly mdPortrait: number;
  readonly mdLandscape: number;
  readonly lgTouch: number;
  readonly lgDesktop: number;
  readonly xl: number;
}
