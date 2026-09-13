// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-focal.md
// (product 2) for the full per-field table and citation trails this was
// transcribed from.
//
// impedanceOhms / sensitivityDbMw are null: Focal publishes neither for this
// powered/ANC model on the product page or in the full user manual (both read
// in full) — an exhausted null, not an early stop.
//
// Two flagged schema gaps on this product: cableTermination needs `usb-c`
// (Bathys' USB-DAC input) which the field's closed vocabulary lacks, and
// batteryLifeHours' {ancOn, ancOff} pair cannot represent Focal's third
// listening-mode autonomy figure.

export default {
  productId: "moXlkADK7m1DHgGwWtX5bB",
  brand: "Focal",
  name: "Bathys",
  beadsIssue: "sang-logium-1xs.9.5.2",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    fitType: null,
    connectivity: "wireless", // FLAG — also has wired jack + USB-DAC fallback; primary mode is wireless
    portable: true,
    microphone: true, // 8 mics, explicit in page + manual
    cableTermination: ["3.5mm", "usb-c"], // usb-c outside the documented closed vocabulary — flagged
    detachableCable: true,
    cableLengthM: 1.2, // analog jack cable; USB-C cable is also 1.2m
    foldable: false, // FLAG — hard case + earcup rotation only; absence-based
    ipxRating: null,
    bluetoothCodecs: ["SBC", "AAC", "aptX", "aptX Adaptive"],
    anc: "anc", // Silent / Soft / Transparent modes
    batteryLifeHours: { ancOff: 35, ancOn: 30 }, // jack mode / Bluetooth-ANC; USB-DAC 42h not representable — flagged
    driverType: ["dynamic"],
    impedanceOhms: null, // exhausted — powered model, Focal publishes none
    sensitivityDbMw: null, // exhausted — powered model, Focal publishes none
    freqResponseHz: { min: 15, max: 22100 },
    awards: null,
    driverConfigBucket: null, // domain-gated to IEM
    driverConfigDetail: null,
    soundSignature: null, // exhausted: absent from Crinacle rankings + no Crinacle post + no ASR/Rtings measurement
  },

  sourcing: [
    {
      field: "freqResponseHz",
      url: "https://www.focal.com/products/bathys",
      quote: "Frequency response (+/- 3dB) : 15 Hz - 22 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.focal.com/products/bathys",
      quote: "Loudspeakers : 15/8\" (40mm) Aluminium/Magnesium ‘M’-shaped dome",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://dam.focal-naim.com/m/27830ac90e411d8/original/Notice_Bathys-pdf.pdf",
      quote: "Cables and connectors 1.2m mini-jack / 1.2m USB Type-C®",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.focal.com/products/bathys",
      quote: "Product type : Bluetooth closed headphones with active noise reduction",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://dam.focal-naim.com/m/27830ac90e411d8/original/Notice_Bathys-pdf.pdf",
      quote: "Type Closed-back headphones, active, noise cancelling",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://www.focal.com/products/bathys",
      quote: "Bathys — circum-aural Bluetooth closed headphones (carrying case 24x21x7cm)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.focal.com/products/bathys",
      quote: "Bluetooth® 5.1 Multipoint + Bluetooth Codec : AAC, aptX™, aptX™ Adaptive, SBC (wireless primary; jack and USB-DAC fallbacks also supplied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.focal.com/products/bathys",
      quote: "With its wireless and active noise cancelling (ANC) technologies, Bathys is the perfect travel companion",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://www.focal.com/products/bathys",
      quote: "Microphones : 8.0000",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://www.focal.com/products/bathys",
      quote: "Connector : Jack 3.5 mm, USB-C",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://dam.focal-naim.com/m/27830ac90e411d8/original/Notice_Bathys-pdf.pdf",
      quote: "To use the headphones with the jack mode, you must use the jack cable supplied in the pack. Connect the cable to the jack input on the right-hand earcup",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://dam.focal-naim.com/m/27830ac90e411d8/original/Notice_Bathys-pdf.pdf",
      quote: "(hard carrying case described; no folding/collapsing hinge anywhere — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://www.focal.com/products/bathys",
      quote: "Bluetooth Codec : AAC, aptX™, aptX™ Adaptive, SBC",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.focal.com/products/bathys",
      quote: "Active noise cancelling : Yes (Silent, Soft or Transparent mode)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.focal.com/products/bathys",
      quote: "Battery Autonomy : 30h in Bluetooth 35h with mini Jack connection 42h in USB-DAC mode",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://www.focal.com/products/bathys",
      quote: "(entire Sound - Acoustics / Sound - Electronics block read in full: no impedance line; confirmed absent from the manual spec table too — exhausted NULL)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://www.focal.com/products/bathys",
      quote: "(entire Sound - Acoustics / Sound - Electronics block read in full: no sensitivity line; confirmed absent from the manual spec table too — exhausted NULL)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
  ],
};
