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
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "parcel",
      title: "Parcel Data",
      type: "object",
      description: "Shipping dimensions and weight for Shippo API",
      fields: [
        defineField({
          name: "length",
          title: "Length (cm)",
          type: "number",
          initialValue: 10,
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: "width",
          title: "Width (cm)",
          type: "number",
          initialValue: 10,
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: "height",
          title: "Height (cm)",
          type: "number",
          initialValue: 5,
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: "weight",
          title: "Weight (g)",
          type: "number",
          initialValue: 500,
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: "distance_unit",
          title: "Distance Unit",
          type: "string",
          initialValue: "cm",
          readOnly: true,
        }),
        defineField({
          name: "mass_unit",
          title: "Mass Unit",
          type: "string",
          initialValue: "g",
          readOnly: true,
        }),
      ],
    }),
    defineField({
      name: "reservedStock",
      title: "Reserved Stock",
      type: "number",
      description: "Stock reserved by active checkout sessions",
      initialValue: 0,
      readOnly: false,
      validation: (Rule) =>
        Rule.required()
          .min(0)
          .custom((reserved, context) => {
            const stock = (context.document as any)?.stock
            if (typeof stock === 'number' && typeof reserved === 'number' && reserved > stock) {
              return 'Reserved stock cannot exceed total stock.'
            }
            return true
          }),
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
    defineField({
      name: "catalogueLocationKeys",
      title: "Catalogue Location",
      description: "Select where this product appears in the catalogue.",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "displayPriority",
      title: "Display Priority (Featured)",
      type: "number",
      description:
        'Higher values appear earlier in the default "Featured" listing. Leave unset to use the default (treated as 0). Ties break by newest first.',
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
    defineField({
      name: "filterAttributes",
      title: "Filter Attributes",
      type: "object",
      description:
        "Closed, machine-readable attributes used by the catalogue filter controls and GROQ predicates. One field per facet from _project/filters/facet-map.json.",
      fields: ([
        {
          name: "price",
          title: "Price",
          type: "number",
          description:
            "Product price in cents; mirrors price_data.unit_amount for filter predicates.",
          categories: ["*"],
        },
        {
          name: "brand",
          title: "Brand",
          type: "array",
          of: [{ type: "string", options: { list: ["<brand-slug>"] } }],
          categories: ["*"],
        },
        {
          name: "inStock",
          title: "Availability",
          type: "boolean",
          categories: ["*"],
        },
        {
          name: "category",
          title: "Category",
          type: "array",
          of: [
            {
              type: "string",
              options: { list: ["headphones", "audio-electronics", "accessories"] },
            },
          ],
          categories: ["all-products"],
        },
        {
          name: "wearingStyle",
          title: "Wearing style",
          type: "string",
          options: { list: ["over-ear", "on-ear", "in-ear"] },
          categories: ["headphones"],
        },
        {
          name: "backDesign",
          title: "Back design",
          type: "string",
          options: { list: ["open", "closed", "semi-open"] },
          categories: ["headphones"],
        },
        {
          name: "driverType",
          title: "Driver type",
          type: "string",
          options: {
            list: [
              "dynamic",
              "planar-magnetic",
              "electrostatic",
              "balanced-armature",
              "hybrid",
            ],
          },
          categories: ["headphones"],
        },
        {
          name: "connectivity",
          title: "Connectivity",
          type: "string",
          options: { list: ["wired", "wireless"] },
          categories: ["headphones"],
        },
        {
          name: "connector",
          title: "Connector / plug",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "3.5mm",
                  "6.35mm",
                  "4.4mm-balanced",
                  "4-pin-xlr",
                  "2.5mm",
                  "usb-c",
                  "mmcx",
                  "2-pin",
                  "fixed-cable",
                ],
              },
            },
          ],
          categories: ["headphones"],
        },
        {
          name: "microphone",
          title: "Microphone",
          type: "boolean",
          categories: ["headphones"],
        },
        {
          name: "noiseCancelling",
          title: "Noise cancelling",
          type: "boolean",
          categories: ["headphones"],
        },
        {
          name: "requiresAmplifier",
          title: "Requires amplifier",
          type: "boolean",
          categories: ["headphones"],
        },
        {
          name: "deviceType",
          title: "Device type",
          type: "string",
          options: {
            list: [
              "headphone-amp",
              "dac",
              "dac-amp-combo",
              "dongle-dac",
              "dap",
              "network-streamer",
            ],
          },
          categories: ["audio-electronics"],
        },
        {
          name: "formFactor",
          title: "Form factor",
          type: "string",
          options: { list: ["desktop", "portable", "dongle"] },
          categories: ["audio-electronics"],
        },
        {
          name: "amplification",
          title: "Amplification",
          type: "string",
          options: { list: ["solid-state", "tube", "hybrid"] },
          categories: ["audio-electronics"],
        },
        {
          name: "dacIncluded",
          title: "DAC included",
          type: "boolean",
          categories: ["audio-electronics"],
        },
        {
          name: "balancedOutput",
          title: "Balanced output",
          type: "boolean",
          categories: ["audio-electronics"],
        },
        {
          name: "inputs",
          title: "Inputs",
          type: "array",
          of: [
            {
              type: "string",
              options: { list: ["usb", "optical", "coaxial", "rca", "bluetooth"] },
            },
          ],
          categories: ["audio-electronics"],
        },
        {
          name: "outputs",
          title: "Outputs",
          type: "array",
          of: [
            {
              type: "string",
              options: { list: ["6.35mm", "4.4mm", "4-pin-xlr", "rca-line-out"] },
            },
          ],
          categories: ["audio-electronics"],
        },
        {
          name: "accessoryType",
          title: "Accessory type",
          type: "string",
          options: {
            list: [
              "cable",
              "adapter",
              "interconnect",
              "eartip",
              "earpad",
              "stand",
              "case",
              "care",
            ],
          },
          categories: ["accessories"],
        },
        {
          name: "connectorTermination",
          title: "Connector / termination",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "3.5mm",
                  "6.35mm",
                  "4.4mm-balanced",
                  "4-pin-xlr",
                  "2.5mm",
                  "usb-c",
                  "mmcx",
                  "2-pin",
                  "fixed-cable",
                ],
              },
            },
          ],
          categories: ["accessories"],
        },
        {
          name: "compatibility",
          title: "Compatibility",
          type: "array",
          of: [{ type: "string", options: { list: ["<compatible-model>"] } }],
          categories: ["accessories"],
        },
      ] as any[]).map(({ categories, ...field }) =>
        defineField({
          ...field,
          hidden: ({ document }) => {
            if (categories.includes("*") || categories.includes("all-products")) {
              return false;
            }
            const keys = (document as any)?.catalogueLocationKeys ?? [];
            return !keys.some((k: string) =>
              categories.some((c: string) => k === c || k.startsWith(c + "/"))
            );
          },
        })
      ),
    }),
    defineField({
      name: "sortAttributes",
      title: "Sort Attributes",
      type: "object",
      description:
        "Machine-readable attributes used by the catalogue sort control. Contains featuredPriority and popularity ONLY.",
      fields: ([
        {
          name: "featuredPriority",
          title: "Featured Priority",
          type: "number",
          description:
            'Higher values appear earlier in the default "Featured" listing. Leave unset to use the default (treated as 0).',
        },
        {
          name: "popularity",
          title: "Popularity",
          type: "number",
          description:
            "Computed sales rank. Leave unset until the standalone popularity issue populates it.",
        },
      ] as any[]).map((field) => defineField(field)),
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
