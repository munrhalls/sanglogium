// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-focal.md
// (product 7) for the full per-field table and citation trails this was
// transcribed from.
//
// foldable: false — the manual describes only earcup rotation for transit
// ("faisant pivoter les écouteurs vers l'intérieur"), a swivel rather than the
// schema's folding hinge.
//
// soundSignature: null — exhausted (absent from Crinacle's rankings list, no
// Crinacle individual post, no ASR/Rtings review); not inferred from Focal
// marketing copy, which the protocol forbids for this field.

export default {
  productId: "Pn6oyV4Ks5AcNbecjgql0e",
  brand: "Focal",
  name: "Hadenys",
  beadsIssue: "sang-logium-1xs.9.5.7",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    fitType: null,
    connectivity: "wired",
    portable: false, // FLAG — marketed for home use; lightness framed as listening comfort, not travel
    microphone: false, // absence-based per protocol's boolean feature-absence exception
    cableTermination: ["3.5mm", "6.35mm"],
    detachableCable: true,
    cableLengthM: 1.8,
    foldable: false, // FLAG — earcup rotation only, no folding hinge
    ipxRating: null,
    bluetoothCodecs: null, // domain-gated, wired-only
    anc: "none", // derived: open-back + wired, no electronics
    batteryLifeHours: { ancOff: null, ancOn: null },
    driverType: ["dynamic"],
    impedanceOhms: 26,
    sensitivityDbMw: 100,
    freqResponseHz: { min: 25, max: 22000 },
    awards: null,
    driverConfigBucket: null, // domain-gated to IEM
    driverConfigDetail: null,
    soundSignature: null, // exhausted — no measurement source found
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://www.focal.com/products/hadenys",
      quote: "Impedance : 26 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://dam.focal-naim.com/m/29118ef5ebb678ea/original/Notice_Hadenys_Web-pdf.pdf",
      quote: "Sensitivity 100dB SPL / 1mW @ 1kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://www.focal.com/products/hadenys",
      quote: "Frequency response (+/- 3dB) : 25 Hz - 22 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.focal.com/products/hadenys",
      quote: "Loudspeakers : 15/8'' (40mm) Aluminium/ Magnesium ‘M’-shaped dome",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://dam.focal-naim.com/m/29118ef5ebb678ea/original/Notice_Hadenys_Web-pdf.pdf",
      quote: "Cable provided 6ft (1.8m) mini-jack cable, 1/4'' (6.3mm) jack adapter",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.focal.com/products/hadenys",
      quote: "Product type : Open-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://dam.focal-naim.com/m/29118ef5ebb678ea/original/Notice_Hadenys_Web-pdf.pdf",
      quote: "Type Circum-aural open-back Headphones wired",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.focal.com/products/hadenys",
      quote: "Hadenys Open-back headphones for the home",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://dam.focal-naim.com/m/29118ef5ebb678ea/original/Notice_Hadenys_Web-pdf.pdf",
      quote: "Type Circum-aural open-back Headphones wired",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.focal.com/products/hadenys",
      quote: "Open-back headphones for the home (lightness is framed as long-listening comfort, not travel; no portability language — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://www.focal.com/products/hadenys",
      quote: "Connector : Jack 3.5 mm, Jack 6.35 mm — Cables provided : • 1X 6ft (1.8m)Jack 1/8\" (3,5mm) • 1 x adapter 1/4\" (6.35mm)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://dam.focal-naim.com/m/29118ef5ebb678ea/original/Notice_Hadenys_Web-pdf.pdf",
      quote: "(cable connects to the left earcup connector and is removable for case stowage — detachable per supplied-cable design)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://dam.focal-naim.com/m/29118ef5ebb678ea/original/Notice_Hadenys_Web-pdf.pdf",
      quote: "(no microphone language anywhere on the page or manual — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://dam.focal-naim.com/m/29118ef5ebb678ea/original/Notice_Hadenys_Web-pdf.pdf",
      quote: "transport en faisant pivoter les écouteurs vers l'intérieur (earcup rotation for transit only; no folding hinge — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.focal.com/products/hadenys",
      quote: "(derived from already-cited acousticDesign: open-back + connectivity: wired — no electronics present, so no ANC)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "(exhausted NULL — no \"Hadenys\" row in Crinacle's rankings list, no Crinacle individual review post, no ASR/Rtings measurement; never inferred from Focal marketing copy)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.focal.com/products/hadenys",
      quote: "(no battery anywhere on the page or manual — wired-only passive headphone, so both ancOn and ancOff are null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
