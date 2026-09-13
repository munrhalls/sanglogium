// Sourced 2026-09-13 — see docs/filters-sort/sourcing-sony-headphones.md
// for the full per-field table this was transcribed from.
// WF-LS910N LinkBuds Fit.
//
// The POC filterAttributes on this document (backDesign, connector,
// noiseCancelling, microphone:false) were untrusted invented enrichment
// values. Every field below is re-sourced from a primary source per
// sourcing-protocol-headphones.md; no POC value was reused as a hint.

export default {
  productId: "ZuUKzmkqDyQwdcwhxwQLK7",
  brand: "Sony",
  name: "Sony Linkbuds Fit Truly Wireless Noise Cancelling Earbuds (White)",
  beadsIssue: "sang-logium-1xs.9.4",

  filterAttributes: {
    wearingStyle: ["in-ear"],
    acousticDesign: ["closed-back"],
    fitType: "universal",
    connectivity: "true-wireless",
    portable: true,
    driverType: ["dynamic"],
    freqResponseHz: {"min":20,"max":40000},
    cableTermination: ["usb-c"],
    detachableCable: false,
    microphone: true,
    foldable: false,
    ipxRating: "none",
    bluetoothCodecs: ["SBC","AAC","LDAC","LC3"],
    anc: "anc",
    batteryLifeHours: {"ancOn":5.5,"ancOff":8},
    soundSignature: null,
  },

  sourcing: [
    {
      field: "wearingStyle",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Mass : Approx. 4.9 g x 2 (0.18 oz x 2) (Headset (including earbud tips (M) and fitting supporters))",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Wireless Noise Canceling Stereo Headset LinkBuds Fit — sealed in-ear noise-cancelling earbud; no open-back/semi-open variant or vent is described anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "fitType",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Mass : Approx. 4.9 g x 2 (Headset (including earbud tips (M) and fitting supporters)) / Replacing the earbud tips — interchangeable universal-fit tips; no custom/CIEM mould is offered",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Communication system : Bluetooth Specification version 5.3",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Charging time : Approx. 2 hours (Headset) Approx. 3 hours (Charging case)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Mass/Communication specification block — single dynamic driver; no balanced-armature, planar-magnetic, electrostatic or AMT driver is stated or implied anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Transmission range (A2DP) : 20 Hz - 20 000 Hz (Sampling frequency 44.1 kHz) 20 Hz - 40 000 Hz (Sampling frequency LDAC 96 kHz, 990 kbps)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Power source : DC 5 V (Using a commercially available USB AC Adaptor) — the only wired interface is the USB Type-C charging port; no analogue headphone input exists",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Using built-in lithium-ion batteries (Product Operation Power: DC 3.85 V) — true-wireless earbud with no detachable audio cable; only the charge cable detaches",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Compatible Bluetooth profiles 2) : A2DP / AVRCP / HFP / HSP TMAP / CSIP / MCP / VCP / CCP — HFP plus the Making a call / Receiving a call sections evidence built-in microphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "(no folding hinge or fold step appears anywhere in the help guide — an earbud stores in the charging case rather than folding; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001613767.html",
      quote: "Do not splash water forcibly into the sound output parts, air holes, or microphone parts of the headset units. / Do not place the headset in water or use it in a humid place such as a bathroom.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "Supported Codec 3) : SBC AAC LDAC LC3",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001612417.html",
      quote: "AAC Noise canceling function: ON Max. 5.5 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001612417.html",
      quote: "AAC Noise canceling function: ON Max. 5.5 hours / AAC OFF Max. 8 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html",
      quote: "(null — Crinacle has no LinkBuds Fit / WF-LS910N entry in its IEM or headphone ranking lists, and RTINGS publishes no LinkBuds Fit review with a Sound Signature verdict; no Tier-3 source measures it, so the protocol says null rather than inferring from marketing copy)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
