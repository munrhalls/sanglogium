// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-noble-audio.md
// for the full per-field table and citation trails this was transcribed from.
//
// NOTE this product's live POC filterAttributes (backDesign, connector,
// noiseCancelling, microphone:false, connectivity:"wireless") contained values
// the manufacturer contradicts. They are fully re-sourced here per
// sourcing-protocol-headphones.md; none of the POC values were reused as hints.
// The superseded legacy fields themselves (backDesign, noiseCancelling,
// connector) are deliberately NOT deleted by this patch — see the doc's
// "Gaps reported back" section.
//
// TWO VOCAB GAPS are recorded rather than force-fit (see the doc):
//   1. `aptX HD` is a sourced, real codec value but is MISSING from
//      productType.ts's bluetoothCodecs enum (which has "aptX Adaptive",
//      "aptX LL" but not "aptX HD"), even though should-be-headphones.md item 27
//      and the B&W sourced doc both list it. Recorded as sourced; flagged.
//   2. `driverConfigBucket`'s enum has no value for a headphone with a
//      two-driver hybrid arrangement, so it is omitted entirely.
//
// impedanceOhms / sensitivityDbMw / freqResponseHz / cableLengthM are genuinely
// NULL: the widened tier order was exhausted (manufacturer page, EN/CN/JA/KO
// user manuals, launch press release, all audited retailers, tech press) and
// none states a value. See the doc's "Tier-1 exhaustion" section.

