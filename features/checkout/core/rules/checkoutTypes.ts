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

export type Status = "LOADING" | "FIX" | "CONFIRM" | "ACCEPT";

export type ServerResponse = {
  status: Status;
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

export type ServerProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  _rev: string;
};

export type BasketCheckoutItem = {
  _id: string;
  quantity: number;
};

// Checkout-owned product shape (cycle guard): only the fields checkout reads.
export type CheckoutProduct = {
  _id: string;
  name?: string | null;
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
};

export interface AlleKurierService {
  Carrier: {
    code: string;
    name: string;
  };
  Service: {
    code: string;
    name: string;
  };
  Order: {
    net: number;
    gross: number;
  };
  Time: {
    days: string;
    description: string;
  };
}

export interface AlleKurierRatesInput {
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

export type AlleKurierShippingOption = {
  provider: string;
  servicelevel: { name: string };
  rateId: string;
  amount: number;
  currency: string;
  estimatedDays: number;
};

export interface TerytVerifyInput {
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
}

export interface TerytVerifyResult {
  valid: boolean;
  degraded: boolean;
  reason?: string;
  streetName?: string;
}

export interface CheckoutSession {
  basket: Array<{ productId: string; quantity: number }>;
  address?: {
    firstName: string;
    lastName: string;
    phone: string;
    regionCode: string;
    postalCode: string;
    street: string;
    streetNumber: string;
    city: string;
    geocode?: {
      location: {
        latitude: number;
        longitude: number;
      };
    };
    placeId?: string;
  };
  email?: string;
  shippingCode?: string;
  shippingCost?: number;
  shippingMethodName?: string;
  shippingCarrier?: string;
  shippingEstimatedDays?: number;
  paymentIntentId?: string;
  completedPaymentIntentId?: string;
  lastPaymentIntentId?: string; // Set for any PI processed by return handler (not just succeeded)
  checkoutSessionId?: string; // Unified Trace ID for checkout flow logging
}

export interface OrderForSuccessPage {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  isGuest: boolean;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod?: {
    name: string;
    carrier: string;
    price: number;
    estimatedDays?: number;
  };
  status: string;
  dates: {
    orderedAt: string;
  };
}

export type OrderBasketItem = {
  productId: string;
  quantity: number;
};

export type OrderAddress = {
  firstName?: string;
  lastName?: string;
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
};

export interface OrderSessionData {
  basket: OrderBasketItem[];
  address?: OrderAddress;
  shippingCode?: string;
  shippingCost?: number;
  shippingMethodName?: string;
  shippingCarrier?: string;
  shippingEstimatedDays?: number;
  email?: string;
  checkoutSessionId?: string;
  userId?: string;
}

export interface PaymentProduct {
  _id: string;
  name: string | null;
  price_data: { unit_amount: number } | null;
  stock: number | null;
  imageUrl: string | null;
}

export interface AutocompleteResult {
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  regionCode: string;
}

export type OrderConfirmationEmailData = {
  to: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; subtotal: number }>;
  total: number;
  shippingAddress: { name: string; line1: string; city: string; postalCode: string };
};

export type CreateOrderResult = {
  created: boolean;
  email?: OrderConfirmationEmailData;
};
