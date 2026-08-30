export interface ChunkProduct {
  _id: string;
  name: string;
  slug: { current: string } | null;
  price_data: { unit_amount: number } | null;
  image: {
    asset: {
      _id: string;
      metadata: { lqip: string | null; isOpaque: boolean | null } | null;
    } | null;
  } | null;
}
