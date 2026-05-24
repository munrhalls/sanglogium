"use server";

import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function initCheckoutSession(items: Array<{ productId: string; quantity: number }>) {
  const session = await getCheckoutSession();

  // Save items directly to the secure iron-session cookie
  session.basket = items;
  await session.save();

  // Transition to the next page
  redirect("/checkout/address");
}
