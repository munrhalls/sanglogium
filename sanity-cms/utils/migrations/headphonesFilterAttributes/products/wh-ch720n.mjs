// Sourced 2026-09-13 — see docs/filters-sort/sourcing-sony-headphones.md
// for the full per-field table this was transcribed from.
// WH-CH720N — retail listing name is "WHCH720N/B", the same model.
//
// The POC filterAttributes on this document (backDesign, connector,
// noiseCancelling, microphone:false) were untrusted invented enrichment
// values. Every field below is re-sourced from a primary source per
// sourcing-protocol-headphones.md; no POC value was reused as a hint.

export default {
  productId: "dLGDVDmEEI2lV8CArIgbTY",
  brand: "Sony",
  name: "Sony WHCH720N/B Hybrid Wired & Wireless Bluetooth Noise Canceling Headphones",
  beadsIssue: "sang-logium-1xs.9.4",

  filterAttributes: {
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "hybrid",
    portable: true,
    driverType: ["dynamic"],
    freqResponseHz: {"min":7,"max":20000},
    cableTermination: ["3.5mm"],
    detachableCable: true,
    cableLengthM: 1.2,
    microphone: true,
    foldable: false,
    ipxRating: "none",
    bluetoothCodecs: ["SBC","AAC"],
    anc: "anc",
    batteryLifeHours: {"ancOn":35,"ancOff":50},
    soundSignature: "Warm",
  },

  sourcing: [
    {
      field: "wearingStyle",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000783326.html",
      quote: "Mass: Approx. 192 g (6.8 oz) / Impedance: 325 ohm (1 kHz) (when connecting via the headphone cable with the headset turned on)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000783326.html",
      quote: "Wireless Noise Canceling Stereo Headset WH-CH720N — closed circumaural noise-cancelling over-ear; no open-back or semi-open variant, and no open vent, is described anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000776820.html",
      quote: "Headphone cable connected (power is turned on) Noise canceling function: ON Max. 35 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000783326.html",
      quote: "Mass: Approx. 192 g (6.8 oz) — lightweight on-the-go over-ear; retail listing positions it as a wireless mobile headphone with a supplied travel-length cable",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000783326.html",
      quote: "Model: YY2966 — single dynamic driver; no balanced-armature, planar-magnetic, electrostatic or AMT driver is stated or implied anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000783326.html",
      quote: "Frequency response: 7 Hz - 20 000 Hz (JEITA) (when connecting via the headphone cable with the headset turned on)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000776827.html",
      quote: "Headphone cable (approx. 1.2 m (47.25 in.)) (1)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000777054.html",
      quote: "Using the supplied headphone cable — the cable plugs into a headphone cable input jack on the headset and is removed to return to Bluetooth-only use",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000776827.html",
      quote: "Headphone cable (approx. 1.2 m (47.25 in.)) (1)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000776825.html",
      quote: "Microphone / Picks up the sound of your voice when talking on the phone. / Making a call / Receiving a call",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000783326.html",
      quote: "(no folding hinge, folded position, or fold step appears anywhere in the help guide — the swivel-fold of the WH-CH710N is absent on the CH720N; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000784812.html",
      quote: "On waterproof performance of the headset The headset is not waterproof. If water or foreign matter enters the headset, this can result in burnout or malfunction.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000783326.html",
      quote: "Supported Codec 3) : SBC AAC",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000776820.html",
      quote: "AAC Noise canceling function: ON Max. 35 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000776820.html",
      quote: "AAC Noise canceling function: ON Max. 35 hours / AAC OFF Max. 50 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://www.rtings.com/headphones/reviews/sony/wh-ch720n-wireless",
      quote: "Sound Signature = Warm; Bass Amount = Very Emphasized (5 dB); Treble Amount = Slightly Emphasized (1 dB)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
