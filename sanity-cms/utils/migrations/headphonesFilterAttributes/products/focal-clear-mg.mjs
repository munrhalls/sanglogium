// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-focal.md
// (product 4) for the full per-field table and citation trails this was
// transcribed from.
//
// sensitivityDbMw correction: the pilot pass (pilot-headphones-sourced.md
// product 3) recorded null here because the web page only publishes
// "104 dB SPL (peak@1m)". The widened protocol makes the manufacturer manual
// an equally-authoritative tier-1 document, and the Clear Mg manual publishes
// the correctly-based "Sensitivity 104dB SPL / 1mW @ 1kHz". This file writes
// 104 from the manual and supersedes the pilot's null.
//
// CONFLICT: freqResponseHz — live page "5 Hz – 23 kHz (+/- 3dB)" vs manual
// "5Hz–28kHz". Live page kept per the manufacturer self-contradiction rule
// (resolve by recency); both cited below.

export default {
  productId: "k27n1AQuIbSr5iozFz7EsP",
  brand: "Focal",
  name: "Clear Mg",
  beadsIssue: "sang-logium-1xs.9.5.4",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    fitType: null,
    connectivity: "wired",
    portable: false, // FLAG — page says "for the home"; no portable/desktop field on the page
    microphone: false, // absence-based per protocol's boolean feature-absence exception
    cableTermination: ["3.5mm", "6.35mm", "4-pin-xlr"],
    detachableCable: true,
    cableLengthM: 1.2, // unbalanced cable; 3m balanced XLR also supplied
    foldable: false, // FLAG — hard case, no folding hinge; absence-based
    ipxRating: null,
    bluetoothCodecs: null, // domain-gated, wired-only
    anc: "none", // derived: open-back + wired, no electronics
    batteryLifeHours: { ancOff: null, ancOn: null },
    driverType: ["dynamic"],
    impedanceOhms: 55,
    sensitivityDbMw: 104, // manual basis; supersedes the pilot's null
    freqResponseHz: { min: 5, max: 23000 }, // live page; manual's 5Hz-28kHz superseded (CONFLICT-resolved)
    awards: null,
    driverConfigBucket: null, // domain-gated to IEM
    driverConfigDetail: null,
    soundSignature: "Warm", // Crinacle rankings + Crinacle dedicated review post
  },

  sourcing: [
    {
      field: "soundSignature",
      url: "https://crinacle.com/2021/03/22/crinnotes-focal-clear-mg-quick-review-padgate/",
      quote: "The Clear Mg is definitely warmer and possesses less upper mids than the original. (Overall Grade B, Tone Grade B, Technical grade A-; rankings list entry reads \"Warm neutral — Lacks upper mids and resolution compared to its predecessor.\")",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://www.focal.com/products/clear-mg",
      quote: "Impedance : 55 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://dam.focal-naim.com/m/15443cc8eacda39e/original/UserManual_ClearMG_85x200_web-pdf.pdf",
      quote: "Sensitivity 104dB SPL / 1mW @ 1kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://www.focal.com/products/clear-mg",
      quote: "Frequency response (+/- 3dB) : 5 Hz – 23 kHz (live page kept over manual's \"5Hz–28kHz\" per the manufacturer self-contradiction rule)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.focal.com/products/clear-mg",
      quote: "Loudspeakers : 15/8\" (40mm) Magnesium ‘M’-shaped dome",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://dam.focal-naim.com/m/15443cc8eacda39e/original/UserManual_ClearMG_85x200_web-pdf.pdf",
      quote: "Cable provided • 3m balanced cable (XLR 4-pin) • 1,2m unbalanced cable (1/8\" TRS Jack) • 1/8\" Jack to 1/4\" stereo Jack adapter",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.focal.com/products/clear-mg",
      quote: "Product type : Open-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://dam.focal-naim.com/m/15443cc8eacda39e/original/UserManual_ClearMG_85x200_web-pdf.pdf",
      quote: "Type Circum-aural open-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.focal.com/products/clear-mg",
      quote: "Clear MG - Open-back hi-fi headphones for the home",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.focal.com/products/clear-mg",
      quote: "(supplied cables are 3.5mm TRS and 4-pin XLR; no Bluetooth, ANC, or electronics anywhere on the page or manual)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.focal.com/products/clear-mg",
      quote: "Open-back hi-fi headphones for the home (no portability or travel language — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://www.focal.com/products/clear-mg",
      quote: "Cables provided : • 1 x 4ft (1.2m) Jack 1/8\" cable • 1 x 10ft (3m) 4-pin XLR cable • 1 Jack adapter,1/8\" (3.5mm) female – 1/4\" (6.35mm) male",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://dam.focal-naim.com/m/15443cc8eacda39e/original/UserManual_ClearMG_85x200_web-pdf.pdf",
      quote: "you simply have to disconnect the cable and store it in the case",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://dam.focal-naim.com/m/15443cc8eacda39e/original/UserManual_ClearMG_85x200_web-pdf.pdf",
      quote: "(no microphone language anywhere on the page or manual — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://dam.focal-naim.com/m/15443cc8eacda39e/original/UserManual_ClearMG_85x200_web-pdf.pdf",
      quote: "(hard carrying case described; no folding hinge anywhere — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.focal.com/products/clear-mg",
      quote: "(derived from already-cited acousticDesign: open-back + connectivity: wired — no electronics present, so no ANC)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.focal.com/products/clear-mg",
      quote: "(no battery anywhere on the page or manual — wired-only passive headphone, so both ancOn and ancOff are null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
