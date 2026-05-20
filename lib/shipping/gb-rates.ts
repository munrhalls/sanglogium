import { fetchPacklinkRates, PacklinkRatesInput } from './packlink-rates';

export interface GBRatesInput {
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
}

export async function fetchGBRates(input: GBRatesInput) {
  const packlinkInput: PacklinkRatesInput = {
    fromCountry: input.fromCountry,
    fromZip: input.fromZip,
    toCountry: input.toCountry,
    toZip: input.toZip,
    packages: input.packages,
  };

  return fetchPacklinkRates(packlinkInput);
}
