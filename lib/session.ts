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
  lastPaymentIntentId?: string; // Set for any PI processed by return handler (not just succeeded)
  checkoutSessionId?: string; // Unified Trace ID for checkout flow logging
}

// Fail closed: the cookie carries trusted checkout values (e.g. shippingCost), so a
// missing secret must stop checkout rather than fall back to a guessable password.
// Read lazily so `next build` does not need the secret at import time.
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

export async function getCheckoutSession() {
  const cookieStore = await cookies();
  return getIronSession<CheckoutSession>(cookieStore, {
    password: getSessionSecret(),
    cookieName: "checkout_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
    },
  });
}
