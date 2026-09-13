// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md §4
// for the full per-field table this was transcribed from.
//
// driverType is the notable one: the manufacturer page lists only
// "Transducer size: 38 mm" and never states a transducer principle for this
// model, so per the widened hard-spec tier order (source 4) the value comes
// from an independent measurement lab that publishes its own test table —
// headphonecheck.com's "Transducer principle: dynamic". Everything else comes
// straight off the manufacturer page (verified identically on both the US and
// global pages).
//
// microphone is TRUE here (unlike every other Sennheiser in scope): the HD 569
// ships a 1-button remote with an integrated mic and an omni-directional
// pick-up pattern in the spec table.

export default {
  productId: "n10eAegrGspodtsQvneN6x",
  brand: "Sennheiser",
  name: "HD 569",
  beadsIssue: "sang-logium-1xs.9.2.4",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"], // "Ear coupling: Over-Ear"
    acousticDesign: ["closed-back"], // "Acoustic principle: closed"
    connectivity: "wired",
    portable: false, // 300 g closed-back home/commute headset; no folding design stated
    driverType: ["dynamic"],
    impedanceOhms: 23, // "Impedance: 23 Ω"
    sensitivityDbMw: 115, // "Sound pressure level (SPL): 115 dB (1kHz, 1Vrms)"
    freqResponseHz: { min: 10, max: 28000 }, // "10 to 28,000 Hz"
    cableTermination: ["3.5mm", "6.35mm"], // "Adapter: 1:6.3mm 2:3.5mm detachable"
    detachableCable: true, // "comes with two detachable cables"
    cableLengthM: 1.2, // short cable; a 3 m cable is also supplied (see doc note)
    microphone: true, // "1-button remote plus microphone"; "Omni-directional"
    foldable: false, // no folding claim — boolean feature-absence rule
    // soundSignature intentionally omitted — no Tier 3 measured entry exists.
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "Ear coupling: Over-Ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "Impedance: 23 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "Sound pressure level (SPL): 115 dB (1kHz, 1Vrms)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "Frequency response (speaker): 10 to 28,000 Hz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.headphonecheck.com/test/sennheiser-hd-569/",
      quote: "Transducer principle dynamic",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "Cable length: 1: 3m 2: 1.2m",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "Ear coupling: Over-Ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "Acoustic principle: closed",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "two detachable analogue cables supplied; no Bluetooth radio stated",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "Adapter: 1:6.3mm 2:3.5mm detachable",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "comes with two detachable cables: a 10′ cable with 6.3-mm straight plug for home use, and a 4′ cable with a 3.5-mm straight plug and 1-button remote plus microphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "300 g closed-back over-ear headset; no folding design or transport claim stated",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "1-button remote plus microphone that lets you manage calls / Microphone pick-up pattern: Omni-directional",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://sennheiser-hearing.com/p/hd-569/",
      quote: "(no folding claim on the manufacturer page or headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
