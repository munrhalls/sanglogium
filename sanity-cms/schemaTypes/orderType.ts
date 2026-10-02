// schemas/order.js
import { BasketIcon } from "@sanity/icons";
import { orderItemsField } from "./orderItemsField";
import { shippingAddressField, billingAddressField } from "./orderAddressFields";
import { defineType, defineField, defineArrayMember } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: BasketIcon,
  fields: [
    // ============ IDENTIFIERS ============
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      description: "Human-readable order number (e.g., ORD-2024-0001)",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "orderId",
      title: "Order ID",
      type: "string",
      description: "Unique system identifier",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),

    // ============ CUSTOMER INFO ============
    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      description: "User ID (null for guest orders)",
      // NOT required - allows guest checkout
    }),
    defineField({
      name: "customerEmail",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "customerPhone",
      title: "Customer Phone",
      type: "string",
    }),
    defineField({
      name: "isGuest",
      title: "Guest Order",
      type: "boolean",
      description: "True if order placed without account",
      initialValue: false,
    }),

    // ============ ORDER ITEMS (CRITICAL CHANGE) ============
    orderItemsField,

    // ============ ADDRESSES (SNAPSHOT) ============
    shippingAddressField,
    billingAddressField,

    // ============ SHIPPING INFO ============
    defineField({
      name: "shippingMethod",
      title: "Shipping Method",
      type: "object",
      fields: [
        { name: "name", type: "string", title: "Method Name" },
        { name: "price", type: "number", title: "Shipping Cost" },
        { name: "estimatedDays", type: "number", title: "Estimated Days" },
        { name: "carrier", type: "string", title: "Carrier" },
        { name: "trackingNumber", type: "string", title: "Tracking Number" },
        { name: "trackingUrl", type: "url", title: "Tracking URL" },
      ],
    }),

    // ============ PRICING BREAKDOWN ============
    defineField({
      name: "pricing",
      title: "Pricing",
      type: "object",
      validation: (Rule) => Rule.required(),
      fields: [
        {
          name: "subtotal",
          type: "number",
          title: "Subtotal",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "shipping",
          type: "number",
          title: "Shipping",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "tax",
          type: "number",
          title: "Tax",
          validation: (Rule) => Rule.required(),
        },
        { name: "discount", type: "number", title: "Discount" },
        {
          name: "total",
          type: "number",
          title: "Total",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "currency",
          type: "string",
          title: "Currency",
          validation: (Rule) => Rule.required(),
        },
      ],
    }),

    // ============ ORDER STATUS ============
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending Payment", value: "pending_payment" },
          { title: "Processing", value: "processing" },
          { title: "Packed", value: "packed" },
          { title: "Shipped", value: "shipped" },
          { title: "Out for Delivery", value: "out_for_delivery" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Refunded", value: "refunded" },
          { title: "Failed", value: "failed" },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: "processing",
    }),

    // ============ TIMESTAMPS ============
    defineField({
      name: "dates",
      title: "Important Dates",
      type: "object",
      fields: [
        {
          name: "orderedAt",
          type: "datetime",
          title: "Order Date",
          validation: (Rule) => Rule.required(),
        },
        { name: "paidAt", type: "datetime", title: "Payment Date" },
        { name: "shippedAt", type: "datetime", title: "Shipped Date" },
        { name: "deliveredAt", type: "datetime", title: "Delivered Date" },
        { name: "cancelledAt", type: "datetime", title: "Cancelled Date" },
        { name: "refundedAt", type: "datetime", title: "Refunded Date" },
      ],
    }),

    // ============ METADATA ============
    defineField({
      name: "metadata",
      title: "Metadata",
      type: "object",
      fields: [
        {
          name: "source",
          type: "string",
          title: "Order Source",
          description: "web, mobile, admin",
        },
        { name: "ip", type: "string", title: "Customer IP" },
        { name: "userAgent", type: "string", title: "User Agent" },
        {
          name: "discountCodes",
          type: "array",
          of: [{ type: "string" }],
          title: "Discount Codes Used",
        },
        { name: "notes", type: "text", title: "Internal Notes" },
        { name: "customerNotes", type: "text", title: "Customer Notes" },
        { name: "giftMessage", type: "text", title: "Gift Message" },
        {
          name: "tags",
          type: "array",
          of: [{ type: "string" }],
          title: "Tags",
        },
      ],
    }),

    // ============ RETURNS/REFUNDS ============
    defineField({
      name: "returns",
      title: "Returns",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "return",
          title: "Return",
          fields: [
            { name: "returnId", type: "string", title: "Return ID" },
            {
              name: "items",
              type: "array",
              of: [{ type: "string" }],
              title: "Item IDs",
            },
            { name: "reason", type: "string", title: "Return Reason" },
            { name: "status", type: "string", title: "Return Status" },
            { name: "refundAmount", type: "number", title: "Refund Amount" },
            { name: "requestedAt", type: "datetime", title: "Requested Date" },
            { name: "processedAt", type: "datetime", title: "Processed Date" },
          ],
        }),
      ],
    }),

    // ============ PAYMENT INTENT ID (top-level, for GROQ lookup by return flow + webhook) ============
    defineField({
      name: "paymentIntentId",
      title: "Payment Intent ID",
      type: "string",
      description: "Stripe PaymentIntent ID — top-level for fast GROQ lookup by return flow and webhook handler",
      readOnly: true,
    }),

    // ============ PAYMENT INFO (for later) ============
    defineField({
      name: "payment",
      title: "Payment Information",
      type: "object",
      fields: [
        {
          name: "stripePaymentIntentId",
          type: "string",
          title: "Stripe Payment Intent ID",
        },
        {
          name: "stripeCustomerId",
          type: "string",
          title: "Stripe Customer ID",
        },
        {
          name: "stripeCheckoutSessionId",
          type: "string",
          title: "Stripe Checkout Session ID",
        },
        {
          name: "method",
          type: "string",
          title: "Payment Method",
          description: "card, paypal, etc.",
        },
        { name: "last4", type: "string", title: "Card Last 4" },
        { name: "brand", type: "string", title: "Card Brand" },
      ],
    }),
  ],

  // ============ PREVIEW CONFIG ============
  preview: {
    select: {
      orderNumber: "orderNumber",
      email: "customerEmail",
      total: "pricing.total",
      currency: "pricing.currency",
      status: "status",
      date: "dates.orderedAt",
      itemCount: "items.length",
    },
    prepare(selection) {
      const { orderNumber, email, total, currency, status, date, itemCount } =
        selection;
      const dateStr = date ? new Date(date).toLocaleDateString() : "No date";

      return {
        title: `${orderNumber} - ${email}`,
        subtitle: `${currency} ${total} • ${itemCount} items • ${status} • ${dateStr}`,
        media: BasketIcon,
      };
    },
  },
});
