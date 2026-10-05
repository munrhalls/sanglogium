"use server";

import { getCheckoutSession } from "@/features/checkout/server";
import { redirect } from "next/navigation";
import { logCheckoutEvent, generateCheckoutSessionId } from "@/platform/utils/eventLogger";

export async function initCheckoutSession(items: Array<{ productId: string; quantity: number }
