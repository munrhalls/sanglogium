export type Address = {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
};

/**
 * Convert checkout Address to order ShippingAddress
 */
export function toShippingAddress(
  address: Address,
  name: string,
  phone?: string
): {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
} {
  return {
    name,
    line1: `${address.street} ${address.streetNumber}`,
    city: address.city,
    state: "", // Not collected in checkout form currently
    postalCode: address.postalCode,
    country: address.regionCode,
    phone,
  };
}

/**
 * Convert order ShippingAddress to checkout Address
 */
export function fromShippingAddress(shipping: {
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}): Address | null {
  if (!shipping.line1) return null;

  const [street, ...streetNumberParts] = shipping.line1.split(" ");
  const streetNumber = streetNumberParts.join(" ");

  return {
    regionCode: shipping.country || "",
    postalCode: shipping.postalCode || "",
    street: street || "",
    streetNumber: streetNumber || "",
    city: shipping.city || "",
  };
}

export type Status = "EDITING" | "LOADING" | "FIX" | "CONFIRM" | "ACCEPT";

// TODO LATER - better naming
export type ServerResponse = {
  status: Status;
  address?: Address;
  geocode?: {
    latitude: number;
    longitude: number;
  };
  placeId?: string;
  errors?: Record<string, string>;
};

export type ServerProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  reservedStock?: number;
  stripePriceId: string;
  _rev: string;
};

export type BasketCheckoutItem = {
  _id: string;
  quantity: number;
};
