// schemas/order.js
import { BasketIcon } from "@sanity/icons";
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
      name: "clerkUserId",
      title: "User ID",
      type: "string",
      description: "Clerk user ID (null for guest orders)",
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
    defineField({
      name: "items",
      title: "Order Items",
      type: "array",
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "orderItem",
          title: "Order Item",
          fields: [
            // Reference for analytics only
            defineField({
              name: "productRef",
              title: "Product Reference",
              type: "reference",
              to: [{ type: "product" }],
              weak: true, // Don't break if product deleted
              description: "Link to product (for analytics only)",
            }),

            // SNAPSHOT all product data at purchase time
            defineField({
              name: "productId",
              title: "Product ID",
              type: "string",
              validation: (Rule) => Rule.required(),
              description: "Product ID at time of purchase",
            }),
            defineField({
              name: "name",
              title: "Product Name",
              type: "string",
              validation: (Rule) => Rule.required(),
              description: "Product name at time of purchase",
            }),
            defineField({
              name: "slug",
              title: "Product Slug",
              type: "string",
              description: "For generating links to product",
            }),
            defineField({
              name: "imageUrl",
              title: "Product Image",
              type: "url",
              description: "Main product image at time of purchase",
            }),
            defineField({
              name: "variant",
              title: "Selected Variant",
              type: "object",
              fields: [
                { name: "size", type: "string", title: "Size" },
                { name: "color", type: "string", title: "Color" },
                { name: "sku", type: "string", title: "SKU" },
              ],
            }),
            // TODO AUDIT LOG - Structure: [{ timestamp: '...', action: 'PACKED', actor: 'user_123', metadata: {...} }]
            // Why? Manager UI needs access to WHO, WHEN, WHY, WHAT PACKER ID
            // BUSINESS RELEVANCE === handling human packer fraud, handling exceptions
            // Pricing snapshot
            defineField({
              name: "price",
              title: "Unit Price",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
              description: "Price per unit at time of purchase",
            }),
            defineField({
              name: "compareAtPrice",
              title: "Original Price",
              type: "number",
              description: "Original price if item was on sale",
            }),
            defineField({
              name: "quantity",
              title: "Quantity",
              type: "number",
              validation: (Rule) => Rule.required().integer().min(1),
            }),
            defineField({
              name: "subtotal",
              title: "Line Subtotal",
              type: "number",
              validation: (Rule) => Rule.required(),
              description: "price * quantity",
              readOnly: true,
            }),

            // Item-specific discounts
            defineField({
              name: "discount",
              title: "Line Discount",
              type: "object",
              fields: [
                { name: "amount", type: "number", title: "Discount Amount" },
                { name: "code", type: "string", title: "Discount Code" },
                { name: "type", type: "string", title: "Discount Type" },
              ],
            }),

            // Return/refund tracking
            defineField({
              name: "returnStatus",
              title: "Return Status",
              type: "string",
              options: {
                list: [
                  { title: "Not Returned", value: "none" },
                  { title: "Return Requested", value: "requested" },
                  { title: "Return Approved", value: "approved" },
                  { title: "Returned", value: "returned" },
                  { title: "Refunded", value: "refunded" },
                ],
              },
              initialValue: "none",
            }),
            defineField({
              name: "refundedAmount",
              title: "Refunded Amount",
              type: "number",
              description: "Amount refunded for this item",
            }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "variant.size",
              quantity: "quantity",
              price: "price",
            },
            prepare(selection) {
              const { title, subtitle, quantity, price } = selection;
              return {
                title: `${title} ${subtitle ? `(${subtitle})` : ""}`,
                subtitle: `${quantity} × $${price} = $${quantity * price}`,
              };
            },
          },
        }),
      ],
    }),

    // ============ ADDRESSES (SNAPSHOT) ============
    defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "object",
      validation: (Rule) => Rule.required(),
      fields: [
        {
          name: "name",
          type: "string",
          title: "Full Name",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "line1",
          type: "string",
          title: "Address Line 1",
          validation: (Rule) => Rule.required(),
        },
        { name: "line2", type: "string", title: "Address Line 2" },
        {
          name: "city",
          type: "string",
          title: "City",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "state",
          type: "string",
          title: "State/Province",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "postalCode",
          type: "string",
          title: "Postal Code",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "country",
          type: "string",
          title: "Country",
          validation: (Rule) => Rule.required(),
        },
        { name: "phone", type: "string", title: "Phone" },
      ],
    }),
    defineField({
      name: "billingAddress",
      title: "Billing Address",
      type: "object",
      description: "Leave empty if same as shipping",
      fields: [
        { name: "name", type: "string", title: "Full Name" },
        { name: "line1", type: "string", title: "Address Line 1" },
        { name: "line2", type: "string", title: "Address Line 2" },
        { name: "city", type: "string", title: "City" },
        { name: "state", type: "string", title: "State/Province" },
        { name: "postalCode", type: "string", title: "Postal Code" },
        { name: "country", type: "string", title: "Country" },
      ],
    }),

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
      initialValue: "pending_payment",
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
