// Sourced 2026-09-13 — see docs/filters-sort/mark-levinson-headphones-sourced.md
// for the full per-field table this was transcribed from.
//
// Manufacturer note: marklevinson.com has retired the live № 5909 PDP (404 on
// /products/headphones/NO5909-.html). Two Tier-1 manufacturer documents were
// therefore read directly: the official Owner's Manual PDF and the official
// Spec Sheet PDF, plus the manufacturer PDP as archived by the Internet
// Archive. The archived spec table and the PDF spec sheet agree on every shared
// field; the PDF additionally splits passive/active frequency response, and the
// wider (passive) figure is recorded — see the sourced doc's conflict note.

// Tier-1 manufacturer sources, read directly this pass.
const ML_PDP =
  "https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current";
const ML_MANUAL =
  "https://cdn.shopify.com/s/files/1/1791/0383/files/ML_No5909_Owners_Manual_Rev1_220202.pdf?v=1652392823";
const ML_SPEC =
  "https://cdn.shopify.com/s/files/1/1791/0383/files/SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf?v=1652392823";
// Audited retailer (should-be-headphones.md list) — used only where the
// manufacturer sources don't state the fact (acousticDesign). Page carries a
// structured spec block: "Cup style: Closed-Back / Wearing style: Over-ear /
// Connectivity: Wireless".
const HP_COM =
  "https://headphones.com/products/mark-levinson-5909-active-noise-cancellation-headphones";



export default {
  productId: "k27n1AQuIbSr5iozG2iyZJ",
  brand: "Mark Levinson",
  name: "Mark Levinson № 5909 Active Noise Cancellation Headphones",
  beadsIssue: "sang-logium-1xs.9.17",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "hybrid", // BT 5.1 wireless + wired passive via USB-C-to-3.5mm cable
    portable: true,
    driverType: ["dynamic"],
    impedanceOhms: 32,
    sensitivityDbMw: 97, // "97dB SPL @1kHz/1mW"
    freqResponseHz: { min: 10, max: 40000 }, // passive; active mode is 20Hz-20kHz
    cableTermination: ["3.5mm", "usb-c"],
    detachableCable: true,
    cableLengthM: 4, // two cables supplied: 4m and 1.25m
    microphone: true,
    foldable: false, // no hinge-collapse claim on any manufacturer source
    ipxRating: "none", // no IP rating stated on any manufacturer source
    bluetoothCodecs: ["SBC", "AAC", "aptX Adaptive", "LDAC"],
    anc: "anc",
    batteryLifeHours: { ancOff: 34, ancOn: 30 },
  },

  sourcing: [
    {
      field: "productCategory",
      url: ML_PDP,
      quote: "№ 5909 | HIGH-RESOLUTION WIRELESS HEADPHONES WITH ACTIVE NOISE CANCELLATION",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: ML_PDP,
      quote: "Premium leather headband and replaceable leather ear cushions",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: HP_COM,
      quote: "Cup style: Closed-Back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: ML_PDP,
      quote:
        "Bluetooth 5.1 with LDAC, AAC and aptX™ Adaptive technologies / 1 x 1.25 m USB-C to 3.5 mm audio cable",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: ML_PDP,
      quote:
        "Designed For Travel — A hard-shell carrying case discretely stores a complete assortment of cables and accessories",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: ML_PDP,
      quote: "Expertly tuned 40 mm Beryllium coated drivers acoustically optimized to the HARMAN Curve",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: ML_SPEC,
      quote: "Impedance: 32 ohm",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: ML_SPEC,
      quote: "Sensitivity: 97dB SPL @1kHz/1mW",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: ML_SPEC,
      quote: "Frequency response (Passive): 10Hz – 40kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: ML_PDP,
      quote:
        "Cables (audio): 4 m USB-C to 3.5 mm audio cable / 1.25 m USB-C to 3.5 mm audio cable / Adapters: 3.5 mm to 6.3 mm audio adaptor",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: ML_MANUAL,
      quote:
        "Plug the USB-C connection end into the USB-C input on the Right ear cup. [Choose] the appropriate length (1.25m or 4m) proprietary audio cable",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: ML_PDP,
      quote: "Cables (audio): 4 m USB-C to 3.5 mm audio cable / 1.25 m USB-C to 3.5 mm audio cable",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: ML_PDP,
      quote: "Four-microphone voice array with Smart Wind Adaption",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: ML_MANUAL,
      quote:
        "(no folding/hinge/collapse claim across the manufacturer PDP, Owner's Manual and Spec Sheet; boolean feature-absence rule applied — the manual's only adjustment language is 'Adjust to find optimal fit' and 'Rotates for comfort around neck')",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: ML_SPEC,
      quote:
        "(no IPX/water-resistance rating anywhere in the Spec Sheet's full specification list or the PDP feature list)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: ML_MANUAL,
      quote: "connectivity via Bluetooth 5.1 with LDAC, AAC, and aptX™ Adaptive",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: ML_PDP,
      quote: "Adaptive Active Noise Cancellation (ANC) with three modes",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: ML_SPEC,
      quote: "Music playtime with BT on: 34 hrs / Music playtime with BT & ANC on: 30 hrs",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
