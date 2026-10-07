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

export type PaymentMethodDetails = {
  type: string;
  card: {
    brand: string | null;
    last4: string | null;
    walletType: string | null;
  } | null;
};

export type PaidPayment = { id: string; amount: number; currency: string; receiptEmail: string | null; metadata: Record<string, string>; paymentMethod: PaymentMethodDetails | null };
