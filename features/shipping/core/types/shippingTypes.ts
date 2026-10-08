export type ShippingRatesInput = {
  fromCountry: string;
  fromZip: string;
  toCountry: string;
  toZip: string;
  packages: Array<{
    width: number;
    height: number;
    length: number;
    weight: number;
  }>;
};

export type ShippingOption = {
  provider: string;
  servicelevel: { name: string };
  rateId: string;
  amount: number;
  currency: string;
  estimatedDays: number;
};
