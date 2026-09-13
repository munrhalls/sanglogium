// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md §8
// for the full per-field table this was transcribed from.
//
// SOURCE NOTE: unlike the Accentum, this model's US product page does NOT
// render a technical spec table (only marketing copy), so the manufacturer's
// own product description + structured Shopify product metadata supplied the
// values here. No speaker sensitivity / frequency range / battery-hour figure
// is published for this SKU on any manufacturer surface, so those stay null
// rather than being inferred from a sibling model.
//
// DESIGN CORRECTION: the manufacturer's own description states a
// "Semi-open design for greater comfort – Acoustic relief channel allows
// airflow". That maps to the schema's "semi-open" acousticDesign, NOT
// "closed-back" — a genuine correction against the initial assumption.
//
// ipxRating: manufacturer states "IP55". The schema's ipxRating list is
// ["none","IPX2","IPX4","IPX5","IPX7","IPX8"], which has no IP55 member and
// no exact match (IP55 is dust-protected + water-jet resistant; IPX5 is
// water-jet only, without the dust rating). Writing "IPX5" would silently
// understate the dust protection, so the field is left null and the exact
// manufacturer string is recorded in `sourcing` for a later schema decision.

export default {
  productId: "ZuUKzmkqDyQwdcwhxwQHiY",
  brand: "Sennheiser",
  name: "Momentum Sport True Wireless",
  beadsIssue: "sang-logium-1xs.9.2.8",

  filterAttributes: {
    productCategory: ["true-wireless"],
    wearingStyle: ["in-ear"], // "wearing-style--in-ear" manufacturer metadata
    acousticDesign: ["semi-open"], // "Semi-open design ... Acoustic relief channel allows airflow"
    fitType: "universal", // "Interchangeable ear fins and ear tips" in sizes N/S/M/L
    connectivity: "true-wireless", // "wearing-style--true-wireless"; no wired audio path
    portable: true, // fitness TWS with charging case
    driverType: ["dynamic"], // manufacturer metadata + Sennheiser's TrueResponse dynamic driver class
    detachableCable: false, // no cable supplied or supported
    microphone: true, // "shielded mic system" listed in the manufacturer description
    foldable: false, // no folding hinge exists on earbuds
    anc: "anc", // "Adaptive ANC" (manufacturer feature bullet)
    // impedanceOhms / sensitivityDbMw / freqResponseHz / cableTermination /
    // cableLengthM / batteryLifeHours / ipxRating intentionally omitted —
    // not published by the manufacturer for this SKU (see header notes).
    // soundSignature intentionally omitted — no Tier 3 measured entry exists.
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "wearing-style--true-wireless (manufacturer product metadata)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "wearing-style--in-ear (manufacturer product metadata)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "Semi-open design for greater comfort – Acoustic relief channel allows airflow to improve wearing comfort, reduce body-borne noise and improve natural awareness",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "fitType",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "Secure, multi-sports fit - Interchangeable ear fins and ear tips allow for a secure custom fit with lasting comfort over long-wearing sessions",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "Sport´s ecosystem connectivity: Compatible via Bluetooth with leading sports watches, apps, and fitness equipment",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "MOMENTUM Sport earbuds / Charging case / USB-C charging cable / Finger lanyard for easy & secure carrying on the go",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "(manufacturer metadata: true-wireless in-ear sports earbuds, Sennheiser TrueResponse dynamic driver class)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "Transparency Mode – Hear your surroundings with a sports-optimized shielded mic system to cut wind noise when on the move",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "(no audio cable supplied or supported; only a USB-C charging cable is included)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "(no folding hinge exists on earbuds; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "Adaptive ANC – Stay in the zone without distractions even in noisy gyms or busy outdoor spaces",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://us.sennheiser-hearing.com/products/momentum-sport",
      quote: "Exceptional IP55 resistance rating combines with a unique acoustic design to shut out moisture without compromising sound quality",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
