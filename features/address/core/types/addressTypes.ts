export type Address = {
  firstName: string;
  lastName: string;
  phone: string;
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
};

export type AddressCheckStatus = "LOADING" | "FIX" | "CONFIRM" | "ACCEPT";

export type AddressCheckResult = {
  status: AddressCheckStatus;
  address?: Address;
  geocode?: {
    location: {
      latitude: number;
      longitude: number;
    };
  };
  placeId?: string;
  errors?: Record<string, string>;
};

export type AddressSuggestion = {
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  regionCode: string;
};

export type RegistryCheckInput = {
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
};

export type RegistryCheckResult = {
  valid: boolean;
  degraded: boolean;
  reason?: string;
  streetName?: string;
};
