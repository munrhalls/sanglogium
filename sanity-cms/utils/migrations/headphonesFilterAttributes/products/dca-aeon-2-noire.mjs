// Sourced 2026-09-13 — see docs/filters-sort/headphones-dca-sourced.md §1
// for the full per-field table this was transcribed from.
//
// Second-pass verified: every quoted value below was re-opened on the live
// manufacturer page this pass and still reads verbatim. One correction was
// applied to the doc (cableLengthM rationale now cites the base DUMMER line
// `1/4"-3.5mm 2m DUMMER`, not the paid VIVO options); the recorded value `2`
// is unchanged. soundSignature mapping flagged inline in the doc.
//
// Left untouched deliberately: the stale pre-migration `backDesign: "closed"`
// sibling on the live document (superseded name, schema-headphones.md item 12)
// and the old `connector`/`noiseCancelling` fields — canonical replacements are
// written here; the stale siblings are not silently rewritten.

export default {
  productId: "k27n1AQuIbSr5iozFz7Fdd",
  brand: "Dan Clark Audio",
  name: "AEON 2 Noire",
  beadsIssue: "sang-logium-1xs.9.8",

  filterAttributes: {
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "wired",
    portable: true,
    driverType: ["planar-magnetic"],
    impedanceOhms: 13,
    sensitivityDbMw: 90,
    cableTermination: ["3.5mm", "6.35mm", "4-pin-xlr", "4.4mm-balanced", "2.5mm-balanced"],
    detachableCable: true,
    cableLengthM: 2,
    microphone: false,
    foldable: true,
    ipxRating: "none",
    anc: "passive",
    soundSignature: "V-Shaped",
    awards: ["NYT Wirecutter — best-sounding closed headphone under $2,000"],
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "Impedance 13ohms",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "Sensitivity ~90 dB/mW",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "Driver: 62mm x 34mm single-ended planar magnetic",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "\"Choose Your Cable\" dropdown base no-upcharge option: 1/4\"-3.5mm 2m DUMMER",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "ÆON 2 Noire is the latest edition of our award-winning ÆON 2 Closed headphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "ÆON 2 Noire is the latest edition of our award-winning ÆON 2 Closed headphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "ÆON 2 Noire headphone / Carrying case / 1/4\" with 3.5mm OR 4-Pin XLR Cable (no wireless or Bluetooth feature stated anywhere on the page)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "\"Choose Your Cable\" options: 1/4\"-3.5mm, 4-pin XLR, 4.4mm, 2.5mm, 3.5mm",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://danclarkaudio.com/pub/docs/2022/ÆON-2-QUICK-GUIDE.pdf",
      quote: "All Dan Clark Audio planar-magnetic products use Hirose-style connectors. To attach your cable hold the male connector by the boot and rotate it into the female receptacle on the headphone until you feel it click into place.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "ÆON 2's unique and patented folding gimbal design allows it to pack into a truly compact case that can fit into nearly anything",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "ÆON 2's unique and patented folding gimbal design allows it to pack into a truly compact case",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "(no microphone mentioned across the manufacturer product page and quick guide; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "(no IP/water-resistance claim found; no ingress-protection statement anywhere on the manufacturer page)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "closed-back design offering isolation; no electronic active noise cancelling feature stated",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "awards",
      url: "https://danclarkaudio.com/aeon-2-noir.html",
      quote: "the New York Times Wirecutter called ÆON 2 Closed the best-sounding closed headphone under $2,000",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "\"DCA Aeon 2 Noire\" — Warm V-shape / \"Arguably the best tuned DCA headphone with a slightly thick midrange and least offensive treble.\" (Tone Grade B-). Mapped to the schema's V-Shaped member; the schema list has no \"Warm V-shape\" value.",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },

  ],
};
