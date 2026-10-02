import { defineField, defineArrayMember } from "sanity";

export const orderItemsField = defineField({
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
    });
