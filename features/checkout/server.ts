import 'server-only';
// Server-only entry: checkout session and courier rates. Never import from client components or Node .mjs scripts.
import type Stripe from 'stripe';
import { getCheckoutSession } from './adapters/iron-session/checkoutSession';
import { fetchAlleKurierRates, transformAlleKurierToShippingOption } from './adapters/allekurier/rates';
import { verifyPolishAddress } from './adapters/teryt/validator';
import { validateWithGoogle } from './adapters/google/addressValidator';
import { placesAutocomplete } from './adapters/google/placesAutocomplete';
import { fetchOrderByPaymentIntentId } from './adapters/sanity/getOrderByPaymentIntentId';
import { createOrderFromPaymentIntent } from './adapters/sanity/createOrderFromPaymentIntent';
import { getPaymentProducts } from './adapters/sanity/getPaymentProducts';
import { getProductsByIds } from './adapters/sanity/getProductsByIds';
import { getProductUnitAmountsByIds } from './adapters/sanity/getProductUnitAmountsByIds';
import { sendOrderConfirmationEmail } from './adapters/resend/orderConfirmationEmail';
import { stripe, retrievePaymentIntent } from './adapters/stripe/client';
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

const shipping: ShippingRates = {
  fetchAlleKurierRates,
  transformAlleKurierToShippingOption,
};

const addressValidation: AddressValidation = {
  verifyPolishAddress,
  validateWithGoogle,
  placesAutocomplete,
};

const sessions: CheckoutSessions = { getCheckoutSession };

const payments: Payments = { stripe, retrievePaymentIntent };

const emails: OrderEmails = { sendOrderConfirmationEmail };

export const placeOrderFromPaymentIntent = (
  pi: Stripe.PaymentIntent,
  sessionData?: OrderSessionData
) => placeOrderFromPaymentIntentUseCase({ orders, emails }, { pi, sessionData });

export { getCheckoutSession };
export { fetchAlleKurierRates, transformAlleKurierToShippingOption };
export { verifyPolishAddress, validateWithGoogle, placesAutocomplete };
export { fetchOrderByPaymentIntentId as getOrderByPaymentIntentId };
export { createOrderFromPaymentIntent };
export { getPaymentProducts, getProductsByIds, getProductUnitAmountsByIds };
export { stripe, retrievePaymentIntent };
export type { CheckoutSession, OrderSessionData, OrderForSuccessPage, AutocompleteResult } from './core/rules/checkoutTypes';
export type { PaymentProduct } from './core/rules/checkoutTypes';
