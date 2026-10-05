import "server-only";
import { sendEmail } from "@/platform/email/send";

interface EmailUser {
  id: string;
  email: string;
  name?: string | null;
}

export async function sendVerificationEmail(data: {
  user: EmailUser;
  url: string;
  token: string;
}): Promise<void> {
  const { user, token } = data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await sendEmail({
    type: "Email Verification",
    to: user.email,
    devLabel: verificationUrl,
    subject: "Verify your email — Sang Logium",
    html: `
      <p>Hi ${user.name || "there"},</p>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link expires in 1 hour.</p>
    `,
  });
}

export async function sendResetPasswordEmail(data: {
  user: EmailUser;
  url: string;
  token: string;
}): Promise<void> {
  const { user, token } = data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await sendEmail({
    type: "Password Reset",
    to: user.email,
    devLabel: resetUrl,
    subject: "Reset your password — Sang Logium",
    html: `
      <p>Hi ${user.name || "there"},</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, you can safely ignore it.</p>
    `,
  });
}

export async function sendDeleteAccountVerification(data: {
  user: EmailUser;
  url: string;
  token: string;
}): Promise<void> {
  const { user, url, token } = data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const deleteUrl =
    url || `${baseUrl}/api/auth/delete-user/callback?token=${encodeURIComponent(token)}`;

  await sendEmail({
    type: "Delete Account Verification",
    to: user.email,
    devLabel: deleteUrl,
    subject: "Confirm account deletion — Sang Logium",
    html: `
      <p>Hi ${user.name || "there"},</p>
      <p>You requested to delete your Sang Logium account. This action cannot be undone.</p>
      <p>Click the link below to confirm and complete the deletion:</p>
      <p><a href="${deleteUrl}">${deleteUrl}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, you can safely ignore it.</p>
    `,
  });
}
