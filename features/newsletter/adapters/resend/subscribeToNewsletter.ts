import "server-only";
import type { NewsletterSubscriptions } from "@/features/newsletter/core/ports";
import { resend } from "@/platform/email/client";

const audienceId = process.env.RESEND_AUDIENCE_ID;

export const subscribeToNewsletter: NewsletterSubscriptions["subscribe"] = async (
  email
) => {
  if (!resend || !audienceId) {
    console.error(
      "[API/newsletter/subscribe] Missing RESEND_API_KEY or RESEND_AUDIENCE_ID"
    );
    return "unavailable";
  }

  try {
    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      audienceId,
    });

    if (error) {
      console.error("[API/newsletter/subscribe] Resend error:", error);
      return "provider-error";
    }

    return "ok";
  } catch (err) {
    console.error("[API/newsletter/subscribe] Unexpected error:", err);
    return "unexpected-error";
  }
};
