export interface SpotlightProduct {
  _id: string;
  name: string;
  brand: string;
  displayPrice: number;
  image: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  overviewFields?: Array<{
    title: string;
    value: string;
    information?: string;
  }>;
}
