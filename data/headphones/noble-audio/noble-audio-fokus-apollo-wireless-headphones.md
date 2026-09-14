---
product_id: "moXlkADK7m1DHgGwWwzwUF"
product_slug: "noble-audio-fokus-apollo-wireless-headphones"
brand: "Noble Audio"
name: "Noble Audio FoKus Apollo Wireless Headphones"
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
- **productCategory** (marketing-fact): "The FoKus Apollo is Noble's first forey into the world of over-ear headphones." — https://nobleaudio.com/products/fokus-apollo
- **wearingStyle** (marketing-fact): same over-ear language as productCategory — https://nobleaudio.com/products/fokus-apollo
- **acousticDesign** (marketing-fact): no open/vented design described on the manufacturer page, press release, Apos listing, or Audio46 listing; closed-back inferred by absence and by the ANC/hybrid wireless design — https://nobleaudio.com/products/fokus-apollo
- **fitType** (marketing-fact): null — not an IEM, so the field is inapplicable per `schema-headphones.md`
- **connectivity** (marketing-fact): "hybrid" because the product supports both Bluetooth 5.3 wireless and an included 3.5mm auxiliary cable for wired use — https://nobleaudio.com/products/fokus-apollo
- **portable** (marketing-fact): true — EVA carrying case, 80-hour battery, Bluetooth-first wireless design marketed for travel/office/gaming — https://nobleaudio.com/products/fokus-apollo
- **awards** (marketing-fact): "Winner of Ecoustic's editor award for best of 2025." — https://www.ecoustics.com/reviews/noble-fokus-apollo/
- **driverType** (hard-spec): "The world's first 1x40mm dynamic driver + 14.5mm planar magnetic hybrid driver speaker arrangement" — https://nobleaudio.com/products/fokus-apollo
- **impedanceOhms** (hard-spec): null — no impedance value published by the manufacturer product page, the extracted user manual, the launch press release, Apos, Audio46, or measurement sources
- **sensitivityDbMw** (hard-spec): null — no sensitivity value published by the manufacturer product page, the extracted user manual, the launch press release, Apos, Audio46, or measurement sources
- **freqResponseHz** (hard-spec): "Frequency Response: 10-40kHz" from the official Noble Audio launch press release — https://nobleaudio.prowly.com/343426-noble-announces-the-launch-of-its-fokus-apollo-anc-headphones-with-the-worlds-first-dynamic-planar-hybrid-driver-arrangement
- **cableTermination** (marketing-fact): accessories include 3.5mm auxiliary cable, USB-C cable, 1/4" (6.35mm) adapter, 3.5mm to 4.4mm balanced adapter; Audio46 confirms "Use the USB-C for a direct connection or the wired airplane adapter for zero-latency gaming (USB-C cable required)" — https://nobleaudio.com/products/fokus-apollo, https://audio46.com/products/noble-audio-fokus-apollo-wireless-over-ear-headphones
- **detachableCable** (marketing-fact): true — accessories list the 3.5mm auxiliary cable and detachable boom mic as separate, swappable items; manual describes plugging in Aux or USB-C cables — https://nobleaudio.com/products/fokus-apollo
- **cableLengthM** (hard-spec): null — no length stated for any included cable on the manufacturer page, in the extracted manual, the press release, Apos, or Audio46
- **microphone** (marketing-fact): true — "Integrated ADI chip combined with 3 microphones per side providing hybrid ANC" plus "Removable boom mic" and "Excellent call quality with or without the supplied boom mic attached"; Apos confirms six microphones and a detachable boom mic — https://nobleaudio.com/products/fokus-apollo
- **foldable** (marketing-fact): false — no fold/collapse/hinge language on the manufacturer page or in the extracted manual; the design is described as full-size cans without hinges
- **ipxRating** (marketing-fact): null — no IPX or water/sweat resistance rating claimed on the manufacturer page, in the extracted manual, the press release, Apos, or Audio46
- **bluetoothCodecs** (marketing-fact): "supported codecs include LDAC, AAC, aptX, aptX HD, SBC" — https://nobleaudio.com/products/fokus-apollo
- **anc** (marketing-fact): "anc" — "Integrated ADI chip combined with 3 microphones per side providing hybrid ANC with a reduction depth of up to -35db" — https://nobleaudio.com/products/fokus-apollo
- **batteryLifeHours** (marketing-fact): {ancOff: 80, ancOn: 60} — "80 hours of play time without ANC / 60 hours of play time with ANC" — https://nobleaudio.com/products/fokus-apollo
- **soundSignature** (editorial): null — no measured sound-signature entry from Crinacle, ASR, or a readable RTINGS review; manufacturer and review-site prose is not used as a Tier-3 source
- **requiresAmplifier** (derived): false — derived from null impedance and sensitivity plus a Bluetooth ANC headphone with an internal amp
- **driverConfigBucket** (hard-spec): null — no schema enum value fits a full-size headphone with a two-driver hybrid arrangement
- **driverConfigDetail** (derived): null — depends on `driverConfigBucket`

## Conflict / Caution Notes
- `aptX HD` is a real sourced codec but is missing from `sanity-cms/schemaTypes/productType.ts`'s `bluetoothCodecs` enum. The sourced value is recorded rather than force-fit.
- The manufacturer live product page does not state `freqResponseHz`; the official launch press release does. The press release is the only same-tier source that states a value, so it is used rather than leaving it null.
- `impedanceOhms` and `sensitivityDbMw` are genuinely unpublished across all checked manufacturer and audited-retailer sources, not search failures.
