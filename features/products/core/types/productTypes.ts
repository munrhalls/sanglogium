// Product type matching actual GROQ query result (brand is dereferenced with ->)
export type Product = {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  price_data: { currency: string; unit_amount: number };
  image: any;
  catalogueLocationKeys: string[];
  slug: { current: string };
  stock: number;
  reservedStock: number;
  availableStock: number;
};

export interface ProductDetailData {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  sku: string;
  image: any;
  gallery?: any[];
  slug: { current: string };
  description?: any;
  overviewFields?: { _key?: string; title: string; value: string; information?: string }[];
  specifications?: { title: string; value: string; information?: string }[];
  catalogueLocationKeys: string[];
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

export interface RelatedProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string } | null;
  price_data: { currency: string; unit_amount: number };
  image: any;
  slug: { current: string };
}
