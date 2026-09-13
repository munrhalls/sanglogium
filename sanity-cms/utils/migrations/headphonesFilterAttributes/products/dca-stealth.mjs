// Sourced 2026-09-13 — see docs/filters-sort/headphones-dca-sourced.md §2
// for the full per-field table this was transcribed from.
//
// Second-pass verified live on http://danclarkaudio.com/headphones/stealth-2.html:
// impedance 23ohms, sensitivity ~90 dB/mW, 76mm x 51mm single-ended planar
// magnetic, folding-gimbal/travel text and the "Yes, it has one" frequency-
// response placeholder all still read verbatim.
//
// Recorded conflict (second pass): the live page now reads $4,499.99 with a
// NEW flag, versus the catalogue's $3,999.99. Price is an I-tier internal
// field, not sourced by this protocol, so it is NOT written here — flagged in
// the doc's data-drift section instead.
//
// soundSignature comes from ASR (Crinacle has no Stealth entry at all —
// verified by full enumeration of the rankings list this pass), per the
// protocol's fallback order within Tier 3.

export default {
  productId: "k27n1AQuIbSr5iozFz7HA5",
  brand: "Dan Clark Audio",
  name: "Stealth",
  beadsIssue: "sang-logium-1xs.9.8",

  filterAttributes: {
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "wired",
    portable: true,
    driverType: ["planar-magnetic"],
    impedanceOhms: 23,
    sensitivityDbMw: 90,
    cableTermination: ["3.5mm", "6.35mm", "4-pin-xlr", "4.4mm-balanced", "2.5mm-balanced"],
    detachableCable: true,
    cableLengthM: 2,
    microphone: false,
    foldable: true,
    ipxRating: "none",
    anc: "passive",
    soundSignature: "Neutral",
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "Impedance 23ohms",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "Sensitivity ~90 dB/mW",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "Driver: 76mm x 51mm single-ended planar magnetic",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "\"Choose Your Cable\" dropdown base option: 2m 1/4\" VIVO",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "STEALTH is Dan Clark Audio's closed flagship headphone, and its striking matte black and red design offers a teaser of its stunningly smooth, rich and spacious sound.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "STEALTH is a closed-back headphone that delivers great isolation",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "In The Box: Stealth Headphone / Carrying Case / Certificate of authenticity / Manual / VIVO cable (no wireless or Bluetooth feature stated anywhere on the page)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "\"Choose Your Cable\" options: 1/4\", XLR (4-pin), 4.4mm, 2.5mm, 3.5mm",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://danclarkaudio.com/docs/2022/STEALTH-QUICKGUIDE.pdf",
      quote: "All Dan Clark Audio planar-magnetic products use push-pull self-latching connectors. To attach your cable hold the male connector by the boot and rotate it into the female receptacle on the headphone until you feel it click into place. To release the cable, pull down on the top of the connector's metal jacket.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "Travel friendly - Packs Small!",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "Folding gimbals allow Stealth to be packed in a compact case for safe and easy transport",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "(no microphone mentioned across the manufacturer product page and quick guide; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "(no IP/water-resistance claim found; no ingress-protection statement anywhere on the manufacturer page)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "http://danclarkaudio.com/headphones/stealth-2.html",
      quote: "closed-back headphone that delivers great isolation; no electronic active noise cancelling feature stated",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://www.audiosciencereview.com/forum/index.php?threads/dan-clark-stealth-review-state-of-the-art-headphone.25920/",
      quote: "the highest compliance to their target curve of any headphone they have ever tested / an incredibly clean, dynamic sound with absolute correctness in tonality... no need to apply any EQ",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },

  ],
};
