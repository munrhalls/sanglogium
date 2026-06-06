import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

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
  checkoutSessionId?: string; // Unified Trace ID for checkout flow logging
}

export async function getCheckoutSession() {
  const cookieStore = await cookies();
  return getIronSession<CheckoutSession>(cookieStore, {
    password: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
    cookieName: "checkout_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
    },
  });
}
