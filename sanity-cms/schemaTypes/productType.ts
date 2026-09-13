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
          name: "awards",
          title: "Awards / Recognition",
          type: "array",
          of: [{ type: "string" }],
          categories: ["headphones"],
        },
        {
          name: "productCategory",
          title: "Product category / type",
          type: "array",
          of: [{ type: "string" }],
          description:
            "Shopper-facing sub-type within the headphones slice. Distinct from the catalogue-routing filterAttributes.category.",
          categories: ["headphones"],
        },
        {
          name: "wearingStyle",
          title: "Wearing style",
          type: "array",
          of: [{ type: "string", options: { list: ["over-ear", "on-ear", "in-ear"] } }],
          categories: ["headphones"],
        },
        {
          name: "acousticDesign",
          title: "Acoustic design",
          type: "array",
          of: [{ type: "string", options: { list: ["open-back", "closed-back", "semi-open"] } }],
          description: "Renamed from backDesign 2026-09-13; see acousticDesignMigration note.",
          categories: ["headphones"],
        },
        {
          name: "fitType",
          title: "Fit type (IEM)",
          type: "string",
          options: { list: ["universal", "custom"] },
          description: "Null/unset when the product is not an IEM.",
          categories: ["headphones"],
        },
        {
          name: "connectivity",
          title: "Connectivity",
          type: "string",
          options: { list: ["wired", "wireless", "true-wireless", "hybrid"] },
          categories: ["headphones"],
        },
        {
          name: "portable",
          title: "Portable / desktop",
          type: "boolean",
          categories: ["headphones"],
        },
        {
          name: "soundSignature",
          title: "Sound signature / tonal preference",
          type: "string",
          options: {
            list: [
              "Neutral",
              "Warm",
              "Bright/Analytical",
              "Dark",
              "V-Shaped",
              "Basshead",
              "Mid-Forward",
              "Harman-target-like",
            ],
          },
          categories: ["headphones"],
        },
        {
          name: "impedanceOhms",
          title: "Impedance (Ω)",
          type: "number",
          categories: ["headphones"],
        },
        {
          name: "sensitivityDbMw",
          title: "Sensitivity (dB)",
          type: "number",
          description: "Recorded on whatever reference basis the manufacturer publishes (dB/mW or dB/1Vrms) — basis is captured in the paired sourcing quote, not a separate field.",
          categories: ["headphones"],
        },
        {
          name: "freqResponseHz",
          title: "Frequency response range (Hz)",
          type: "object",
          fields: [
            { name: "min", title: "Min Hz", type: "number" },
            { name: "max", title: "Max Hz", type: "number" },
          ],
          categories: ["headphones"],
        },
        {
          name: "requiresAmplifier",
          title: "Requires amplifier",
          type: "boolean",
          description: "Derived from impedanceOhms + sensitivityDbMw at data-write time.",
          categories: ["headphones"],
        },
        {
          name: "microphone",
          title: "Microphone",
          type: "boolean",
          categories: ["headphones"],
        },
        {
          name: "cableTermination",
          title: "Cable / termination connector",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "3.5mm",
                  "2.5mm-balanced",
                  "4.4mm-balanced",
                  "4-pin-xlr",
                  "6.35mm",
                  "usb-c",
                  "mmcx",
                  "2-pin",
                  "fixed-cable",
                ],
              },
            },
          ],
          description: "Renamed from connector 2026-09-13; vocabulary widened (kept usb-c/mmcx/2-pin/fixed-cable from the old list, added 2.5mm-balanced + 6.35mm per schema-headphones.md) rather than narrowed, to avoid silently dropping any value the old field already allowed.",
          categories: ["headphones"],
        },
        {
          name: "detachableCable",
          title: "Detachable / upgradeable cable",
          type: "boolean",
          categories: ["headphones"],
        },
        {
          name: "cableLengthM",
          title: "Cable length (m)",
          type: "number",
          description: "Null when not applicable (e.g. true-wireless).",
          categories: ["headphones"],
        },
        {
          name: "foldable",
          title: "Foldable",
          type: "boolean",
          categories: ["headphones"],
        },
        {
          name: "ipxRating",
          title: "Water / sweat resistance (IPX)",
          type: "string",
          options: { list: ["none", "IPX2", "IPX4", "IPX5", "IPX7", "IPX8"] },
          categories: ["headphones"],
        },
        {
          name: "bluetoothCodecs",
          title: "Bluetooth codecs",
          type: "array",
          of: [
            {
              type: "string",
              options: { list: ["SBC", "AAC", "aptX", "aptX Adaptive", "aptX LL", "LDAC", "LC3"] },
            },
          ],
          description: "Meaningful only when connectivity !== 'wired'.",
          categories: ["headphones"],
        },
        {
          name: "anc",
          title: "Active noise cancelling (ANC)",
          type: "string",
          options: { list: ["anc", "passive", "none"] },
          description: "Replaces the old boolean noiseCancelling 2026-09-13; see ancMigration note.",
          categories: ["headphones"],
        },
        {
          name: "batteryLifeHours",
          title: "Battery life (hours)",
          type: "object",
          fields: [
            { name: "ancOff", title: "ANC off", type: "number" },
            { name: "ancOn", title: "ANC on", type: "number" },
          ],
          description: "Both null for a wired-only product.",
          categories: ["headphones"],
        },
        {
          name: "driverType",
          title: "Driver type",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "dynamic",
                  "planar-magnetic",
                  "electrostatic",
                  "balanced-armature",
                  "hybrid",
                  "amt",
                  "bone-conduction",
                  "electret",
                ],
              },
            },
          ],
          categories: ["headphones"],
        },
        {
          name: "driverConfigBucket",
          title: "Driver configuration (bucket)",
          type: "string",
          options: {
            list: ["single-dynamic", "single-ba", "multi-ba", "hybrid-config", "planar", "other"],
          },
          categories: ["headphones"],
        },
        {
          name: "driverConfigDetail",
          title: "Driver configuration (detail)",
          type: "string",
          description: "Display-only, e.g. \"1DD+4BA\". Derived from the same source as driverConfigBucket — no separate citation.",
          categories: ["headphones"],
        },
        {
          name: "sourcing",
          title: "Field sourcing / citations",
          type: "array",
          description:
            "One entry per H/M/E-tier filterAttributes field actually populated. Modeled as an array (Sanity schemas can't express a dynamic-key Record type) rather than schema-headphones.md's literal Record<FieldName,...> shape — same information, array-of-entries instead of a map.",
          of: [
            defineArrayMember({
              name: "citation",
              type: "object",
              fields: [
                { name: "field", title: "Field name", type: "string" },
                { name: "url", title: "Source URL", type: "url" },
                { name: "quote", title: "Exact quoted phrase", type: "text" },
                {
                  name: "tier",
                  title: "Tier",
                  type: "string",
                  options: { list: ["hard-spec", "marketing-fact", "editorial"] },
                },
                { name: "sourcedAt", title: "Sourced at", type: "date" },
              ],
            }),
          ],
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
