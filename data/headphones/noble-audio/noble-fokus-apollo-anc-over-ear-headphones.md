---
product_id: "xMEqvkRBbdrlJXyFG8j4QP"
product_slug: "noble-fokus-apollo-anc-over-ear-headphones"
brand: "Noble Audio"
name: "Noble FoKus Apollo ANC Over-Ear Headphones"
slice: "headphones"
spec_fields:
  productCategory:
    - "over-ear"
  wearingStyle:
    - "over-ear"
  acousticDesign:
    - "closed-back"
  fitType: null
  connectivity: "hybrid"
  portable: true
  awards:
    - "Ecoustics Editor's Award — Best of 2025"
  driverType:
    - "dynamic"
    - "planar-magnetic"
  impedanceOhms: null
  sensitivityDbMw: null
  freqResponseHz:
    min: 10
    max: 40000
  cableTermination:
    - "3.5mm"
    - "6.35mm"
    - "usb-c"
    - "4.4mm-balanced"
  detachableCable: true
  cableLengthM: null
  microphone: true
  foldable: false
  ipxRating: null
  bluetoothCodecs:
    - "LDAC"
    - "AAC"
    - "aptX"
    - "aptX HD"
    - "SBC"
  anc: "anc"
  batteryLifeHours:
    ancOff: 80
    ancOn: 60
  soundSignature: null
  requiresAmplifier: false
  driverConfigBucket: null
  driverConfigDetail: null
source_urls:
  - "https://nobleaudio.com/products/fokus-apollo"
  - "https://nobleaudio.prowly.com/343426-noble-announces-the-launch-of-its-fokus-apollo-anc-headphones-with-the-worlds-first-dynamic-planar-hybrid-driver-arrangement"
  - "https://www.ecoustics.com/reviews/noble-fokus-apollo/"
  - "https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones"
  - "https://audio46.com/products/noble-audio-fokus-apollo-wireless-over-ear-headphones"
  - "https://www.rtings.com/headphones/reviews/noble/fokus-apollo"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes
- **productCategory** (marketing-fact): "over-ear headphones" — Apos listing title and manufacturer page describe the FoKus Apollo as over-ear — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **wearingStyle** (marketing-fact): over-ear — same source as productCategory — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **acousticDesign** (marketing-fact): closed-back — no open/vented design language on the Apos listing or the manufacturer page; ANC/hybrid wireless design implies closed — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **fitType** (marketing-fact): null — not an IEM, field is inapplicable per `schema-headphones.md`
- **connectivity** (marketing-fact): "hybrid" — Bluetooth 5.3 plus "if you prefer a wired connection, the Apollo includes a 3.5mm auxiliary cable" — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **portable** (marketing-fact): true — EVA carrying case, 80-hour battery, marketed for travel and daily use — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **awards** (marketing-fact): "Winner of Ecoustic's editor award for best of 2025." — award applies to the same model, sourced from the review cited by the manufacturer — https://www.ecoustics.com/reviews/noble-fokus-apollo/
- **driverType** (hard-spec): "Driver arrangement: 1x 40mm dynamic driver + 1x 14.5mm planar magnetic driver" — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **impedanceOhms** (hard-spec): null — no impedance value in the Apos spec block, manufacturer product page, extracted manual, press release, Audio46, or measurement sources
- **sensitivityDbMw** (hard-spec): null — no sensitivity value in the Apos spec block, manufacturer product page, extracted manual, press release, Audio46, or measurement sources
- **freqResponseHz** (hard-spec): "Frequency Response: 10-40kHz" from the official Noble Audio launch press release — https://nobleaudio.prowly.com/343426-noble-announces-the-launch-of-its-fokus-apollo-anc-headphones-with-the-worlds-first-dynamic-planar-hybrid-driver-arrangement
- **cableTermination** (marketing-fact): "Whats included" lists 3.5mm auxiliary cable, USB-C charging cable, 1/4" adapter, 3.5mm to 4.4mm adapter; Audio46 confirms USB-C can be used for a direct connection — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones, https://audio46.com/products/noble-audio-fokus-apollo-wireless-over-ear-headphones
- **detachableCable** (marketing-fact): true — 3.5mm auxiliary cable and detachable boom mic are listed as separate, swappable accessories — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **cableLengthM** (hard-spec): null — no cable length stated in the Apos listing, manufacturer page, extracted manual, press release, or Audio46
- **microphone** (marketing-fact): true — "six microphones—three on each side" and "removable boom mic with onboard mute switch" — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **foldable** (marketing-fact): false — no fold/collapse/hinge language in the Apos listing or manufacturer page; the design is described as full-size
- **ipxRating** (marketing-fact): null — no IPX or water/sweat resistance rating claimed on the Apos listing, manufacturer page, extracted manual, or press release
- **bluetoothCodecs** (marketing-fact): "Supported codecs: LDAC, aptX, aptX HD, AAC, SBC" — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **anc** (marketing-fact): "anc" — "Hybrid ANC with reduction depth up to -35dB" — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **batteryLifeHours** (marketing-fact): {ancOff: 80, ancOn: 60} — "Playtime: 80 hours without ANC, 60 hours with ANC" — https://apos.audio/products/noble-fokus-apollo-anc-over-ear-headphones
- **soundSignature** (editorial): null — no measured sound-signature entry from Crinacle, ASR, or a readable RTINGS review
- **requiresAmplifier** (derived): false — derived from null impedance and sensitivity plus a Bluetooth ANC headphone with an internal amp
- **driverConfigBucket** (hard-spec): null — no schema enum value fits a full-size headphone with a two-driver hybrid arrangement
- **driverConfigDetail** (derived): null — depends on `driverConfigBucket`

## Conflict / Caution Notes
- This product is the same Noble FoKus Apollo model as `moXlkADK7m1DHgGwWwzwUF`; the listing is an Apos retailer variant with identical physical specifications.
- `aptX HD` is a real sourced codec but is missing from `sanity-cms/schemaTypes/productType.ts`'s `bluetoothCodecs` enum; it is recorded rather than force-fit.
- The live manufacturer product page is silent on `freqResponseHz`; the only same-tier source that states a value is the official launch press release, so it is used.