export default {
  productId: "moXlkADK7m1DHgGwWwzwUF",
  brand: "Noble Audio",
  name: "Noble Audio FoKus Apollo Wireless Headphones",
  beadsIssue: "sang-logium-1xs.9.19",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    // fitType omitted: not an IEM — schema says null/unset when not an IEM.
    connectivity: "hybrid", // analogue 3.5mm playback AND Bluetooth 5.3
    portable: true, // EVA carrying case + 80h battery + Bluetooth-first design
    awards: ["Ecoustics Editor's Award — Best of 2025"],
    driverType: ["dynamic", "planar-magnetic"], // 40mm dynamic + 14.5mm planar hybrid
    impedanceOhms: null, // NULL — exhaustion trail in the doc
    sensitivityDbMw: null, // NULL — exhaustion trail in the doc
    freqResponseHz: null, // NULL — exhaustion trail in the doc
    cableTermination: ["3.5mm", "6.35mm", "usb-c", "4.4mm-balanced"],
    detachableCable: true,
    cableLengthM: null, // NULL — three cables ship, none is length-specified
    microphone: true, // 6 mics + detachable boom mic
    foldable: false, // boolean feature-absence rule: "don't fold flat... skipped hinges"
    // ipxRating omitted: no IP claim anywhere; not the boolean feature-absence case.
    bluetoothCodecs: ["LDAC", "AAC", "aptX", "aptX HD", "SBC"],
    anc: "anc",
    batteryLifeHours: { ancOff: 80, ancOn: 60 },
    soundSignature: null, // NULL — Crinacle/ASR/Rtings all silent, see the doc
    requiresAmplifier: false, // derived from the two nulls above + internal amp
  },

  sourcing: [
    {
      field: "connectivity",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "The world's first 1x40mm dynamic driver + 14.5mm planar magnetic hybrid driver speaker arrangement ... Can be played with an included 3.5mm auxiliary cable (Bluetooth 5.3 wireless playback also supported)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote: "The FoKus Apollo is Noble's first forey into the world of over-ear headphones.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.ecoustics.com/reviews/noble-fokus-apollo/",
      quote:
        "That changed with the Fokus Apollo—Noble's first swing at the over-ear category and, conveniently, the industry's first hybrid wireless headphone combining a dynamic driver with a planar driver.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "(no open/vented design described anywhere on the manufacturer page, the user manual, or any audited retailer; circumaural closed cups. Conflict resolved by recency per the amended rule — the live Sanity legacy value backDesign:'closed' agrees. An open-back would be marketed as such, as Noble does for its wired Osprey/Sceptre lines.)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "The world's first 1x40mm dynamic driver + 14.5mm planar magnetic hybrid driver speaker arrangement",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "Accessories include an EVA carrying case, 3.5mm auxiliary cable, USB-C cable, two prong airline adapter, 1/4\" adapter for headphone amps, a 3.5mm to 4.4mm adapter, and a detachable boom mic (Bluetooth-first, self-powered, 80h battery, bagged for transport)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "awards",
      url: "https://www.ecoustics.com/reviews/noble-fokus-apollo/",
      quote:
        "Winner of Ecoustic's editor award for best of 2025. (cited from the manufacturer page, which links this review as the award source)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "Accessories include an EVA carrying case, 3.5mm auxiliary cable, USB-C cable, two prong airline adapter, 1/4\" adapter for headphone amps, a 3.5mm to 4.4mm adapter, and a detachable boom mic (corroborated by ecoustics: \"Noble packs in a 3.5mm aux cable, a USB Type-C charge/connect cable, an airline adapter, a 6.35mm adapter, a 3.5mm to 4.4mm balanced adapter, and even a detachable boom mic.\")",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "Accessories include an EVA carrying case, 3.5mm auxiliary cable, USB-C cable ... and a removable boom mic (every cable ships as a separate, swappable accessory rather than a captive lead)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "Integrated ADI chip combined with 3 microphones per side providing hybrid ANC ... Removable boom mic ... Excellent call quality with or without the supplied boom mic attached (corroborated by headphones.com spec block: \"Number of Microphones: 6 / Detachable Boom Mic: Included, with mute switch\")",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://www.ecoustics.com/reviews/noble-fokus-apollo/",
      quote:
        "these headphones don't fold flat, and Noble skipped hinges at the gimbals, so you're getting full-size cans in full-size form. (no fold/collapse/hinge language anywhere on the manufacturer page or in the user manual — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "supported codecs include LDAC, AAC, aptX, aptX HD, SBC; QCC3084 chip (headphones.com's spec block lists the shorter set \"LDAC, AAC, aptX, aptX HD\" — same-tier conflict resolved by recency/completeness in favour of the manufacturer's live page, which additionally names SBC. NOTE \"aptX HD\" is a real sourced value missing from productType.ts's bluetoothCodecs enum — recorded, flagged, not force-fit.)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "Integrated ADI chip combined with 3 microphones per side providing hybrid ANC with a reduction depth of up to -35db ... Superior transparency mode (headphones.com: \"Active Noise Cancellation: -20dB to -35dB reduction\")",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "80 hours of play time without ANC / 60 hours of play time with ANC (headphones.com: \"Battery Life (No ANC): Up to 80 hours (50% volume)\" / \"Battery Life (With ANC): Up to 60 hours (50% volume)\")",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "(no impedance value published in the widened tier order: manufacturer page, EN/CN/JA-KO user manual PDFs [extracted with pdftotext, no spec table at all], the 2024-09-04 launch press release, headphones.com/Bloom/Moon Audio/Audio46, or tech press — NULL, genuinely unfound, not a guessed default)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "(no sensitivity value published in the widened tier order — same exhaustion trail as impedanceOhms; expected for a self-powered Bluetooth ANC headphone whose amp is internal — NULL, genuinely unfound)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "(no frequency response range published in the widened tier order — same exhaustion trail as impedanceOhms — NULL, genuinely unfound)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://nobleaudio.com/products/fokus-apollo",
      quote:
        "(three cables ship — 3.5mm aux, USB-C, and a 3.5mm-to-4.4mm balanced adapter — and no length is stated for any of them on the manufacturer page, in the manual, or at any audited retailer — NULL, genuinely unfound)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote:
        "(no Crinacle ranking entry — direct string count on the fetched 1,037,190-byte page: Noble 0, Fokus 0, FoKus 0, Apollo 0; no Crinacle review post; crinacle.com/graphs/headphones/noble-fokus-apollo/ returns HTTP 404; no ASR measurement thread; an RTINGS review exists at /headphones/reviews/noble/fokus-apollo but is JS-gated and unreadable — NULL rather than inferred from manufacturer marketing prose, which the protocol forbids as an E-tier source)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
