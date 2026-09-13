// Sourced 2026-09-13 — see docs/filters-sort/sourcing-sony-headphones.md
// (Pink colour variant of the same WH-1000XM5 hardware as products/wh-1000xm5.mjs;
// every citation below is that model spec, unchanged by colour.)
// for the full per-field table this was transcribed from.
//
// Note: the POC filterAttributes on this document (backDesign, connector,
// noiseCancelling, microphone:false, connectivity:"wireless") were untrusted
// invented enrichment values. They are fully re-sourced here per
// sourcing-protocol-headphones.md; none of the POC values were reused as hints.

export default {
  productId: "ZuUKzmkqDyQwdcwhxl9BBF",
  brand: "Sony",
  name: "Sony WH-1000XM5 Wireless Over-Ear Noise Canceling Headphones (Pink)",
  beadsIssue: "sang-logium-1xs.9.4",

  filterAttributes: {
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "wireless",
    portable: true,
    driverType: ["dynamic"],
    freqResponseHz: { min: 4, max: 40000 },
    cableTermination: ["3.5mm"],
    detachableCable: true,
    cableLengthM: 1.2,
    microphone: true,
    foldable: false,
    ipxRating: "none",
    bluetoothCodecs: ["SBC", "AAC", "LDAC"],
    anc: "anc",
    batteryLifeHours: { ancOn: 30, ancOff: 40 },
    soundSignature: "Warm",
  },

  sourcing: [
    {
      field: "wearingStyle",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534515.html",
      quote: "Wireless Noise Canceling Stereo Headset ... Headphone cable (approx. 1.2 m (47.25 in.)) (1)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534515.html",
      quote: "Wireless Noise Canceling Stereo Headset — closed circumaural noise-cancelling over-ear; no open-back or semi-open variant, and no open vent, is described anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534744.html",
      quote: "you can use the headset as noise canceling headphones while the headset is connected to a device via the supplied headphone cable",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534515.html",
      quote: "Carrying case ( WH-1000XM5 only) (1)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/print.pdf",
      quote: "Model : YY2954 — single dynamic driver; no balanced-armature, planar-magnetic, electrostatic or AMT driver is stated or implied anywhere in the help guide or specification PDF",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/print.pdf",
      quote: "4 Hz - 40,000 Hz (JEITA) — the specification PDF's A2DP transmission range rows",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534515.html",
      quote: "Headphone cable (approx. 1.2 m (47.25 in.)) (1)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534744.html",
      quote: "The headset turns off automatically if you disconnect the supplied headphone cable from the headset while it is turned on.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534515.html",
      quote: "Headphone cable (approx. 1.2 m (47.25 in.)) (1)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534744.html",
      quote: "When an incoming call arrives, a ring tone is heard via the headset. Answer the call using your smartphone or mobile phone, and talk using the microphone of the phone. You can hear the caller's voice from the headset.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534705.html",
      quote: "(no folding hinge, folded position, or fold step appears anywhere in the help guide's Parts and controls or Setting the headset in the carrying case sections — the flat-folding swivel of the XM3/XM4 is absent on the XM5; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/index.html",
      quote: "The headset is not waterproof. If the headset is charged while it is wet with rain or sweat, etc., this can result in burnout or malfunction.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534508.html",
      quote: "Codec ... LDAC ™ ... AAC ... SBC",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534508.html",
      quote: "Noise canceling function: ON Max. 30 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534508.html",
      quote: "AAC Noise canceling function: ON Max. 30 hours / AAC OFF Max. 40 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://www.rtings.com/headphones/reviews/sony/wh-1000xm5-wireless",
      quote: "Sound Signature = Warm; Bass Amount = Very Emphasized (6 dB); Treble Amount = Slightly Emphasized (1 dB)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
