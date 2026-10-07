import type Stripe from "stripe";
import type { ShippingOption, ShippingRatesInput } from "@/features/shipping";
import type {
  CheckoutSession,
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

export type ShippingRates = { fetchShippingOptions: (input: ShippingRatesInput, traceId?: string) => Promise<ShippingOption[]> };


export type CheckoutSessionHandle = CheckoutSession & {
  save: () => Promise<void>;
  destroy: () => void;
};

export type CheckoutSessions = {
  getCheckoutSession: () => Promise<CheckoutSessionHandle>;
};

export type Payments = {
  stripe: Stripe;
  retrievePaymentIntent: (paymentIntentId: string) => Promise<Stripe.PaymentIntent>;
  constructWebhookEvent: (
    rawBody: string,
    signature: string,
    secret: string
  ) => Stripe.Event;
  updatePaymentIntentAmount: (
    paymentIntentId: string,
    amount: number,
    metadata: Record<string, string>,
    idempotencyKey: string
  ) => Promise<Stripe.PaymentIntent>;
  createPaymentIntentForAmount: (
    amount: number,
    metadata: Record<string, string>,
    idempotencyKey: string
  ) => Promise<Stripe.PaymentIntent>;
};

export type OrderEmails = {
  sendOrderConfirmationEmail: (data: OrderConfirmationEmailData) => Promise<void>;
};
