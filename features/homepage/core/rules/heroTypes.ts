export interface SanityImage {
  readonly _type?: 'image';
  readonly asset: {
    readonly _id: string;
    readonly url: string;
    readonly metadata?: {
      readonly dimensions: {
        readonly width: number;
        readonly height: number;
        readonly aspectRatio: number;
      };
      readonly lqip: string;
    };
  };
  readonly alt?: string;
  readonly hotspot?: {
    readonly x: number;
    readonly y: number;
  };
}

export interface HeroData {
  readonly headline: string;
  readonly subheadline: string;
  readonly backgroundImage: SanityImage;
  readonly mobileBackgroundImage?: SanityImage;
  readonly ctaText?: string;
  readonly ctaLink?: string;
}
