// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-focal.md
// (product 5) for the full per-field table and citation trails this was
// transcribed from.
//
// CONFLICT: cableTermination — the live page's Connectivity block lists only
// "Connector : Jack 3.5 mm", while the manual also documents the bundled
// "Jack adapter, 1/8" female – 1/4" male". Both are cited; the more complete
// two-value set is kept because the adapter is a genuine supplied
// termination.

export default {
  productId: "k27n1AQuIbSr5iozFz7FSo",
  brand: "Focal",
  name: "Celestee",
  beadsIssue: "sang-logium-1xs.9.5.5",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    fitType: null,
    connectivity: "wired",
    portable: true, // page: "a cable suitable for both home and portable use"
    microphone: false, // absence-based per protocol's boolean feature-absence exception
    cableTermination: ["3.5mm", "6.35mm"], // manual's bundled adapter adds 6.35mm over the page's bare 3.5mm line
    detachableCable: true,
    cableLengthM: 1.2,
    foldable: false, // FLAG — hard case, no folding hinge; absence-based
    ipxRating: null,
    bluetoothCodecs: null, // domain-gated, wired-only
    anc: "none", // derived: closed-back passive isolation only, no electronics
    batteryLifeHours: { ancOff: null, ancOn: null },
    driverType: ["dynamic"],
    impedanceOhms: 35,
    sensitivityDbMw: 105,
    freqResponseHz: { min: 5, max: 23000 },
    awards: null,
    driverConfigBucket: null, // domain-gated to IEM
    driverConfigDetail: null,
    soundSignature: "Neutral", // Crinacle rankings list ("Neutral with bass boost"), Tone B-, Technical C
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://www.focal.com/products/celestee",
      quote: "Impedance : 35 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://dam.focal-naim.com/m/57e89b6c50955937/original/User_Manual_CELESTEE_85x200_CODO1665_web-pdf.pdf",
      quote: "Sensitivity 105dB SPL / 1mW @ 1kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://www.focal.com/products/celestee",
      quote: "Frequency response (+/- 3dB) : 5 Hz – 23 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.focal.com/products/celestee",
      quote: "Loudspeakers : 15/8\" (40mm) Aluminium/Magnesium ‘M’-shaped dome",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://www.focal.com/products/celestee",
      quote: "Cables provided : • 1 x 4ft (1.2m) Jack 1/8\" (3.5mm) cable • 1 Jack adapter,1/8\" (3.5mm) female – 1/4\" (6.35mm) male",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.focal.com/products/celestee",
      quote: "Product type : Closed-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://dam.focal-naim.com/m/57e89b6c50955937/original/User_Manual_CELESTEE_85x200_CODO1665_web-pdf.pdf",
      quote: "Type Circum-aural closed-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.focal.com/products/celestee",
      quote: "Celestee - Closed hi-fi headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.focal.com/products/celestee",
      quote: "(detachable analog mini-jack cable only; no Bluetooth, ANC, or electronics anywhere on the page or manual)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.focal.com/products/celestee",
      quote: "Celestee comes with a carrying case in the headphones' colors, and a cable suitable for both home and portable use",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://dam.focal-naim.com/m/57e89b6c50955937/original/User_Manual_CELESTEE_85x200_CODO1665_web-pdf.pdf",
      quote: "Cable provided • 1 x 4ft OFC 24 AWG cable with 1/8\" TRS Jack connector • 1 x Jack adapter, 1/8\" female – 1/4\" male",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://dam.focal-naim.com/m/57e89b6c50955937/original/User_Manual_CELESTEE_85x200_CODO1665_web-pdf.pdf",
      quote: "you simply have to disconnect the cable and store it in the case",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://dam.focal-naim.com/m/57e89b6c50955937/original/User_Manual_CELESTEE_85x200_CODO1665_web-pdf.pdf",
      quote: "(no microphone language anywhere on the page or manual — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://dam.focal-naim.com/m/57e89b6c50955937/original/User_Manual_CELESTEE_85x200_CODO1665_web-pdf.pdf",
      quote: "(hard carrying case described; no folding hinge anywhere — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.focal.com/products/celestee",
      quote: "(derived from already-cited acousticDesign: closed-back + connectivity: wired — the page markets \"added isolation\", not ANC; no electronics)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "Neutral with bass boost — Thin and uneven mids with narrow, congested staging. (Tone Grade B-, Technical Grade C)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.focal.com/products/celestee",
      quote: "(no battery anywhere on the page or manual — wired-only passive headphone, so both ancOn and ancOff are null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
