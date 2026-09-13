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
          categories: ["headphones", "accessories", "audio-electronics"],
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
          description: "Renamed from backDesign 2026-09-13; see docs/filters-sort/headphones-filterattributes-migration.md.",
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
          description: "Renamed from connector 2026-09-13; only 2.5mm is renamed to 2.5mm-balanced, every other value carried over 1:1 (see docs/filters-sort/headphones-filterattributes-migration.md).",
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
              options: {
                list: ["SBC", "AAC", "aptX", "aptX HD", "aptX Adaptive", "aptX LL", "LDAC", "LC3"],
              },
            },
          ],
          description: "Meaningful only when connectivity !== 'wired'.",
          categories: ["headphones", "audio-electronics"],
        },
        {
          name: "anc",
          title: "Active noise cancelling (ANC)",
          type: "string",
          options: { list: ["anc", "passive", "none"] },
          description: "Replaces the old boolean noiseCancelling 2026-09-13; see docs/filters-sort/headphones-filterattributes-migration.md.",
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
          categories: ["headphones", "accessories", "audio-electronics"],
        },
        {
          name: "deviceType",
          title: "Product category",
          type: "string",
          options: {
            list: [
              "integrated-amplifier",
              "power-amplifier",
              "preamplifier",
              "av-surround-receiver",
              "stereo-receiver",
              "dac",
              "network-streamer",
              "cd-player-transport",
              "turntable",
            ],
          },
          description:
            "Renamed vocabulary 2026-09-13 from the old headphone-amp/dac/dac-amp-combo/dongle-dac/dap/network-streamer enum (that vocab mixed in headphone-amp/DAP concepts out of this slice's scope per should-be-audio-electronics.md); see docs/filters-sort/audio-electronics-filterattributes-migration.md. Gates every domain-specific field below via each field's `domain`.",
          categories: ["audio-electronics"],
        },
        {
          name: "deviceConnectivity",
          title: "Connectivity",
          type: "string",
          options: { list: ["wired", "bluetooth", "wifi-networked", "wired-wireless"] },
          description:
            "Gates the Connectivity & Wireless field group. Distinct from headphones' own `connectivity` field (different vocab, different slice).",
          categories: ["audio-electronics"],
        },
        {
          name: "formFactor",
          title: "Form factor",
          type: "string",
          options: { list: ["desktop", "portable", "dongle"] },
          description: "Legacy field, no should-be-audio-electronics.md equivalent — kept as-is, not migrated.",
          categories: ["audio-electronics"],
        },
        {
          name: "amplification",
          title: "Amplifier topology",
          type: "string",
          options: { list: ["solid-state", "tube", "hybrid", "class-d"] },
          categories: ["audio-electronics"],
          domain: [
            "integrated-amplifier",
            "power-amplifier",
            "preamplifier",
            "av-surround-receiver",
            "stereo-receiver",
          ],
          domainField: "deviceType",
        },
        {
          name: "dacIncluded",
          title: "DAC included",
          type: "boolean",
          description: "Legacy field, no should-be-audio-electronics.md equivalent — kept as-is, not migrated.",
          categories: ["audio-electronics"],
        },
        {
          name: "balancedOutput",
          title: "Balanced output",
          type: "boolean",
          description: "Legacy field, no should-be-audio-electronics.md equivalent — kept as-is, not migrated.",
          categories: ["audio-electronics"],
        },
        {
          name: "powerOutputPerChannelW",
          title: "Power output per channel (W RMS)",
          type: "number",
          description: "Critical filter.",
          categories: ["audio-electronics"],
          domain: [
            "integrated-amplifier",
            "power-amplifier",
            "preamplifier",
            "av-surround-receiver",
            "stereo-receiver",
          ],
          domainField: "deviceType",
        },
        {
          name: "channelCount",
          title: "Channel count",
          type: "array",
          of: [{ type: "string", options: { list: ["2.0", "2.1", "5.1", "7.1", "7.1.4"] } }],
          categories: ["audio-electronics"],
          domain: [
            "integrated-amplifier",
            "power-amplifier",
            "preamplifier",
            "av-surround-receiver",
            "stereo-receiver",
          ],
          domainField: "deviceType",
        },
        {
          name: "phonoStageBuiltIn",
          title: "Built-in phono stage",
          type: "string",
          options: { list: ["none", "mm", "mc"] },
          description: "Critical filter. Yes/No + MM/MC collapsed into one field, not two.",
          categories: ["audio-electronics"],
          domain: [
            "integrated-amplifier",
            "power-amplifier",
            "preamplifier",
            "av-surround-receiver",
            "stereo-receiver",
          ],
          domainField: "deviceType",
        },
        {
          name: "trigger12v",
          title: "12V trigger / custom-install ready",
          type: "boolean",
          categories: ["audio-electronics"],
          domain: [
            "integrated-amplifier",
            "power-amplifier",
            "preamplifier",
            "av-surround-receiver",
            "stereo-receiver",
          ],
          domainField: "deviceType",
        },
        {
          name: "remoteControlIncluded",
          title: "Remote control included",
          type: "boolean",
          categories: ["audio-electronics"],
          domain: [
            "integrated-amplifier",
            "power-amplifier",
            "preamplifier",
            "av-surround-receiver",
            "stereo-receiver",
          ],
          domainField: "deviceType",
        },
        {
          name: "inputs",
          title: "Input types",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "usb",
                  "optical",
                  "coaxial",
                  "rca",
                  "bluetooth",
                  "xlr-balanced",
                  "phono-mm-mc",
                  "hdmi-earc",
                  "ethernet-lan",
                  "i2s-iis",
                  "aes-ebu",
                ],
              },
            },
          ],
          description:
            "Merged should-be-audio-electronics.md items 15 (Input Types) and 26 (Digital Inputs) into one field, domain-gated across both the Amplification and Digital Source device types — they shared the same gate field (deviceType) and largely overlapping values, so two fields would have meant the same fact recorded twice.",
          categories: ["audio-electronics"],
          domain: [
            "integrated-amplifier",
            "power-amplifier",
            "preamplifier",
            "av-surround-receiver",
            "stereo-receiver",
            "dac",
            "network-streamer",
            "cd-player-transport",
          ],
          domainField: "deviceType",
        },
        {
          name: "outputs",
          title: "Output types",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: ["speaker-terminals", "pre-out-rca", "pre-out-xlr", "headphone-jack", "subwoofer-out"],
              },
            },
          ],
          description:
            "Redesigned 2026-09-13 from a headphone-output-jack-shaped vocab (6.35mm/4.4mm/4-pin-xlr/rca-line-out) to should-be-audio-electronics.md item 16's coarser taxonomy; see docs/filters-sort/audio-electronics-filterattributes-migration.md.",
          categories: ["audio-electronics"],
          domain: [
            "integrated-amplifier",
            "power-amplifier",
            "preamplifier",
            "av-surround-receiver",
            "stereo-receiver",
          ],
          domainField: "deviceType",
        },
        {
          name: "maxSampleRateBitDepth",
          title: "Max sample rate / bit depth (PCM)",
          type: "string",
          description: "Free text, e.g. \"32-bit/768kHz\" — no fixed enum, values vary too much by spec sheet.",
          categories: ["audio-electronics"],
          domain: ["dac", "network-streamer", "cd-player-transport"],
          domainField: "deviceType",
        },
        {
          name: "dsdSupport",
          title: "DSD support",
          type: "string",
          options: { list: ["none", "dsd64", "dsd128", "dsd256-plus"] },
          categories: ["audio-electronics"],
          domain: ["dac", "network-streamer", "cd-player-transport"],
          domainField: "deviceType",
        },
        {
          name: "hiResCertification",
          title: "MQA / Hi-Res Audio certification",
          type: "array",
          of: [{ type: "string", options: { list: ["mqa", "hi-res-audio"] } }],
          categories: ["audio-electronics"],
          domain: ["dac", "network-streamer", "cd-player-transport"],
          domainField: "deviceType",
        },
        {
          name: "dacChipsetFamily",
          title: "DAC chipset family",
          type: "array",
          of: [
            { type: "string", options: { list: ["ess-sabre", "akm", "cirrus-logic", "r2r-ladder"] } },
          ],
          categories: ["audio-electronics"],
          domain: ["dac", "network-streamer", "cd-player-transport"],
          domainField: "deviceType",
        },
        {
          name: "streamingPlatformSupport",
          title: "Streaming platform support",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: ["airplay2", "chromecast", "spotify-connect", "tidal-connect", "roon-ready", "dlna"],
              },
            },
          ],
          categories: ["audio-electronics"],
          domain: ["dac", "network-streamer", "cd-player-transport"],
          domainField: "deviceType",
        },
        {
          name: "networkConnection",
          title: "Network connection",
          type: "array",
          of: [{ type: "string", options: { list: ["wifi", "ethernet"] } }],
          categories: ["audio-electronics"],
          domain: ["dac", "network-streamer", "cd-player-transport"],
          domainField: "deviceType",
        },
        {
          name: "driveType",
          title: "Drive type",
          type: "array",
          of: [{ type: "string", options: { list: ["belt-drive", "direct-drive", "idler-wheel"] } }],
          categories: ["audio-electronics"],
          domain: ["turntable"],
          domainField: "deviceType",
        },
        {
          name: "turntableOperation",
          title: "Operation",
          type: "string",
          options: { list: ["manual", "automatic", "semi-automatic"] },
          categories: ["audio-electronics"],
          domain: ["turntable"],
          domainField: "deviceType",
        },
        {
          name: "speedsSupported",
          title: "Speeds supported",
          type: "array",
          of: [{ type: "string", options: { list: ["33-1-3", "45", "78"] } }],
          categories: ["audio-electronics"],
          domain: ["turntable"],
          domainField: "deviceType",
        },
        {
          name: "phonoPreampBuiltIn",
          title: "Built-in phono preamp",
          type: "boolean",
          description: "Critical filter. Distinct field from amplification's `phonoStageBuiltIn` — different domain (turntables, not amps), not the same fact.",
          categories: ["audio-electronics"],
          domain: ["turntable"],
          domainField: "deviceType",
        },
        {
          name: "cartridgeIncluded",
          title: "Cartridge included",
          type: "string",
          options: { list: ["none", "included-mm", "included-mc"] },
          description: "Yes/No + MM/MC collapsed into one field, not two.",
          categories: ["audio-electronics"],
          domain: ["turntable"],
          domainField: "deviceType",
        },
        {
          name: "usbDigitalOutput",
          title: "USB / digital output (for digitizing vinyl)",
          type: "boolean",
          categories: ["audio-electronics"],
          domain: ["turntable"],
          domainField: "deviceType",
        },
        {
          name: "voiceAssistant",
          title: "Voice assistant built-in",
          type: "array",
          of: [{ type: "string", options: { list: ["alexa", "google-assistant"] } }],
          categories: ["audio-electronics"],
          domain: ["bluetooth", "wifi-networked", "wired-wireless"],
          domainField: "deviceConnectivity",
        },
        {
          name: "multiroomSupport",
          title: "Multiroom support",
          type: "boolean",
          categories: ["audio-electronics"],
          domain: ["bluetooth", "wifi-networked", "wired-wireless"],
          domainField: "deviceConnectivity",
        },
        {
          name: "finishColor",
          title: "Finish / color",
          type: "array",
          of: [{ type: "string" }],
          categories: ["audio-electronics"],
        },
        {
          name: "rackMountable19",
          title: "Rack-mountable (19\")",
          type: "boolean",
          categories: ["audio-electronics"],
        },
        {
          name: "countryOfManufacture",
          title: "Country of manufacture",
          type: "string",
          categories: ["audio-electronics"],
        },
        {
          name: "customerRating",
          title: "Customer rating (min stars)",
          type: "number",
          description: "Store-computed from review aggregate; not individually sourced.",
          categories: ["accessories", "audio-electronics"],
        },
        {
          name: "condition",
          title: "Condition / stock type",
          type: "string",
          options: { list: ["new", "open-box", "refurbished"] },
          categories: ["accessories", "audio-electronics"],
        },
        {
          name: "dealsDiscount",
          title: "Deals / discount",
          type: "string",
          options: { list: ["none", "sale", "clearance"] },
          description: "Store-operational; not individually sourced.",
          categories: ["accessories", "audio-electronics"],
        },
        {
          name: "newArrival",
          title: "New arrival",
          type: "boolean",
          description: "Store-operational; not individually sourced.",
          categories: ["accessories", "audio-electronics"],
        },
        {
          name: "accessoryType",
          title: "Accessory category",
          type: "string",
          options: {
            list: [
              "cables-interconnects",
              "stands-isolation",
              "racks-furniture",
              "power",
              "cases-storage-transport",
              "cleaning-maintenance",
              "replacement-parts",
              "adapters-converters",
              "room-acoustic-treatment",
            ],
          },
          description:
            "Renamed vocabulary 2026-09-13 from the old cable/adapter/interconnect/eartip/earpad/stand/case/care enum; see docs/filters-sort/accessories-filterattributes-migration.md. Gates every domain-specific field below via each field's `domain`.",
          categories: ["accessories"],
        },
        {
          name: "compatibleProductType",
          title: "Compatible product type",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: ["headphone", "speaker", "turntable", "amplifier-source", "universal-any"],
              },
            },
          ],
          categories: ["accessories"],
        },
        {
          name: "cableFunction",
          title: "Cable function",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "interconnect-rca-xlr",
                  "speaker-cable",
                  "digital-usb-coaxial-optical-aes-ebu-ethernet",
                  "power-mains",
                  "phono",
                ],
              },
            },
          ],
          categories: ["accessories"],
          domain: ["cables-interconnects"],
        },
        {
          name: "connectorTermination",
          title: "Termination / connector type",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "rca",
                  "xlr",
                  "banana-plug",
                  "spade",
                  "bnc",
                  "3.5mm",
                  "2.5mm",
                  "4.4mm",
                  "mini-to-rca",
                ],
              },
            },
          ],
          description: "Critical filter. Enum updated 2026-09-13 to match should-be-accessories.md item 12; see docs/filters-sort/accessories-filterattributes-migration.md.",
          categories: ["accessories"],
          domain: ["cables-interconnects"],
        },
        {
          name: "lengthM",
          title: "Length (m)",
          type: "number",
          categories: ["accessories"],
          domain: ["cables-interconnects"],
        },
        {
          name: "conductorMaterial",
          title: "Conductor material",
          type: "array",
          of: [
            {
              type: "string",
              options: { list: ["copper-ofc", "silver", "silver-plated-copper"] },
            },
          ],
          categories: ["accessories"],
          domain: ["cables-interconnects"],
        },
        {
          name: "balancedUnbalanced",
          title: "Balanced / unbalanced",
          type: "string",
          options: { list: ["balanced", "unbalanced"] },
          categories: ["accessories"],
          domain: ["cables-interconnects"],
        },
        {
          name: "furnitureType",
          title: "Furniture type",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "speaker-stand",
                  "equipment-rack-shelf",
                  "isolation-platform-feet-pucks",
                  "turntable-wall-shelf",
                  "wall-mount",
                ],
              },
            },
          ],
          categories: ["accessories"],
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "material",
          title: "Material",
          type: "array",
          of: [
            { type: "string", options: { list: ["wood", "metal", "acrylic", "composite-mdf"] } },
          ],
          categories: ["accessories"],
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "adjustableHeight",
          title: "Adjustable height",
          type: "boolean",
          categories: ["accessories"],
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "weightCapacityKg",
          title: "Weight / load capacity (kg)",
          type: "number",
          categories: ["accessories"],
          domain: ["stands-isolation", "racks-furniture"],
        },
        {
          name: "powerProductType",
          title: "Power product type",
          type: "string",
          options: {
            list: [
              "conditioner",
              "surge-protector",
              "power-distributor",
              "battery-ups-backup",
              "power-cable",
            ],
          },
          categories: ["accessories"],
          domain: ["power"],
        },
        {
          name: "outletCount",
          title: "Outlet count",
          type: "number",
          categories: ["accessories"],
          domain: ["power"],
        },
        {
          name: "powerConnectorType",
          title: "Power connector / plug type",
          type: "array",
          of: [
            { type: "string", options: { list: ["nema-5-15", "iec-c13-c15", "20-amp"] } },
          ],
          categories: ["accessories"],
          domain: ["power"],
        },
        {
          name: "cleaningProductType",
          title: "Cleaning product type",
          type: "string",
          options: {
            list: [
              "record-cleaning-fluid",
              "record-cleaning-machine",
              "stylus-brush-cleaner",
              "carbon-fiber-brush",
              "anti-static-gun",
              "demagnetizer",
              "screen-lens-cloth",
            ],
          },
          categories: ["accessories"],
          domain: ["cleaning-maintenance"],
        },
        {
          name: "formatCompatibility",
          title: "Format compatibility",
          type: "array",
          of: [
            { type: "string", options: { list: ["vinyl", "cd", "stylus-cartridge", "optical-lens"] } },
          ],
          categories: ["accessories"],
          domain: ["cleaning-maintenance"],
        },
        {
          name: "partType",
          title: "Part type",
          type: "string",
          options: {
            list: [
              "ear-pads-cushions",
              "ear-tips",
              "phono-cartridge-stylus",
              "drive-belt",
              "remote-control",
              "dust-cover",
              "fuses",
              "vacuum-tubes-valves",
            ],
          },
          categories: ["accessories"],
          domain: ["replacement-parts"],
        },
        {
          name: "compatibility",
          title: "Compatible model / brand",
          type: "array",
          of: [{ type: "string", options: { list: ["<compatible-model>"] } }],
          description: "Critical filter.",
          categories: ["accessories"],
          domain: ["replacement-parts"],
        },
        {
          name: "adapterFunction",
          title: "Adapter function",
          type: "array",
          of: [
            {
              type: "string",
              options: {
                list: [
                  "bluetooth-transmitter-receiver",
                  "headphone-impedance-attenuator-adapter",
                  "connector-adapter",
                  "standalone-phono-preamp",
                  "usb-dac-dongle",
                ],
              },
            },
          ],
          categories: ["accessories"],
          domain: ["adapters-converters"],
        },
        {
          name: "treatmentType",
          title: "Treatment type",
          type: "array",
          of: [
            { type: "string", options: { list: ["acoustic-panel", "bass-trap", "diffuser", "isolation-pad"] } },
          ],
          categories: ["accessories"],
          domain: ["room-acoustic-treatment"],
        },
        {
          name: "mounting",
          title: "Mounting",
          type: "array",
          of: [{ type: "string", options: { list: ["wall", "ceiling", "freestanding"] } }],
          categories: ["accessories"],
          domain: ["room-acoustic-treatment"],
        },
      ] as any[]).map(({ categories, domain, domainField, ...field }) =>
        defineField({
          ...field,
          hidden: ({ document }) => {
            if (categories.includes("*") || categories.includes("all-products")) {
              return false;
            }
            const keys = (document as any)?.catalogueLocationKeys ?? [];
            const inCategory = keys.some((k: string) =>
              categories.some((c: string) => k === c || k.startsWith(c + "/"))
            );
            if (!inCategory) return true;
            if (domain) {
              // domainField names which filterAttributes field this field is
              // gated by (defaults to accessoryType for backward compat —
              // accessories fields predate this parameter). Audio-electronics
              // fields gate off deviceType or deviceConnectivity instead,
              // since one product can have two independent gate axes (what
              // kind of device it is, and how it connects).
              const gateValue = (document as any)?.filterAttributes?.[domainField ?? "accessoryType"];
              return !domain.includes(gateValue);
            }
            return false;
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
