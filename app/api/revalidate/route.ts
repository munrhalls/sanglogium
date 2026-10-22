import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/platform/sanity/verifyWebhookSignature";

export async function POST(request: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[revalidate] SANITY_WEBHOOK_SECRET is not set — refusing to revalidate");
    return NextResponse.json({ error: "webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, request.headers.get("sanity-webhook-signature"), secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  console.log("🔥 Sanity Webhook received! Revalidating...");
  revalidateTag("catalogue-index");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
