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
  const { user, token } = data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  if (!resend) {
    logDevEmail("Email Verification", user.email, verificationUrl);
    return;
  }

  await resend.emails.send({
    from: resendFromEmail,
    to: user.email,
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

  if (!resend) {
    logDevEmail("Password Reset", user.email, resetUrl);
    return;
  }

  await resend.emails.send({
    from: resendFromEmail,
    to: user.email,
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

  if (!resend) {
    logDevEmail("Delete Account Verification", user.email, deleteUrl);
    return;
  }

  await resend.emails.send({
    from: resendFromEmail,
    to: user.email,
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

export async function sendOrderConfirmationEmail(data: {
  to: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; subtotal: number }>
  total: number
  shippingAddress: { name: string; line1: string; city: string; postalCode: string }
}): Promise<void> {
  const { to, orderNumber, items, total, shippingAddress } = data

  if (!resend) {
    logDevEmail("Order Confirmation", to, `Order #${orderNumber}`)
    return
  }

  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${(item.subtotal / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</td>
        </tr>`
    )
    .join('')

  await resend.emails.send({
    from: resendFromEmail,
    to,
    subject: `Order confirmed — ${orderNumber}`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:sans-serif;color:#111827;">
        <h1 style="font-size:20px;margin-bottom:16px;">Thank you for your order!</h1>
        <p style="margin-bottom:8px;"><strong>Order:</strong> ${orderNumber}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <thead>
            <tr style="border-bottom:2px solid #d1d5db;">
              <th style="text-align:left;padding:8px 0;">Item</th>
              <th style="text-align:center;padding:8px 0;">Qty</th>
              <th style="text-align:right;padding:8px 0;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="margin-top:16px;font-size:16px;">
          <strong>Total:</strong> ${(total / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
        </p>
        <div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;">
          <p style="margin:0 0 8px;font-weight:bold;">Shipping to:</p>
          <p style="margin:0;">${shippingAddress.name}</p>
          <p style="margin:0;">${shippingAddress.line1}</p>
          <p style="margin:0;">${shippingAddress.postalCode} ${shippingAddress.city}</p>
        </div>
      </div>
    `,
  })
}
