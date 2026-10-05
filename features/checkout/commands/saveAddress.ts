"use server";

import { getCheckoutSession } from "@/features/checkout/server";
import { redirect } from "next/navigation";
import type { Address } from "@/features/checkout/core/rules/checkoutTypes";
import { logCheckoutEvent, generateCheckoutSessionId } from "@/platform/utils/eventLogger";
import { submitShippingAction } from "./submitShippingAction";

export async function saveAddress(
  address: Address,
  opts?: { skipValidation?: boolean }
