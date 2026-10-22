import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Sanity sends `sanity-webhook-signature: t=<ms>,v1=<hex>` when the webhook has a
// secret; v1 is HMAC-SHA256 of `${t}.${rawBody}` with that secret. Without the
// check, any POST to a public revalidate route busts the catalogue Data Cache.
export function verifyWebhookSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): boolean {
  const t = header?.match(/t=(\d+)/)?.[1];
  const v1 = header?.match(/v1=([0-9a-f]{64})/i)?.[1];
  if (!t || !v1) return false;

  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest();
  const received = Buffer.from(v1, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}
