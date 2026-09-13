// Sourced 2026-09-13 — see docs/filters-sort/sourcing-sony-headphones.md
// for the full per-field table this was transcribed from.
// WF-G700N INZONE Buds. The "gSport Case" is a third-party bundle accessory; the headset hardware and every filterable attribute are the INZONE Buds spec.
//
// The POC filterAttributes on this document (backDesign, connector,
// noiseCancelling, microphone:false) were untrusted invented enrichment
// values. Every field below is re-sourced from a primary source per
// sourcing-protocol-headphones.md; no POC value was reused as a hint.

export default {
  productId: "dLGDVDmEEI2lV8CArIgSA0",
  brand: "Sony",
  name: "Sony WF-G700N INZONE Buds Truly Wireless Noise Cancelling Earbud Bundle with gSport Case (Black)",
  beadsIssue: "sang-logium-1xs.9.4",

  filterAttributes: {
    wearingStyle: ["in-ear"],
    acousticDesign: ["closed-back"],
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
    bluetoothCodecs: ["LC3"],
    anc: "anc",
    batteryLifeHours: {"ancOn":18,"ancOff":24},
    soundSignature: "Warm",
  },

  sourcing: [
    {
      field: "wearingStyle",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "Mass : Approx. 6.5 g x 2 (0.23 oz x 2) (Headset (including earbud tips (M))) (white, black)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "Wireless Noise Canceling Gaming Headset INZONE Buds — sealed in-ear noise-cancelling earbud; no open-back/semi-open variant or vent is described anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "fitType",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "Mass : Approx. 6.5 g x 2 (Headset (including earbud tips (M))) / Replacing the earbud tips — interchangeable universal-fit tips; no custom/CIEM mould is offered",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "Communication system : Bluetooth Specification version 5.3",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "Approx. 50 g (1.77 oz) (Charging case) (white, black) / Approx. 2.9 g (0.11 oz) (USB Transceiver) (black)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "Single dynamic driver; no balanced-armature, planar-magnetic, electrostatic or AMT driver is stated or implied anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "Transmission range : 20 Hz - 20 000 Hz (Sampling frequency 48 kHz)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "Power source : DC 5 V (Using a commercially available USB AC Adaptor) / USB transceiver storage compartment / USB Type-C port — the only wired interface is USB Type-C; no analogue headphone input exists",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "Using built-in lithium-ion batteries (Product Operation Power: DC 3.85 V) — true-wireless earbud with no detachable audio cable; only the charge cable detaches",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273041.html",
      quote: "Microphones (left, right) — Picks up the sound of your voice (when you are talking on the phone or using voice chat) and noise",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "(no folding hinge or fold step appears anywhere in the help guide — an earbud stores in the charging case rather than folding; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273074.html",
      quote: "Do not splash water forcibly into the sound output parts, air holes, or microphone parts of the headset units. / Do not place the headset in water or use it in a humid place such as a bathroom.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html",
      quote: "Supported Codec 4) : LC3",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273047.html",
      quote: "LC3 Noise canceling function: ON Max. 18 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273047.html",
      quote: "LC3 Noise canceling function: ON Max. 18 hours / LC3 OFF Max. 24 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://www.rtings.com/headphones/reviews/sony/inzone-buds-truly-wireless",
      quote: "Sound Signature = Warm; Bass Amount = Slightly Emphasized (2 dB); Treble Amount = Balanced (0 dB)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
