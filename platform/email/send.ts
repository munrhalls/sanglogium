import "server-only";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

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
