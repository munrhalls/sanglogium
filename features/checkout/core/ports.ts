import type { ShippingOption, ShippingRatesInput } from "@/features/shipping";
import type {
  CheckoutSession,
  OrderForSuccessPage,
  OrderSessionData,
  PaymentProduct,
  CheckoutProduct,
  OrderConfirmationEmailData,
  CreateOrderResult,
  PaymentSnapshot,
  PaymentHandle,
  PaymentEvent,
} from "./rules/checkoutTypes";

export type Orders = {
  createOrderFromPaymentIntent: (
    payment: PaymentSnapshot,
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

export type ShippingRates = { fetchShippingOptions: (input: ShippingRatesInput, traceId?: string) => Promise<ShippingOption[]> };


export type CheckoutSessionHandle = CheckoutSession & {
  save: () => Promise<void>;
  destroy: () => void;
};

export type CheckoutSessions = {
  getCheckoutSession: () => Promise<CheckoutSessionHandle>;
};

export type Payments = {
  retrievePayment: (paymentId: string) => Promise<PaymentSnapshot>;
  parseWebhookEvent: (
    rawBody: string,
    signature: string,
    secret: string
  ) => PaymentEvent;
  updatePaymentAmount: (
    paymentId: string,
    amount: number,
    metadata: Record<string, string>,
    idempotencyKey: string
  ) => Promise<PaymentHandle>;
  createPayment: (
    amount: number,
    metadata: Record<string, string>,
    idempotencyKey: string
  ) => Promise<PaymentHandle>;
};

export type OrderEmails = {
  sendOrderConfirmationEmail: (data: OrderConfirmationEmailData) => Promise<void>;
};
