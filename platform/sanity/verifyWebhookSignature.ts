import "server-only";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Sanity signs its webhook calls; parseBody checks that signature against our
// secret. Without the check, any POST to a public revalidate route busts the
// catalogue Data Cache.
export async function verifyWebhookSignature(request: NextRequest, secret: string): Promise<boolean> {
  const { isValidSignature } = await parseBody(request, secret);
  return isValidSignature === true;
}
