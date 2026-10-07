import 'server-only';
// Server-only entry: checkout session, payments, order placement and the step pages' data. Never import from client components or Node .mjs scripts.
import { getCheckoutSession } from './adapters/iron-session/checkoutSession';
import { fetchShippingOptions } from '@/features/shipping/server';
import { fetchOrderByPaymentIntentId } from './adapters/sanity/getOrderByPaymentIntentId';
import { createOrderFromPayment } from '@/features/order/server';
import { getPaymentProducts } from './adapters/sanity/getPaymentProducts';
import { getProductsByIds } from './adapters/sanity/getProductsByIds';
import { getProductUnitAmountsByIds } from './adapters/sanity/getProductUnitAmountsByIds';
import { sendOrderConfirmationEmail } from './adapters/resend/orderConfirmationEmail';
import { retrievePayment, updatePaymentAmount, createPayment } from './adapters/stripe/client';
import { parseWebhookEvent } from './adapters/stripe/webhooks';
import { getAddressPageData as getAddressPageDataQuery } from './queries/getAddressPageData';
import { getShippingPageData as getShippingPageDataQuery } from './queries/getShippingPageData';
import { getPaymentPageData as getPaymentPageDataQuery } from './queries/getPaymentPageData';
import { getSuccessPageResult as getSuccessPageResultQuery } from './queries/getSuccessPageResult';
import { createPaymentIntent as createPaymentIntentCmd } from './commands/createPaymentIntent';
import { handlePaymentReturn as handlePaymentReturnCmd } from './commands/handlePaymentReturn';
import { handlePaymentWebhook as handlePaymentWebhookCmd } from './commands/handlePaymentWebhook';
import type {
  Orders,
  CheckoutCatalog,
  ShippingRates,
  CheckoutSessions,
  Payments,
  OrderEmails,
} from './core/ports';

const orders: Orders = {
  createOrderFromPayment,
  getOrderByPaymentIntentId: fetchOrderByPaymentIntentId,
};

const catalogue: CheckoutCatalog = {
  getPaymentProducts,
  getProductsByIds,
  getProductUnitAmountsByIds,
};

const shipping: ShippingRates = { fetchShippingOptions };


const sessions: CheckoutSessions = { getCheckoutSession };

const payments: Payments = { retrievePayment, parseWebhookEvent, updatePaymentAmount, createPayment };

const emails: OrderEmails = { sendOrderConfirmationEmail };


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
export const handlePaymentWebhook = (
  input: Parameters<typeof handlePaymentWebhookCmd>[1]
) => handlePaymentWebhookCmd({ orders, payments, emails }, input);

export { getCheckoutSession };
export { fetchOrderByPaymentIntentId as getOrderByPaymentIntentId };
export { default as PaymentConfirmedView } from './view/PaymentConfirmedView';
export { recordCheckoutTrace } from './commands/recordCheckoutTrace';
