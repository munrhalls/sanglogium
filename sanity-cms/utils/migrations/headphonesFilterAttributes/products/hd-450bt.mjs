// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md §6
// for the full per-field table this was transcribed from.
//
// The US store path 404s for this end-of-life model, so the manufacturer
// global/EOL page supplied the spec table.
//
// impedanceOhms is null but sensitivityDbMw is NOT: the spec table publishes
// "Sound pressure level (SPL): 108 dB (1 kHz, 0 dBFS)" — a real, cited
// manufacturer figure (a digital-input basis, not a per-mW figure, which is
// why impedance genuinely is not applicable/published for an active BT model).
//
// cableLengthM is 1.5 m (the supplied 3.5 mm analogue cable), and the codec
// list is "AptX™, AptX™ Low Latency, AAC, SBC" verbatim.

export default {
  productId: "k27n1AQuIbSr5iozG2ivGf",
  brand: "Sennheiser",
  name: "HD 450BT",
  beadsIssue: "sang-logium-1xs.9.2.6",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"], // "Ear coupling: Around ear"
    acousticDesign: ["closed-back"], // closed, noise-isolating over-ear design
    connectivity: "wireless", // "Bluetooth" (5.0); analogue cable also supplied for wired use
    portable: true, // marketed for travel/commute, foldable, with carry case
    driverType: ["dynamic"],
    sensitivityDbMw: 108, // "108 dB (1 kHz, 0 dBFS)" — digital-input basis
    freqResponseHz: { min: 18, max: 22000 }, // "18 Hz to 22,000 Hz"
    cableTermination: ["3.5mm"], // "Adapter: 3.5mm, angled"
    detachableCable: false, // supplied analogue cable is fixed, not user-detachable
    cableLengthM: 1.5, // "Cable length: 1.5m"
    microphone: true, // "Microphone pick-up pattern: Dual Beamforming"
    foldable: true, // "Foldable design" + supplied carry case
    anc: "anc", // "Active Noise Cancellation: True"
    bluetoothCodecs: ["aptX", "aptX LL", "AAC", "SBC"], // schema vocab: "aptX LL" == "AptX™ Low Latency"
    batteryLifeHours: { ancOn: 30, ancOff: 30 }, // "Operating time: 30 hrs" (not stated separately per ANC state)
    // impedanceOhms intentionally omitted — null; no analogue impedance published (active BT model).
    // soundSignature intentionally omitted — no Tier 3 measured entry exists.
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Ear coupling: Around ear (over-ear form factor)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Sound pressure level (SPL): 108 dB (1 kHz, 0 dBFS)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Frequency response (speaker): 18 Hz to 22,000 Hz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Transducer principle: dynamic",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Cable length: 1.5m",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Ear coupling: Around ear / Wearing style: Around-ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "closed, noise-isolating over-ear design",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Bluetooth profiles: AVRCP, A2DP, HFP, HSP / Adapter: 3.5mm, angled",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Adapter: 3.5mm, angled",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "(supplied analogue cable is fixed, not user-detachable; no detachable-cable claim on the manufacturer page)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "marketed for travel/commute; foldable design with supplied carry case",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Microphone pick-up pattern: Dual Beamforming / Frequency response (microphone): 80 Hz to 6,000 Hz",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Foldable design / supplied carry case",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Active Noise Cancellation: True",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Bluetooth Audio Codec: AptX™, AptX™ Low Latency, AAC, SBC",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://sennheiser-hearing.com/p/hd-450bt/",
      quote: "Operating time: 30 hrs",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
