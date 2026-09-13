// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-hifiman.md
// (product 3) for the full per-field table and citation trails this was
// transcribed from.
//
// NOTE this product is genuinely a hybrid (Bluetooth + USB-C audio playback),
// unlike products 1-2 which are wired-only. Its impedance/sensitivity/FR are
// the *headphone* figures from the owner's guide, which cover both the BT amp
// path and USB playback.

export default {
  productId: "n10eAegrGspodtsQw136D2",
  brand: "HiFiMan",
  name: "Ananda BT",
  beadsIssue: "sang-logium-1xs.9.3",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"], // RTINGS review: "their open-back design isn't ideal for office use"
    connectivity: "hybrid", // Bluetooth 5.1 playback AND USB-C audio playback
    portable: true, // Bluetooth-first design + Travel Bag; "portable players" language
    driverType: ["planar-magnetic"],
    impedanceOhms: 25,
    sensitivityDbMw: 103,
    freqResponseHz: { min: 8, max: 55000 },
    cableTermination: ["usb-c"], // cables ship as "USB C to USB A" + "USB C to USB C", both fixed
    detachableCable: false, // included cables are fixed USB data/charge cables, not upgradeable headphone cables
    cableLengthM: null, // owner's guide states no cable length; NULL (not applicable / unfound)
    microphone: true, // CALL FEATURE: "dual-microphone cVc 8.0 noise reduction technology... when making calls"
    foldable: false, // no folding/hinge/collapse language anywhere in guide — boolean feature-absence rule
    anc: "passive", // NO ANC: guide credits ANC-like language only to the voice mic path (cVc 8.0), not to music playback
    batteryLifeHours: { ancOff: 10, ancOn: null }, // "Play Time: ~10 hours"; no ANC mode exists
    soundSignature: "Neutral", // Crinacle "Hifiman Ananda" — "One of the best tuned headphones available..." (Tone S-, Tech B)
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "Impedance: 25Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "Sensitivity: 103dB",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "Frequency Response: 8Hz-55kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "Acoustically Invisible Stealth Magnets / NEO Supernano Diaphragm (planar magnetic per manual: \"Planar headphones benefit from break-in to achieve optimum performance\")",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "Package Contents: ANANDA-BT Headphone / Ear Pads (installed) x1 pair / Headphone Travel Bag x1 / USB C to USB A cable x1 / USB C to USB C cable x1",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.rtings.com/headphones/reviews/hifiman/ananda-bt",
      quote: "These open-back headphones are designed to allow background noise to enter the ear cups to help make audio sound more immersive, but unfortunately, it also means they have poor noise isolation and leakage performance.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "ANANDA-BT not only supports Bluetooth playback but also can be directly connected to a device via a USB cable for music playback. / Bluetooth / USB Mode Easy Switching",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "ANANDA-BT is designed to transmit crystal-clear voice quality when making calls. Adopting the most advanced dual-microphone cVc 8.0 noise reduction technology, it provides crystal-clear voice capture, noise echo cancellation... (corroborated by RTINGS: \"they also have a detachable boom microphone\")",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "(derived — no active noise cancelling for music playback described anywhere in the guide; the only \"noise reduction\" language is the dual-microphone cVc 8.0 call path. Open-back design provides passive, leaky isolation only)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "Please note that if the headphone is connected to devices such as mobile phones or other portable players that don't include a power supply, it may need a charge more quickly... + Headphone Travel Bag x1 (Bluetooth-first, self-powered, bagged for transport)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "(Package Contents list only fixed USB A / USB C charge-and-play cables; no swappable headphone cable or socket system described anywhere in the guide — the connector is a fixed USB-C jack)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "(no cable length given for either the USB C to USB A or USB C to USB C cable in the guide's Package Contents or Specifications — NULL, genuinely unfound)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://hifiman.com/attachments/file/20250211/20250211033309_95943.pdf",
      quote: "(no fold/collapse/hinge/swivel language anywhere in the owner's guide; only Headband Adjustment via two adjustment blocks — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.rtings.com/headphones/reviews/hifiman/ananda-bt",
      quote: "(full-size circumaural over-ear; RTINGS classifies the ANANDA-BT under the over-ear headphone review template as the wireless version of the wired Hifiman Ananda)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://www.rtings.com/headphones/reviews/hifiman/ananda-bt",
      quote: "The HiFiMan ANANDA-BT Wireless are the Bluetooth version of the HiFiMan Ananda. (over-ear/circumaural, hybrid headband design)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "One of the best tuned headphones available, only limited by its raw resolving ability. (entry \"Hifiman Ananda\", $700, Neutral, Tone Grade S-, Technical Grade B, ★ value rating)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
