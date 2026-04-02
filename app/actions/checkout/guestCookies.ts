"use server";

import { cookies } from "next/headers";
import type { Address } from "@/app/(store)/checkout/checkout.types";

const GUEST_COOKIE_NAME = "guest_checkout";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

interface GuestCheckoutData {
  email?: string;
  address?: Address;
  name?: string;
  phone?: string;
}

/**
 * Get guest checkout data from cookie
 */
export async function getGuestCheckoutData(): Promise<GuestCheckoutData | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(GUEST_COOKIE_NAME);

  if (!cookie?.value) return null;

  try {
    return JSON.parse(cookie.value) as GuestCheckoutData;
  } catch {
    return null;
  }
}

/**
 * Save guest checkout data to cookie
 */
export async function saveGuestCheckoutData(data: GuestCheckoutData): Promise<void> {
  const cookieStore = await cookies();
  const existing = await getGuestCheckoutData();

  const merged = {
    ...existing,
    ...data,
  };

  cookieStore.set(GUEST_COOKIE_NAME, JSON.stringify(merged), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear guest checkout cookie
 */
export async function clearGuestCheckoutData(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_COOKIE_NAME);
}

/**
 * Save guest email for order lookup
 */
export async function saveGuestEmail(email: string): Promise<void> {
  await saveGuestCheckoutData({ email });
}

/**
 * Save guest address for future checkouts
 */
export async function saveGuestAddress(
  address: Address,
  name: string,
  phone?: string
): Promise<void> {
  await saveGuestCheckoutData({ address, name, phone });
}

/**
 * Get guest email for order lookup
 */
export async function getGuestEmail(): Promise<string | null> {
  const data = await getGuestCheckoutData();
  return data?.email || null;
}

/**
 * Get guest address for pre-filling checkout form
 */
export async function getGuestAddress(): Promise<{
  address: Address | null;
  name: string | null;
  phone: string | null;
}> {
  const data = await getGuestCheckoutData();
  return {
    address: data?.address || null,
    name: data?.name || null,
    phone: data?.phone || null,
  };
}
