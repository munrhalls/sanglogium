export interface SanityImage {
  readonly _type: 'image';
  readonly asset: {
    readonly _ref: string;
    readonly _type: 'reference';
  };
  readonly alt?: string;
  readonly hotspot?: {
    readonly x: number;
    readonly y: number;
    readonly height: number;
    readonly width: number;
  };
}

export interface HeroData {
  readonly headline: string;
  readonly subheadline: string;
  readonly backgroundImage: SanityImage;
  readonly mobileBackgroundImage?: SanityImage;
  readonly ctaText?: string;
}
