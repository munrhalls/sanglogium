import "server-only";
import { resend } from "./client";

const resendFromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function logDevEmail(type: string, to: string, url: string) {
  console.log(`\n[DEV EMAIL] ${type}`);
  console.log(`  To: ${to}`);
  console.log(`  URL: ${url}`);
  console.log(`  (Set RESEND_API_KEY env var to send real emails)\n`);
}

export async function sendEmail(data: {
  type: string;
  to: string;
  devLabel: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) {
    logDevEmail(data.type, data.to, data.devLabel);
    return;
  }

  await resend.emails.send({
    from: resendFromEmail,
    to: data.to,
    subject: data.subject,
    html: data.html,
  });
}

// Resend sends one email per key for 24 hours and returns its refusals instead of throwing, so both are handled here.
export async function sendEmailOnce(data: {
  to: string[];
  subject: string;
  text: string;
  idempotencyKey: string;
}): Promise<void> {
  if (!resend) {
    logDevEmail(data.idempotencyKey, data.to.join(", "), data.subject);
    return;
  }

  const { error } = await resend.emails.send(
    {
      from: resendFromEmail,
      to: data.to,
      subject: data.subject,
      text: data.text,
    },
    { idempotencyKey: data.idempotencyKey },
  );
  if (error) throw new Error(`Resend refused the email: ${error.name}`);
}
