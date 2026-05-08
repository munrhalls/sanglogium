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
      name: "price_data",
      title: "Price Data",
      type: "object",
      description: "Price data for Stripe PaymentIntent (currency in cents)",
      fields: [
        defineField({
          name: "currency",
          title: "Currency",
          type: "string",
          description: "Three-letter ISO currency code (e.g., usd)",
          initialValue: "usd",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "unit_amount",
          title: "Unit Amount (cents)",
          type: "number",
          description: "Price in smallest currency unit (cents, e.g., 1999 for $19.99)",
          validation: (Rule) => Rule.required().min(0),
        }),
      ],
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
      unitAmount: "price_data.unit_amount",
    },
    prepare(selection) {
      const displayPrice = (selection.unitAmount / 100).toFixed(2);
      return {
        title: `${selection.title} - $${displayPrice}`,
        subtitle: `ID: ${selection.id}`,
        media: selection.media,
      };
    },
  },
});
