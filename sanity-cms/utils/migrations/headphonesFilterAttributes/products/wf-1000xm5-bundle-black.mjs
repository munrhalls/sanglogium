// Sourced 2026-09-13 — see docs/filters-sort/sourcing-sony-headphones.md
// for the full per-field table this was transcribed from.
// Shared model spec — also applied to the two gSport bundle SKUs (ZuUKzmkqDyQwdcwhxl99sR Black, ZuUKzmkqDyQwdcwhxwQPfT Silver), which are the same WF-1000XM5 hardware plus a third-party case.
//
// The POC filterAttributes on this document (backDesign, connector,
// noiseCancelling, microphone:false) were untrusted invented enrichment
// values. Every field below is re-sourced from a primary source per
// sourcing-protocol-headphones.md; no POC value was reused as a hint.

export default {
  productId: "ZuUKzmkqDyQwdcwhxl99sR",
  brand: "Sony",
  name: "Sony WF-1000XM5 Wireless Noise Cancelling In-Ear Headphone Bundle with gSport Hardshell Case (Black)",
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
    ipxRating: "IPX4",
    bluetoothCodecs: ["SBC","AAC","LDAC","LC3"],
    anc: "anc",
    batteryLifeHours: {"ancOn":8,"ancOff":12},
    soundSignature: "Warm",
  },

  sourcing: [
    {
      field: "wearingStyle",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "Mass : Approx. 5.9 g x 2 (0.21 oz x 2) (Headset (including earbud tips (M)))",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "Wireless Noise Canceling Stereo Headset WF-1000XM5 — sealed in-ear noise-cancelling earbud; no open-back/semi-open variant or vent is described anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "fitType",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "Mass : Approx. 5.9 g x 2 (Headset (including earbud tips (M))) — removable earbud tips in S/M/L/SS/LL sizes, i.e. a universal-fit IEM; no custom/CIEM mould is offered",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "Communication system : Bluetooth Specification version 5.3",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "Charging time : Approx. 1.5 hours (Headset) Approx. 2 hours (Charging case)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "Model: YY2963 — single dynamic driver; no balanced-armature, planar-magnetic, electrostatic or AMT driver is stated or implied anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "Transmission range (A2DP) : 20 Hz - 20 000 Hz (Sampling frequency 44.1 kHz) 20 Hz - 40 000 Hz (Sampling frequency LDAC 96 kHz, 990 kbps)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "DC 5 V: When charged using USB / Charging time : Approx. 1.5 hours (Headset) — the only wired interface is the USB Type-C charging port; no analogue headphone input exists",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "Power source : DC 3.85 V: Built-in lithium-ion rechargeable battery — true-wireless earbud with no detachable audio cable; only the charge cable detaches",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "Making a call / Receiving a call / Functions for a phone call — microphones (left, right) are listed under Location and function of parts and the HFP profile is supported",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "(no folding hinge or fold step appears anywhere in the help guide — an earbud stores in the charging case rather than folding; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783366.html",
      quote: "Do not splash water forcibly into the sound output parts, air holes, or microphone parts of the headset units. / Do not place the headset in water or use it in a humid place such as a bathroom.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html",
      quote: "Supported Codec : SBC AAC LDAC LC3",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000781965.html",
      quote: "AAC Noise canceling function: ON Max. 8 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000781965.html",
      quote: "AAC Noise canceling function: ON Max. 8 hours / AAC OFF Max. 12 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://www.rtings.com/headphones/reviews/sony/wf-1000xm5-truly-wireless",
      quote: "Sound Signature = Warm; Bass Amount = Emphasized (4 dB); Treble Amount = Balanced (-1 dB); \"Their frequency response deviates minimally from their warm sound profile.\"",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
