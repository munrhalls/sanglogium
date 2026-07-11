"use server";

import { requireSession } from "@/lib/auth/dal";
import { backendClient } from "@/sanity-cms/lib/backendClient";
import type { Address } from "@/app/checkout/checkout.types";
import { randomUUID } from "node:crypto";

async function getProfileId(authId: string) {
  return backendClient.fetch<{ _id: string }>(
    `*[_type == "userProfile" && authId == $authId][0]{_id}`,
    { authId }
  );
}

function parseAddress(formData: FormData): Address | { error: string } {
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const regionCode = (formData.get("regionCode") as string)?.trim();
  const postalCode = (formData.get("postalCode") as string)?.trim();
  const street = (formData.get("street") as string)?.trim();
  const streetNumber = (formData.get("streetNumber") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();

  if (
    !firstName ||
    !lastName ||
    !phone ||
    !regionCode ||
    !postalCode ||
    !street ||
    !streetNumber ||
    !city
  ) {
    return { error: "All fields are required." };
  }

  return {
    firstName,
    lastName,
    phone,
    regionCode,
    postalCode,
    street,
    streetNumber,
    city,
  };
}

export async function addAddress(formData: FormData) {
  const session = await requireSession();
  const parsed = parseAddress(formData);
  if ("error" in parsed) return parsed;

  const profile = await getProfileId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  const newAddress = { _key: randomUUID(), ...parsed };

  await backendClient
    .patch(profile._id)
    .setIfMissing({ addresses: [] })
    .append("addresses", [newAddress])
    .commit();

  return { success: true };
}

export async function updateAddress(addressKey: string, formData: FormData) {
  const session = await requireSession();
  if (!addressKey) return { error: "Address key is required." };

  const parsed = parseAddress(formData);
  if ("error" in parsed) return parsed;

  const profile = await getProfileId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  const updatedAddress = { _key: addressKey, ...parsed };

  await backendClient
    .patch(profile._id)
    .unset([`addresses[_key=="${addressKey}"]`])
    .append("addresses", [updatedAddress])
    .commit();

  return { success: true };
}

export async function removeAddress(addressKey: string) {
  const session = await requireSession();
  if (!addressKey) return { error: "Address key is required." };

  const profile = await getProfileId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await backendClient
    .patch(profile._id)
    .unset([`addresses[_key=="${addressKey}"]`])
    .commit();

  return { success: true };
}
