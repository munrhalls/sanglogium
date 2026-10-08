import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

import type { CheckoutSession } from "@/features/checkout/core/types/checkoutTypes";

export type { CheckoutSession };

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
