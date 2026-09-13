// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-final.md
// for the per-field table and full citation trail this was transcribed from.
//
// Original ZE8000 (not the Mk2). True-wireless in-ear: wired-only fields
// (cableTermination, detachableCable, cableLengthM, foldable, acousticDesign,
// awards) are nulled — the schema's own descriptions mark them as
// not-applicable for this product class.
//
// impedanceOhms / sensitivityDbMw / freqResponseHz are null: Final publishes
// none of the three. The manufacturer's own ZE8000 spec block carries only 5
// lines (connectivity / codecs / playtime / charge time / IPX4) — no
// impedance, sensitivity, driver or frequency-response line — and the
// downloadable owner's manual has no spec table at all. An exhausted null
// under the protocol's widened tier order, not an early stop.
//
// soundSignature is null: exhausted per sourcing-protocol-headphones.md
// Tier 3 — no Crinacle ranking/graph/review post, no ASR measurement and no
// Rtings review exists for the ZE8000 (all three audited via sitemap and
// on-site search). Tier 3 has no fallback source in the protocol, so the only
// compliant value is null — never inferred from Final's "8K Sound" marketing
// copy or from retailer prose.

export default {
  productId: "moXlkADK7m1DHgGwWx071u",
  brand: "Final Audio",
  name: "ZE8000",
  beadsIssue: "sang-logium-1xs.9.15",

  filterAttributes: {
    productCategory: ["true-wireless"], // ZE Series wireless earphone / TWS product page
    wearingStyle: ["in-ear"], // earphone; retailer classification "In-Ear Headphones"
    acousticDesign: null, // domain-gated to over-ear — not applicable to a TWS IEM
    fitType: "universal", // supplied silicone earpieces in 5 sizes; no custom-fit option
    connectivity: "true-wireless", // Bluetooth 5.2, no wired fallback supplied
    portable: true, // TWS with charging case — inherently portable
    soundSignature: null, // exhausted Tier 3 (no Crinacle/ASR/Rtings measurement) — see header
    impedanceOhms: null, // exhausted — not published by Final anywhere (page, manual)
    sensitivityDbMw: null, // exhausted — not published by Final anywhere (page, manual)
    freqResponseHz: null, // exhausted — Final publishes no FR range for ZE8000 anywhere
    microphone: true, // "beamforming algorithm empowered by MEMS microphones for crystal clear phone calls"
    cableTermination: null, // not applicable — true-wireless, no cable
    detachableCable: null, // not applicable — true-wireless, no cable
    cableLengthM: null, // not applicable — true-wireless (schema: "Null when not applicable")
    foldable: null, // not applicable — no folding hinge on an earbud
    ipxRating: "IPX4", // "Water Resistant: IPX4"
    bluetoothCodecs: ["SBC", "AAC", "aptX", "aptX Adaptive"], // "Codec Supported: SBC, AAC, Qualcomm aptX, aptX Adaptive"
    anc: "anc", // "noise canceling without any negative effects on the sound"; ANC + ambient modes
    batteryLifeHours: { ancOff: 5, ancOn: 5 }, // "5 hours, Up to 15 hours with charging case"
    driverType: ["dynamic"], // "13mm equivalent ultra-low distortion dynamic driver ... for 8K SOUND"
    awards: null, // no award citation found for this SKU
    driverConfigBucket: "single-dynamic", // one 13mm-equivalent dynamic driver per earbud
    driverConfigDetail: "1DD", // derived from the same source as driverConfigBucket
  },

  sourcing: [
    {
      field: "driverType",
      url: "https://audio46.com/products/final-audio-ze8000-true-wireless-earphones",
      quote: "超高精度＆超低歪ドライバー「f-CORE for 8K SOUND」搭載 ... 完全ワイヤレスイヤホンでは異例の直径13mm相当の大口径振動板",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverConfigBucket",
      url: "https://audio46.com/products/final-audio-ze8000-true-wireless-earphones",
      quote: "超高精度＆超低歪ドライバー「f-CORE for 8K SOUND」搭載 ... 完全ワイヤレスイヤホンでは異例の直径13mm相当の大口径振動板",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://final-inc.com/products/ze8000-jp",
      quote: "対応コーデック SBC, AAC, Qualcomm® aptX ™, aptX ™ Adaptive",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://final-inc.com/products/ze8000-jp",
      quote: "防水性能 IPX4",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://final-inc.com/products/ze8000-jp",
      quote:
        "連続音楽再生時間 Up to 5 hours / Case included: Up to 15 hours * Fast charge: 45 minutes music playback in 5 minutes",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://final-inc.com/products/ze8000-jp",
      quote: "通信方式 Bluetooth® 5.2",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://final-inc.com/products/ze8000-jp",
      quote: "ノイズキャンセリング／外音取り込みの4つのモード切り替え",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://audio46.com/products/final-audio-ze8000-true-wireless-earphones",
      quote: "ビームフォーミング機能搭載 高性能マイクを２機、距離を離して配置することにより、口元へのビームフォーミングを可能にしています",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://final-inc.com/products/ze8000-jp",
      quote: "PRODUCTS ワイヤレスイヤホン ZE series — ZE8000 (完全ワイヤレスイヤホン)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://audio46.com/products/final-audio-ze8000-true-wireless-earphones",
      quote: "Final Audio ZE8000 True Wireless Earphones — category: In-Ear Headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://audio46.com/products/final-audio-ze8000-true-wireless-earphones",
      quote:
        "IPX4 Water Resistance Rating for sport and active lifestyles ... Up to 15 hours with charging case",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "fitType",
      url: "https://final-inc.com/products/ze8000-jp",
      quote: "付属品：充電ケース / ZE8000専用イヤーピース SS/S/M/L/LLサイズ / USBタイプC 充電用ケーブル / アコースティック治具 / ダストフィルター",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://final-inc.com/products/ze8000-jp",
      quote:
        "(entire manufacturer Specs block read in full — only 5 lines: Bluetooth 5.2 / codecs / playtime / charge time / IPX4. No impedance line; confirmed absent from the owner's manual too — exhausted NULL)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://final-inc.com/products/ze8000-jp",
      quote:
        "(entire manufacturer Specs block read in full — no sensitivity line; confirmed absent from the owner's manual too — exhausted NULL)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://final-inc.com/products/ze8000-jp",
      quote:
        "(entire manufacturer Specs block read in full — no frequency-response line; confirmed absent from the owner's manual too — exhausted NULL)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://docs/filters-sort/sourcing-protocol-headphones.md",
      quote:
        "(exhausted Tier 3: no Crinacle rankings/graph/individual review post, no ASR measurement, no Rtings review for ZE8000 — all three audited via sitemap + on-site search on 2026-09-13; the protocol defines no Tier-3 fallback, so NULL rather than inferred from marketing copy)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://docs/filters-sort/schema-headphones.md",
      quote:
        "(field vocab is over-ear-oriented (open-back/closed-back/semi-open); not applicable to a true-wireless in-ear — left null rather than guessed)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://final-inc.com/products/ze8000-jp",
      quote: "(true-wireless only — no cable supplied and none accepted; field not applicable)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://final-inc.com/products/ze8000-jp",
      quote: "(true-wireless only — no cable supplied; field not applicable)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://docs/filters-sort/schema-headphones.md",
      quote:
        "(true-wireless — schema marks cableLengthM null when not applicable, e.g. true-wireless)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://final-inc.com/products/ze8000-jp",
      quote:
        "(no folding/collapsing mechanism — not applicable to an earbud; boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "awards",
      url: "https://final-inc.com/products/ze8000-jp",
      quote: "(no award or recognition citation found for this SKU — exhausted NULL)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
