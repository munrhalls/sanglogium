export interface BasketProduct {
  _id: string;
  name: string;
  price_data: {
    currency: string;
    unit_amount: number;
  };
  stock: number;
  reservedStock: number;
  image: any;
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
    distance_unit: string;
    mass_unit: string;
  };
}
