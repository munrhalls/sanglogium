import type {
  Address,
  AddressCheckResult,
  RegistryCheckInput,
  RegistryCheckResult,
} from "./types/addressTypes";

export type AddressRegistry = {
  verifyAddress: (input: RegistryCheckInput) => Promise<RegistryCheckResult>;
};

export type AddressValidator = {
  validateAddress: (
    input: Address,
    normalizedRegion: string,
    acceptAsEntered: () => AddressCheckResult,
  ) => Promise<AddressCheckResult>;
};
