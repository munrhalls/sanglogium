// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-audeze.md
// (product 1) for the full per-field table and citation trails this was
// transcribed from.

export default {
  productId: "moXlkADK7m1DHgGwWtWl8T",
  brand: "Audeze",
  name: "Maxwell Wireless Headphones",
  beadsIssue: "sang-logium-1xs.9.7",

  filterAttributes: {
    awards: ['PC Gamer — "Editor\'s Pick Award"', 'GamesRadar — "Editor\'s Choice Award"'],
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "wireless", // BT-first; USB-C/3.5mm are aux/fallback paths, not a hybrid mode
    portable: true,
    soundSignature: "Warm", // RTINGS measured review: "warm sound profile"
    // impedanceOhms: NULL — not on the product page spec table, and the Maxwell
    //   user guide is a multilingual quick-start with no spec table at all.
    // sensitivityDbMw: NULL — same exhaustion.
    freqResponseHz: { min: 10, max: 50000 },
    microphone: true,
    cableTermination: ["3.5mm"], // analog AUX; USB-C is the digital/charging port, not a listening termination
    detachableCable: true, // detachable boom mic + removable AUX cable
    // cableLengthM: NULL — accessory list names the cables with no lengths.
    foldable: false, // no hinge anywhere in the guide's function map — boolean feature-absence rule
    // ipxRating: NULL — no IP claim anywhere; a spec a manufacturer may omit, so not "none"
    bluetoothCodecs: ["SBC", "AAC", "LDAC", "LC3"],
    anc: "none", // RTINGS: "While they lack noise cancelling"; AI NR is on the mic path only
    batteryLifeHours: { ancOff: 80, ancOn: null }, // "Over 80 hrs" is the only condition a non-ANC set can be in
    driverType: ["planar-magnetic"],
  },

  sourcing: [
    {
      field: "awards",
      url: "https://www.audeze.com/products/maxwell",
      quote:
        '"The perfect union of audiophile drivers and wireless gaming headset" — PC Gamer, Editor\'s Pick Award / "The next brilliant step for a legendary line of audiophile gaming headsets" — GamesRadar, Editor\'s Choice Award',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.audeze.com/products/maxwell",
      quote: "Style Over-ear (circumaural), closed-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://www.audeze.com/products/maxwell",
      quote: "Style Over-ear (circumaural), closed-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.audeze.com/products/maxwell",
      quote: "Style Over-ear (circumaural), closed-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.audeze.com/products/maxwell",
      quote:
        "Wireless Ultra-low-latency Bluetooth: 5.3 Supports: Multipoint, LE Audio, LC3, LC3plus, LDAC, AAC, SBC / Wired - Digital USB-C with dual-audio endpoints and game-chat mix / Wired - Analog 3.5mm TRRS active",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.audeze.com/products/maxwell",
      quote:
        "Battery type Lithium-polymer, 1800mAh (full-size wireless gaming headset with detachable boom mic and a travel-oriented accessory set: USB Dongle / USB-C to C / AUX cable / USB-A to C adapter)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://www.rtings.com/headphones/reviews/audeze/maxwell-wireless",
      quote:
        "Their frequency response doesn't fluctuate much from their warm sound profile either, with most notable deviations resulting from mismatches between the L/R drivers.",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://www.audeze.com/products/maxwell",
      quote: "Frequency response 10Hz - 50kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://www.audeze.com/products/maxwell",
      quote:
        "Microphones Boom Microphone Detachable, Hypercardioid Beamforming Physical and AI noise reduction, Internal mic for chat",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://www.audeze.com/products/maxwell",
      quote: 'Wired - Analog 3.5mm TRRS active / AUX Input 3.5mm analog',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://www.audeze.com/products/maxwell",
      quote:
        'Boom Microphone Detachable, Hypercardioid Beamforming / "Boom Mic Port — Remove to use internal mics"',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://www.audeze.com/pages/maxwell-user-guide",
      quote:
        "(no folding/collapsing hinge described or pictured anywhere in the user guide's function guide or head-strap section — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://www.audeze.com/products/maxwell",
      quote: "Supports: Multipoint, LE Audio, LC3, LC3plus, LDAC, AAC, SBC",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.rtings.com/headphones/reviews/audeze/maxwell-wireless",
      quote:
        "While they lack noise cancelling, they can block out some mid-range noise, like ambient chatter, and a lot of high-pitched noise, like the hum of A/C fans.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.audeze.com/products/maxwell",
      quote:
        "Battery life Over 80 hrs wireless playback @ 80dBA (single undifferentiated figure recorded in ancOff, since the product has no ANC at all)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.audeze.com/products/maxwell",
      quote: "Transducer type Planar Magnetic / Diaphragm type Ultra-Thin Uniforce™",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
  ],
};
