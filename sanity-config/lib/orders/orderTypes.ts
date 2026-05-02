// TypeScript types for Order operations

export interface OrderItem {
  productRef?: string; // Reference ID (optional, for analytics)
  productId: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  variant?: {
    size?: string;
    color?: string;
    sku?: string;
  };
  price: number;
  compareAtPrice?: number;
  quantity: number;
  subtotal: number;
  discount?: {
    amount: number;
    code: string;
    type: string;
  };
  returnStatus?: string;
  refundedAmount?: number;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddress {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ShippingMethod {
  name: string;
  price: number;
  estimatedDays?: number;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface OrderPricing {
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  currency: string;
}

export interface PaymentInfo {
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeCheckoutSessionId?: string;
  method?: string;
  last4?: string;
  brand?: string;
}

export interface OrderMetadata {
  source?: string;
  ip?: string;
  userAgent?: string;
  discountCodes?: string[];
  notes?: string;
  customerNotes?: string;
  giftMessage?: string;
  tags?: string[];
}

export interface CreateOrderOptions {
  // Customer info
  clerkUserId?: string;
  customerEmail: string;
  customerPhone?: string;
  isGuest?: boolean;

  // Order items
  items: OrderItem[];

  // Addresses
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;

  // Shipping
  shippingMethod?: ShippingMethod;

  // Pricing
  pricing: OrderPricing;

  // Payment
  payment?: PaymentInfo;

  // Metadata
  metadata?: OrderMetadata;
}

export interface Order extends CreateOrderOptions {
  _id: string;
  _type: "order";
  orderNumber: string;
  orderId: string;
  status: string;
  dates: {
    orderedAt: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    refundedAt?: string;
  };
}

export interface CreateOrderResult {
  success: true;
  order: Order;
}

export interface CreateOrderError {
  success: false;
  error: string;
  details?: unknown;
}

export type CreateOrderResponse = CreateOrderResult | CreateOrderError;
