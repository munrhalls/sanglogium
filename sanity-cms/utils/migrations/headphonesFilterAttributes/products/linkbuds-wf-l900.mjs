// Sourced 2026-09-13 — see docs/filters-sort/sourcing-sony-headphones.md
// for the full per-field table this was transcribed from.
// WF-L900 LinkBuds — the ring-shaped open-fit model (not LinkBuds S, LinkBuds Fit or LinkBuds Open).
//
// The POC filterAttributes on this document (backDesign, connector,
// noiseCancelling, microphone:false) were untrusted invented enrichment
// values. Every field below is re-sourced from a primary source per
// sourcing-protocol-headphones.md; no POC value was reused as a hint.

export default {
  productId: "k27n1AQuIbSr5iozG2itJe",
  brand: "Sony",
  name: "Sony LinkBuds Truly Wireless Earbuds",
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
    bluetoothCodecs: ["SBC","AAC"],
    anc: "none",
    batteryLifeHours: {"ancOn":null,"ancOff":5.5},
    soundSignature: null,
  },

  sourcing: [
    {
      field: "wearingStyle",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html",
      quote: "Mass: Approx. 4.1 g x 2 (0.15 oz x 2) (Headset (including fitting supporters (M)))",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html",
      quote: "Wireless Stereo Headset LinkBuds / Model: YY2953 — the ring driver leaves the ear canal open by design; no sealed closed-back enclosure is described",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "fitType",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000447701.html",
      quote: "Fitting supporters ( XS / S / M / L / XL 2 each) — interchangeable universal-fit supporters; no custom/CIEM mould is offered",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html",
      quote: "Communication system: Bluetooth Specification version 5.2",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000447701.html",
      quote: "Charging case (1)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html",
      quote: "Model: YY2953 — single dynamic ring driver; no balanced-armature, planar-magnetic, electrostatic or AMT driver is stated or implied anywhere in the help guide",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html",
      quote: "Transmission range ( A2DP ): 20 Hz - 20,000 Hz (Sampling frequency 44.1 kHz)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000447701.html",
      quote: "USB Type-C® cable (USB-A to USB-C®) (approx. 20 cm (7.88 in.)) (1) — the only wired interface is USB Type-C charging; no analogue headphone input exists",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html",
      quote: "Power source: DC 3.85 V: Built-in lithium-ion rechargeable battery — true-wireless earbud with no detachable audio cable; only the charge cable detaches",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html",
      quote: "Compatible Bluetooth profiles: A2DP / AVRCP / HFP / HSP — HFP and the Making a call / Receiving a call sections evidence built-in microphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html",
      quote: "(no folding hinge or fold step appears anywhere in the help guide — an earbud stores in the charging case rather than folding; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000467221.html",
      quote: "Charging with liquid such as water or sweat or foreign objects such as dust attached to the USB Type-C port ... may cause an accident / Do not place the headset in water or use it in a humid place such as a bathroom.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html",
      quote: "Supported Codec (*3): SBC AAC",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000447703.html",
      quote: "Available operating time ... Bluetooth connection Music playback time ( AAC ): Max. 5.5 hours — no noise canceling function or Ambient Sound Mode row exists for this model, and no NC/AMB button is described",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000447703.html",
      quote: "Music playback time ( AAC ): Max. 5.5 hours / Music playback time ( SBC ): Max. 5 hours",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html",
      quote: "(null — Crinacle has no LinkBuds WF-L900 entry in its IEM or headphone ranking lists, and RTINGS' LinkBuds review publishes Enclosure/Transducer data but no Sound Signature, Bass Amount or Treble Amount verdict; no Tier-3 source measures it, so the protocol says null rather than inferring from marketing copy)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
