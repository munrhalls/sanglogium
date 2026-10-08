import type { ShippingOption, ShippingRatesInput } from "./types/shippingTypes";

export type ShippingRates = {
  fetchShippingOptions: (input: ShippingRatesInput, traceId?: string) => Promise<ShippingOption[]>;
};
