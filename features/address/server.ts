import 'server-only';
// Server door: address checks (TERYT registry; the frozen Google path) and address suggestions.

import { verifyPolishAddress } from './adapters/teryt/validator';
import { validateWithGoogle } from './adapters/google/addressValidator';
import { placesAutocomplete } from './adapters/photon/placesAutocomplete';
import { checkAddress as checkAddressQuery } from './queries/checkAddress';
import type { Address, AddressCheckResult } from './core/types/addressTypes';
import type { AddressRegistry, AddressValidator } from './core/ports';

const registry: AddressRegistry = { verifyAddress: verifyPolishAddress };
const validator: AddressValidator = { validateAddress: validateWithGoogle };

export const checkAddress = (
  input: Address,
  opts?: { skipValidation?: boolean },
): Promise<AddressCheckResult> =>
  checkAddressQuery({ registry, validator }, input, opts);

export const suggestAddresses = placesAutocomplete;
