// TODO implement the Reference Pattern and switches to Markdown

import { defineType, defineField, defineArrayMember } from "sanity";
import { TrolleyIcon } from "@sanity/icons";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    // TODO FIX 1: Switched to Markdown (Install 'sanity-plugin-markdown')
    // defineField({
    //   name: "description",
    //   title: "Description",
    //   type: "blockContent",
    // }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe Price ID",
      type: "string",
      description:
        "The unique ID for the Price object in Stripe (e.g., price_...).",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "displayPrice",
      title: "Display Price (e.g., 19.99)",
      type: "number",
      description: "The human-readable price, must match the price on Stripe.",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "reservedStock",
      title: "Reserved Stock",
      type: "number",
      description: "Stock reserved by active checkout sessions",
      initialValue: 0,
      readOnly: false,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "reservations",
      title: "Active Reservations",
      type: "array",
      description: "Individual reservations with expiration tracking",
      of: [
        defineArrayMember({
          name: "reservation",
          type: "object",
          fields: [
            { name: "idempotencyKey", type: "string", title: "Idempotency Key" },
            { name: "quantity", type: "number", title: "Quantity", validation: (Rule) => Rule.min(1) },
            {
              name: "expiresAt",
              type: "datetime",
              title: "Expires At",
              validation: (Rule) => Rule.required()
            },
            { name: "status", type: "string", title: "Status", initialValue: "active" },
          ],
        }),
      ],
      initialValue: [],
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      description: "Stock Keeping Unit - Unique identifier for the product",
      validation: (Rule) => Rule.required().min(3),
    }),
    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      type: "array",
      title: "Image Gallery",
      of: [defineArrayMember({ type: "image" })],
    }),
    // defineField({
    //   name: "categories",
    //   title: "Categories",
    //   description:
    //     "The first category in this list will be treated as the 'Primary' category for breadcrumbs and URLs.",
    //   type: "array",
    //   of: [
    //     {
    //       type: "reference",
    //       to: [{ type: "category" }],
    //     },
    //   ],
    //   validation: (Rule) => Rule.required().min(1),
    // }),
    defineField({
      name: "catalogueLocationKeys",
      title: "Catalogue Location",
      description: "Select where this product appears in the catalogue.",
      type: "array",
      of: [{ type: "string" }],
      // components: { input: MenuLocationInput }, // <--- UNCOMMENT THIS when component exists
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: "overviewFields",
      title: "Overview Fields",
      type: "array",
      of: [
        defineArrayMember({
          name: "overviewField",
          type: "object",
          fields: [
            { name: "title", type: "string", title: "Title" },
            { name: "value", type: "string", title: "Value" },
            { name: "information", type: "string", title: "Information" },
          ],
        }),
      ],
    }),
    // TODO Note: Use a different system for Sidebar Filtering.
    defineField({
      name: "specifications",
      title: "Specifications",
      type: "array",
      of: [
        defineArrayMember({
          name: "spec",
          type: "object",
          fields: [
            {
              name: "title",
              type: "string",
              title: "Specification Title",
            },
            {
              name: "value",
              type: "string",
              title: "Value",
            },
            {
              name: "information",
              type: "string",
              title: "Information",
            },
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      id: "_id",
      media: "image",
      price: "displayPrice",
    },
    prepare(selection) {
      return {
        title: `${selection.title} - $${selection.price}`,
        subtitle: `ID: ${selection.id}`,
        media: selection.media,
      };
    },
  },
});
