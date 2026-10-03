import { defineArrayMember } from "sanity";

export const headphonesFields: any[] = [
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
          description: "Renamed from backDesign 2026-09-13.",
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
          description: "Renamed from connector 2026-09-13; only 2.5mm is renamed to 2.5mm-balanced, every other value carried over 1:1.",
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
          description: "Replaces the old boolean noiseCancelling 2026-09-13.",
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
              "headphone-amplifier",
              "digital-audio-player",
              "dac",
              "network-streamer",
              "preamplifier",
              "integrated-amplifier",
              "power-amplifier",
              "cd-player-transport",
            ],
          },
          description:
            "Headphone amplifiers and digital audio players are in scope for this slice (restored 2026-09-29 alongside the data backfill). Gates every domain-specific field below via each field's `domain`.",
          categories: ["audio-electronics"],
        },
];
