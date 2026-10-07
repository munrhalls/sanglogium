import 'server-only';
// Server-only entry: checkout session, payments, order placement and the step pages' data. Never import from client components or Node .mjs scripts.
import type Stripe from 'stripe';
import { getCheckoutSession } from './adapters/iron-session/checkoutSession';
import { fetchShippingOptions } from '@/features/shipping/server';
import { verifyPolishAddress } from './adapters/teryt/validator';
import { validateWithGoogle } from './adapters/google/addressValidator';
import { placesAutocomplete } from './adapters/google/placesAutocomplete';
import { fetchOrderByPaymentIntentId } from './adapters/sanity/getOrderByPaymentIntentId';
import { createOrderFromPaymentIntent } from './adapters/sanity/createOrderFromPaymentIntent';
import { getPaymentProducts } from './adapters/sanity/getPaymentProducts';
import { getProductsByIds } from './adapters/sanity/getProductsByIds';
import { getProductUnitAmountsByIds } from './adapters/sanity/getProductUnitAmountsByIds';
import { sendOrderConfirmationEmail } from './adapters/resend/orderConfirmationEmail';
import { stripe, retrievePaymentIntent, updatePaymentIntentAmount, createPaymentIntentForAmount } from './adapters/stripe/client';
import { constructWebhookEvent } from './adapters/stripe/webhooks';
import { getAddressPageData as getAddressPageDataQuery } from './queries/getAddressPageData';
import { getShippingPageData as getShippingPageDataQuery } from './queries/getShippingPageData';
import { getPaymentPageData as getPaymentPageDataQuery } from './queries/getPaymentPageData';
import { getSuccessPageResult as getSuccessPageResultQuery } from './queries/getSuccessPageResult';
import { createPaymentIntent as createPaymentIntentCmd } from './commands/createPaymentIntent';
import { handlePaymentReturn as handlePaymentReturnCmd } from './commands/handlePaymentReturn';
import { handleStripeWebhook as handleStripeWebhookCmd } from './commands/handleStripeWebhook';
import { placeOrderFromPaymentIntent as placeOrderFromPaymentIntentUseCase } from './commands/placeOrderFromPaymentIntent';
import type {
  Orders,
  CheckoutCatalog,
  ShippingRates,
  AddressValidation,
  CheckoutSessions,
  Payments,
  OrderEmails,
} from './core/ports';
import type { OrderSessionData } from './core/rules/checkoutTypes';

const orders: Orders = {
  createOrderFromPaymentIntent,
  getOrderByPaymentIntentId: fetchOrderByPaymentIntentId,
};

const catalogue: CheckoutCatalog = {
  getPaymentProducts,
  getProductsByIds,
  getProductUnitAmountsByIds,
};

const shipping: ShippingRates = { fetchShippingOptions };

const addressValidation: AddressValidation = {
  verifyPolishAddress,
  validateWithGoogle,
  placesAutocomplete,
};

const sessions: CheckoutSessions = { getCheckoutSession };

const payments: Payments = { stripe, retrievePaymentIntent, constructWebhookEvent, updatePaymentIntentAmount, createPaymentIntentForAmount };

const emails: OrderEmails = { sendOrderConfirmationEmail };

export const placeOrderFromPaymentIntent = (
  pi: Stripe.PaymentIntent,
  sessionData?: OrderSessionData
) => placeOrderFromPaymentIntentUseCase({ orders, emails }, { pi, sessionData });

export const getAddressPageData = () => getAddressPageDataQuery({ sessions });
export const getShippingPageData = () => getShippingPageDataQuery({ sessions, catalogue, shipping });
export const getPaymentPageData = () => getPaymentPageDataQuery({ sessions, catalogue });
export const getSuccessPageResult = (
  input: Parameters<typeof getSuccessPageResultQuery>[1]
) => getSuccessPageResultQuery({ sessions, orders, payments }, input);
export const createPaymentIntent = (
  input: Parameters<typeof createPaymentIntentCmd>[1]
) => createPaymentIntentCmd({ sessions, catalogue, payments }, input);
export const handlePaymentReturn = (
  input: Parameters<typeof handlePaymentReturnCmd>[1]
) => handlePaymentReturnCmd({ sessions, orders, payments, emails }, input);
export const handleStripeWebhook = (
  input: Parameters<typeof handleStripeWebhookCmd>[1]
) => handleStripeWebhookCmd({ orders, payments, emails }, input);

export { getCheckoutSession };
export { verifyPolishAddress, validateWithGoogle, placesAutocomplete };
export { fetchOrderByPaymentIntentId as getOrderByPaymentIntentId };
export { createOrderFromPaymentIntent };
export { getPaymentProducts, getProductsByIds, getProductUnitAmountsByIds };
export { stripe, retrievePaymentIntent };
export type { CheckoutSession, OrderSessionData, OrderForSuccessPage, AutocompleteResult } from './core/rules/checkoutTypes';
export type { PaymentProduct } from './core/rules/checkoutTypes';
export { default as OrderDetails } from './view/OrderDetails';
export { default as PaymentConfirmed } from './view/PaymentConfirmed';
