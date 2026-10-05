"use server";

import { getCheckoutSession } from "@/features/checkout/server";

export async function saveEmailToSession(email: string) {
  const session = await getCheckoutSession();
  session.email = email;
  await session.save();
}
