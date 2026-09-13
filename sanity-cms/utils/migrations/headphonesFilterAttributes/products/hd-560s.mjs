// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md
// for the full per-field table this was transcribed from.

export default {
  productId: "k27n1AQuIbSr5iozFz7EE4",
  brand: "Sennheiser",
  name: "HD 560S",
  beadsIssue: "sang-logium-1xs.9.2.1",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    connectivity: "wired",
    driverType: ["dynamic"],
    impedanceOhms: 120,
    sensitivityDbMw: 110,
    freqResponseHz: { min: 6, max: 38000 },
    cableTermination: ["3.5mm", "6.35mm"],
    detachableCable: true,
    cableLengthM: 1.8, // manufacturer web page (current); 2020 press release's "3-meter" figure superseded per recency rule
    microphone: false, // no manufacturer mention across page/press-release/headphones.com — boolean feature-absence rule
    foldable: false, // same rule
    soundSignature: "Neutral", // Crinacle Tone Grade A+, "simply 'neutral'" / "bright-neutral"
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "Wearing style: Over-Ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "The 120 ohm transducer is all-new...",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "Sound pressure level (SPL): 110 dB (1kHz, 1 Vrms)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "Frequency response: 6 Hz - 38,000 Hz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "Transducer principle: dynamic, open",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "Wearing style: Over-Ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "Transducer principle: dynamic, open",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "3.5 / 6.3 mm straight",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "The detachable 1,8 meter cable provides the perfect amount of freedom...",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "The detachable 1,8 meter cable provides the perfect amount of freedom...",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "(no mention across product page, press release, or headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://us.sennheiser-hearing.com/products/hd-560s",
      quote: "(no mention across product page, press release, or headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/2020/11/06/sennheiser-hd560s-review-the-evolved-500/",
      quote: "simply 'neutral' ... bright-neutral ... Tone Grade A+",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
