import { z } from "zod";

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export type NewsletterSubscribeOutcome =
  | "ok"
  | "unavailable"
  | "provider-error"
  | "unexpected-error";
