import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface CheckoutSession {
  basket: Array<{ productId: string; quantity: number }>;
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
