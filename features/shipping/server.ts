import 'server-only';
// Server door: courier rates for checkout and the basket estimate.

import { fetchShippingOptions } from './adapters/allekurier/rates';
import { getCheapestShippingRate as getCheapestShippingRateQuery } from './queries/getCheapestShippingRate';
import type { ShippingRates } from './core/ports';

const shipping: ShippingRates = { fetchShippingOptions };

export const getCheapestShippingRate = (input: Parameters<typeof getCheapestShippingRateQuery>[1]) => getCheapestShippingRateQuery({ shipping }, input);

export { fetchShippingOptions };
export type { ShippingOption, ShippingRatesInput } from './core/rules/shippingTypes';
