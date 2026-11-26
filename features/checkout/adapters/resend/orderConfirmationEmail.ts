import "server-only";
import { sendEmail } from "@/platform/email/send";
import { formatPrice } from "@/platform/utils/price";
import type { OrderConfirmationEmailData } from "@/features/order";

export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<void> {
  const { to, orderNumber, items, total, shippingAddress } = data
  const shipped = shippingAddress as typeof shippingAddress & { phone?: string }
  const phoneLine = shipped.phone
    ? `<p style="margin:0;">${shipped.phone}</p>`
    : ""

  const addressed = shippingAddress as typeof shippingAddress & { country?: string }
  const countryLine = addressed.country
    ? `<p style="margin:0;">${addressed.country}</p>`
    : ""

  const method = data.shippingMethod
  const methodLine = method
    ? `<p style="margin:0;">${method.carrier} — ${method.estimatedDays ?? '?'} ${method.estimatedDays === 1 ? 'business day' : 'business days'}</p>`
    : ""

  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatPrice(item.subtotal)}</td>
        </tr>`
    )
    .join('')

  await sendEmail({
    type: "Order Confirmation",
    to,
    devLabel: `Order #${orderNumber}`,
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
          <strong>Total:</strong> ${formatPrice(total)}
        </p>
        ${methodLine}
        <div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;">
          <p style="margin:0 0 8px;font-weight:bold;">Shipping to:</p>
          <p style="margin:0;">${shippingAddress.name}</p>
          <p style="margin:0;">${shippingAddress.line1}</p>
          <p style="margin:0;">${shippingAddress.postalCode} ${shippingAddress.city}</p>
          ${countryLine}
          ${phoneLine}
        </div>
      </div>
    `,
  })
}
