import type { Address } from "@/features/address";

export interface AccountSummary {
  _id?: string;
  marketingEmailsOptIn?: boolean;
}

export type SavedAddress = Address & { _key: string };

export interface UserAddressesProfile {
  _id: string;
  addresses?: SavedAddress[];
}

export interface UserOrderSummary {
  orderNumber: string;
  status: string;
  pricing: {
    total: number;
    currency: string;
  };
  dates: {
    orderedAt: string;
  };
}

export type OrderDetail = {
  orderNumber?: string;
  status?:
    | "pending_payment"
    | "processing"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "refunded"
    | "failed";
  items?: Array<{
    productRef?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
    };
    productId?: string;
    name?: string;
    slug?: string;
    imageUrl?: string;
    variant?: {
      size?: string;
      color?: string;
      sku?: string;
    };
    price?: number;
    compareAtPrice?: number;
    quantity?: number;
    subtotal?: number;
    discount?: {
      amount?: number;
      code?: string;
      type?: string;
    };
    returnStatus?: "none" | "requested" | "approved" | "returned" | "refunded";
    refundedAmount?: number;
    _type: "orderItem";
    _key: string;
  }>;
  shippingAddress?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
  billingAddress?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  shippingMethod?: {
    name?: string;
    price?: number;
    estimatedDays?: number;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  pricing?: {
    subtotal?: number;
    shipping?: number;
    tax?: number;
    discount?: number;
    total?: number;
    currency?: string;
  };
  dates?: {
    orderedAt?: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    refundedAt?: string;
  };
  payment?: {
    stripePaymentIntentId?: string;
    stripeCustomerId?: string;
    stripeCheckoutSessionId?: string;
    method?: string;
    last4?: string;
    brand?: string;
  };
  metadata?: {
    source?: string;
    ip?: string;
    userAgent?: string;
    discountCodes?: Array<string>;
    notes?: string;
    customerNotes?: string;
    giftMessage?: string;
    tags?: Array<string>;
  };
};

export interface MergedGuestOrderCountParams {
  userId: string;
  email: string;
  userCreatedAt: string;
}
