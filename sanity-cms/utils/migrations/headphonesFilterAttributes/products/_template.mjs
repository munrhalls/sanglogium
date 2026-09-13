// Copy this file to products/<product-slug>.mjs — one file per product,
// one product per beads sang-logium-1xs.9.* issue. Do not edit engine.mjs
// or runPatch.mjs; they're shared across every brand's issue unchanged.
//
// Field names/vocab must match sanity-cms/schemaTypes/productType.ts's
// filterAttributes headphones fields exactly (see docs/filters-sort/
// schema-headphones.md for the field table this schema implements).
// Only include fields you actually sourced — omit anything still null
// rather than writing `null` explicitly, unless the schema field is
// nullable-by-design and you want to explicitly clear a prior value.
//
// Conflict/null rules in effect (docs/filters-sort/sourcing-protocol-headphones.md,
// amended 2026-09-13): manufacturer-source conflicts resolve by recency, no
// flag-for-human needed; boolean "would-advertise-if-present" feature fields
// (microphone, foldable, etc.) read as false on manufacturer silence, not null.

export default {
  // Sanity _id of the product document — copy from the issue's PRODUCTS IN SCOPE list.
  productId: "REPLACE_ME",

  // For your own reference and the engine's name-mismatch sanity check —
  // not written to Sanity.
  brand: "REPLACE_ME",
  name: "REPLACE_ME",
  beadsIssue: "sang-logium-1xs.9.2.REPLACE_ME",

  // Every field here becomes a filterAttributes.<field> = <value> patch.
  filterAttributes: {
    // wearingStyle: ["over-ear"],
    // acousticDesign: ["open-back"],
    // connectivity: "wired",
    // portable: false,
    // driverType: ["dynamic"],
    // impedanceOhms: 120,
    // sensitivityDbMw: 110,
    // freqResponseHz: { min: 6, max: 38000 },
    // cableTermination: ["3.5mm", "6.35mm"],
    // detachableCable: true,
    // cableLengthM: 1.8,
    // microphone: false,
    // foldable: false,
    // soundSignature: "Neutral",
  },

  // One entry per H/M/E-tier field actually populated above. This merges
  // into filterAttributes.sourcing (replacing any prior entry for the same
  // field), it does not need every field repeated if only some changed.
  sourcing: [
    // {
    //   field: "impedanceOhms",
    //   url: "https://example.com/product-page",
    //   quote: "Impedance: 120 ohm",
    //   tier: "hard-spec", // "hard-spec" | "marketing-fact" | "editorial"
    //   sourcedAt: "2026-09-13",
    // },
  ],
};
