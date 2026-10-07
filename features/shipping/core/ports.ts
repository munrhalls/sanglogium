import type { ShippingOption, ShippingRatesInput } from "./rules/shippingTypes";

export type ShippingRates = {
  fetchShippingOptions: (input: ShippingRatesInput, traceId?: string) => Promise<ShippingOption[]>;
};
