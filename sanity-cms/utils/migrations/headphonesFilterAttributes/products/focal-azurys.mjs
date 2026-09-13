// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-focal.md
// (product 6) for the full per-field table and citation trails this was
// transcribed from.
//
// microphone: true — unlike the rest of this batch, Azurys genuinely ships a
// mic on the supplied cable's inline remote, explicitly stated on the product
// page and in the manual (with a numbered figure). Recorded from that positive
// manufacturer statement, not from the boolean feature-absence rule.
//
// foldable: false — the manual's "turning the earcups to face inwards" is a
// rotation for casing, not a folding hinge.
//
// soundSignature: null — exhausted (absent from Crinacle's rankings list, no
// Crinacle individual post, no ASR/Rtings review); not inferred from Focal
// marketing copy, which the protocol forbids for this field.

export default {
  productId: "k27n1AQuIbSr5iozFz7IlS",
  brand: "Focal",
  name: "Azurys",
  beadsIssue: "sang-logium-1xs.9.5.6",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    fitType: null,
    connectivity: "wired",
    portable: true, // FLAG — inferred from supplied carry case + mobile cable with remote; page has no portable field
    microphone: true, // explicit: inline remote on the supplied cable
    cableTermination: ["3.5mm"],
    detachableCable: true,
    cableLengthM: 1.25,
    foldable: false, // FLAG — earcup rotation for casing only, no folding hinge
    ipxRating: null,
    bluetoothCodecs: null, // domain-gated, wired-only
    anc: "none", // derived: closed-back passive isolation only, no electronics
    batteryLifeHours: { ancOff: null, ancOn: null },
    driverType: ["dynamic"],
    impedanceOhms: 26,
    sensitivityDbMw: 100,
    freqResponseHz: { min: 15, max: 22000 },
    awards: null,
    driverConfigBucket: null, // domain-gated to IEM
    driverConfigDetail: null,
    soundSignature: null, // exhausted — no measurement source found
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://www.focal.com/products/azurys",
      quote: "Impedance : 26 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://dam.focal-naim.com/m/80f064a403195fa/original/Notice_Azurys_web-pdf.pdf",
      quote: "Sensitivity 100dB SPL / 1mW @ 1kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://www.focal.com/products/azurys",
      quote: "Frequency response (+/- 3dB) : 15 Hz - 22 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://dam.focal-naim.com/m/80f064a403195fa/original/Notice_Azurys_web-pdf.pdf",
      quote: "Speaker drivers 15/8\" (40mm) 'M'-shaped Aluminium/Magnesium dome",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://dam.focal-naim.com/m/80f064a403195fa/original/Notice_Azurys_web-pdf.pdf",
      quote: "Cable provided 4ft (1.25m) mini-jack cable with remote control and microphone",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.focal.com/products/azurys",
      quote: "Product type : Closed-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://dam.focal-naim.com/m/80f064a403195fa/original/Notice_Azurys_web-pdf.pdf",
      quote: "Type Circum-aural closed-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.focal.com/products/azurys",
      quote: "Product type : Closed-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.focal.com/products/azurys",
      quote: "Connector : Jack 3.5 mm (wired mini-jack only; no Bluetooth or ANC anywhere on the page or manual)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://dam.focal-naim.com/m/80f064a403195fa/original/Notice_Azurys_web-pdf.pdf",
      quote: "turning the earcups to face inwards, and storing the cable in the space provided for this purpose (fig. 4) — supplied carrying case + mobile cable; inferred FLAG",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://dam.focal-naim.com/m/80f064a403195fa/original/Notice_Azurys_web-pdf.pdf",
      quote: "The cable supplied with the Azurys headphones includes a remote control with a microphone and a button (fig. 3)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://www.focal.com/products/azurys",
      quote: "Connector : Jack 3.5 mm",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://dam.focal-naim.com/m/80f064a403195fa/original/Notice_Azurys_web-pdf.pdf",
      quote: "Connect the 1/8” (3.5mm) jack adapter to the connector located on the left-hand earcup of the headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://dam.focal-naim.com/m/80f064a403195fa/original/Notice_Azurys_web-pdf.pdf",
      quote: "(only earcup rotation for casing and cable stowage described; no folding hinge/lock — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.focal.com/products/azurys",
      quote: "(derived from already-cited acousticDesign: closed-back + connectivity: wired — passive isolation only, no ANC electronics)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "(exhausted NULL — no \"Azurys\" row in Crinacle's rankings list, no Crinacle individual review post, no ASR/Rtings measurement; never inferred from Focal marketing copy)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.focal.com/products/azurys",
      quote: "(no battery anywhere on the page or manual — wired-only passive headphone, so both ancOn and ancOff are null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
