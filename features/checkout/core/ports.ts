import type Stripe from "stripe";
import type {
  Address,
  ServerResponse,
  CheckoutSession,
  AlleKurierService,
  AlleKurierRatesInput,
  AlleKurierShippingOption,
  TerytVerifyInput,
  TerytVerifyResult,
  AutocompleteResult,
  OrderForSuccessPage,
  OrderSessionData,
  PaymentProduct,
  CheckoutProduct,
  OrderConfirmationEmailData,
  CreateOrderResult,
} from "./rules/checkoutTypes";

export type Orders = {
  createOrderFromPaymentIntent: (
    pi: Stripe.PaymentIntent,
    sessionData?: OrderSessionData
  ) => Promise<CreateOrderResult>;
  getOrderByPaymentIntentId: (
    paymentIntentId: string
  ) => Promise<OrderForSuccessPage | null>;
};

export type CheckoutCatalog = {
  getPaymentProducts: (ids: string[]) => Promise<PaymentProduct[]>;
  getProductsByIds: (ids: string[]) => Promise<CheckoutProduct[]>;
  getProductUnitAmountsByIds: (
    ids: string[]
  ) => Promise<{ _id: string; price_data: { unit_amount: number } | null }[]>;
};

export type ShippingRates = {
  fetchAlleKurierRates: (
    input: AlleKurierRatesInput,
    traceId?: string
  ) => Promise<AlleKurierService[]>;
  transformAlleKurierToShippingOption: (
    service: AlleKurierService
  ) => AlleKurierShippingOption;
};

export type AddressValidation = {
  verifyPolishAddress: (input: TerytVerifyInput) => Promise<TerytVerifyResult>;
  validateWithGoogle: (
    input: Address,
    normalizedInput: string,
    acceptAsEntered: () => ServerResponse
  ) => Promise<ServerResponse>;
  placesAutocomplete: (q: string) => Promise<AutocompleteResult[]>;
};

export type CheckoutSessions = {
  getCheckoutSession: () => Promise<CheckoutSession>;
};

export type Payments = {
  stripe: Stripe;
  retrievePaymentIntent: (paymentIntentId: string) => Promise<Stripe.PaymentIntent>;
};

export type OrderEmails = {
  sendOrderConfirmationEmail: (data: OrderConfirmationEmailData) => Promise<void>;
};
