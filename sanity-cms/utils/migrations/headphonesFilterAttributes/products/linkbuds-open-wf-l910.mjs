// Sourced 2026-09-13 — see docs/filters-sort/sourcing-sony-headphones.md
// for the full per-field table this was transcribed from.
// WF-L910 LinkBuds Open.
//
// The POC filterAttributes on this document (backDesign, connector,
// noiseCancelling, microphone:false) were untrusted invented enrichment
// values. Every field below is re-sourced from a primary source per
// sourcing-protocol-headphones.md; no POC value was reused as a hint.

export default {
  productId: "dLGDVDmEEI2lV8CArIgVky",
  brand: "Sony",
  name: "Sony WFL910 Linkbuds Truly Wireless Earbuds (Black)",
  beadsIssue: "sang-logium-1xs.9.4",

  filterAttributes: {
    wearingStyle: ["in-ear"],
    acousticDesign: ["semi-open"],
    fitType: "universal",
    connectivity: "true-wireless",
    portable: true,
    driverType: ["dynamic"],
    freqResponseHz: {"min":20,"max":20000},
    cableTermination: ["usb-c"],
    detachableCable: false,
    microphone: true,
    foldable: false,
    ipxRating: "none",
    bluetoothCodecs: ["SBC","AAC","LC3"],
    anc: "none",
    batteryLifeHours: {"ancOn":null,"ancOff":8},
    soundSignature: null,
  },

  sourcing: [
    {
      field: "wearingStyle",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Mass : Approx. 5.1 g x 2 (0.18 oz x 2) (Headset (including fitting supporters))",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Wireless Stereo Headset LinkBuds Open / Model: YY2964 — the ring driver leaves the ear canal open by design; no sealed closed-back enclosure is described",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "fitType",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Mass : Approx. 5.1 g x 2 (Headset (including fitting supporters)) / Included items — interchangeable universal-fit supporters; no custom/CIEM mould is offered",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Communication system : Bluetooth Specification version 5.3",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Charging time : Approx. 1.5 hours (Headset) Approx. 2.5 hours (Charging case)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Single dynamic ring driver; no balanced-armature, planar-magnetic, electrostatic or AMT driver is stated or implied anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Transmission range (A2DP) : 20 Hz - 20 000 Hz (Sampling frequency 44.1 kHz)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Power source : DC 5 V (Using a commercially available USB AC Adaptor) — the only wired interface is the USB Type-C charging port; no analogue headphone input exists",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Using built-in lithium-ion batteries (Product Operation Power: DC 3.85 V) — true-wireless earbud with no detachable audio cable; only the charge cable detaches",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Compatible Bluetooth profiles 2) : A2DP / AVRCP / HFP / HSP TMAP / CSIP / MCP / VCP / CCP — HFP plus the Making a call / Receiving a call sections evidence built-in microphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "(no folding hinge or fold step appears anywhere in the help guide — an earbud stores in the charging case rather than folding; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300258.html",
      quote: "Do not splash water forcibly into the sound output parts, air holes, or microphone parts of the headset units. / Do not place the headset in water or use it in a humid place such as a bathroom.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "Supported Codec 3) : SBC AAC LC3",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001298908.html",
      quote: "Available operating time ... Music playback time (AAC): Max. 8 hours — no noise canceling function or Ambient Sound Mode row exists for this model, and no NC/AMB button is described",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001298908.html",
      quote: "Music playback time (AAC): Max. 8 hours / Music playback time (SBC): Max. 8 hours / Music playback time (LC3): Max. 8 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html",
      quote: "(null — Crinacle has no LinkBuds Open / WF-L910 entry in its IEM or headphone ranking lists, and RTINGS publishes no LinkBuds Open review with a Sound Signature verdict; no Tier-3 source measures it, so the protocol says null rather than inferring from marketing copy)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
