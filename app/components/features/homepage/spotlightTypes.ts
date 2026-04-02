export interface SpotlightProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
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
