import { subscribeSchema } from "@/features/shell/core/rules/newsletter";
import type { NewsletterSubscriptions } from "@/features/shell/core/ports";

type SubscribeNewsletterResult = {
  status: number;
  body: { ok?: true; error?: string };
};

export async function subscribeNewsletter(
  subscriptions: NewsletterSubscriptions,
  input: unknown
): Promise<SubscribeNewsletterResult> {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 400,
      body: { error: "Please enter a valid email address." },
    };
  }

  const outcome = await subscriptions.subscribe(parsed.data.email);
  switch (outcome) {
    case "ok":
      return { status: 200, body: { ok: true } };
    case "unavailable":
      return {
        status: 503,
        body: { error: "Newsletter is temporarily unavailable." },
      };
    case "provider-error":
      return {
        status: 502,
        body: { error: "Unable to subscribe right now. Please try again." },
      };
    default:
      return {
        status: 500,
        body: { error: "Unable to subscribe right now. Please try again." },
      };
  }
}
