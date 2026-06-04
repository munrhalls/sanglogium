import { Resend } from "resend";

interface EmailUser {
  id: string;
  email: string;
  name?: string | null;
}

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function logDevEmail(type: string, to: string, url: string) {
  console.log(`\n[DEV EMAIL] ${type}`);
  console.log(`  To: ${to}`);
  console.log(`  URL: ${url}`);
  console.log(`  (Set RESEND_API_KEY env var to send real emails)\n`);
}

export async function sendVerificationEmail(data: {
  user: EmailUser;
  url: string;
  token: string;
}): Promise<void> {
  const { user, url } = data;

  if (!resend) {
    logDevEmail("Email Verification", user.email, url);
    return;
  }

  await resend.emails.send({
    from: resendFromEmail,
    to: user.email,
    subject: "Verify your email — Sang Logium",
    html: `
      <p>Hi ${user.name || "there"},</p>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${url}">${url}</a></p>
      <p>This link expires in 1 hour.</p>
    `,
  });
}

export async function sendResetPasswordEmail(data: {
  user: EmailUser;
  url: string;
  token: string;
}): Promise<void> {
  const { user, url } = data;

  if (!resend) {
    logDevEmail("Password Reset", user.email, url);
    return;
  }

  await resend.emails.send({
    from: resendFromEmail,
    to: user.email,
    subject: "Reset your password — Sang Logium",
    html: `
      <p>Hi ${user.name || "there"},</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${url}">${url}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, you can safely ignore it.</p>
    `,
  });
}
