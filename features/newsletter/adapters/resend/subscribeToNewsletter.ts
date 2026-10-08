import "server-only";
import { Resend } from "resend";
import type { NewsletterSubscriptions } from "@/features/newsletter/core/ports";

const resendApiKey = process.env.RESEND_API_KEY;
const audienceId = process.env.RESEND_AUDIENCE_ID;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

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
