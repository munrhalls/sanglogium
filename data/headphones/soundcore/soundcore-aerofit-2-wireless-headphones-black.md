---
product_id: "ZuUKzmkqDyQwdcwhxl9CGa"
product_slug: "soundcore-aerofit-2-wireless-headphones-black"
brand: "Soundcore"
name: "Soundcore Aerofit 2 Wireless Open-Ear Headphones (Black)"
slice: "headphones"
spec_fields:
  productCategory:
    - "true-wireless"
  wearingStyle: []
  acousticDesign:
    - "semi-open"
  fitType: null
  connectivity: "true-wireless"
  portable: true
  soundSignature: null
  impedanceOhms: 16
  sensitivityDbMw: null
  freqResponseHz:
    min: 20
    max: 40000
  requiresAmplifier: false
  microphone: true
  cableTermination: []
  detachableCable: false
  cableLengthM: null
  foldable: false
  ipxRating: "IPX5"
  bluetoothCodecs:
    - "LDAC"
  anc: "none"
  batteryLifeHours:
    ancOff: 10
    ancOn: null
  driverType:
    - "dynamic"
  driverConfigBucket: "single-dynamic"
  driverConfigDetail: "1 × 20 × 11.5mm dynamic driver (per earbud)"
  awards: []
source_urls:
  - "https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds"
  - "https://cdn.cs.1worldsync.com/8d/a8/8da8ac73-f29e-47f2-8b81-2ad284d1f9fd.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes
- **productCategory** (marketing-fact): "soundcore AeroFit 2 with Adjustable Fit | True-Wireless Earbuds" and breadcrumb "Open Ear" — product is marketed as a true-wireless earbud — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **wearingStyle** (marketing-fact): the product page describes "Open-Ear with Ear Hook" and "open-ear headphones"; the closed vocabulary (over-ear / on-ear / in-ear) does not include open-ear, so recorded as an empty array — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **acousticDesign** (marketing-fact): "Design: Open-Ear with Ear Hook" and "Open-Ear Design, Pressure-Free Comfort" — open-ear earbuds leave the ear canal unsealed, mapping to the closed vocabulary "semi-open" — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **fitType** (marketing-fact): not an IEM; null per the field convention — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **connectivity** (marketing-fact): "True-Wireless Earbuds" and "wireless Hi-Res audio"; no wired/AUX mode is listed — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **portable** (marketing-fact): "Hit the outdoors", charging case provides up to 42 hours total playtime, and "all-day comfort" positioning — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **soundSignature** (editorial): null — no Crinacle, ASR, or RTINGS dedicated measurement or sound-signature label found for this model
- **impedanceOhms** (hard-spec): "Impedance 16Ω" — soundcore AeroFit 2 User Guide (A3874) — https://cdn.cs.1worldsync.com/8d/a8/8da8ac73-f29e-47f2-8b81-2ad284d1f9fd.pdf
- **sensitivityDbMw** (hard-spec): null — no sensitivity (dB/mW) figure is listed on the product page or in the user guide
- **freqResponseHz** (hard-spec): "Frequency response 20~20kHz (20~40kHz when LDAC is enabled)" — soundcore AeroFit 2 User Guide (A3874); max recorded as 40000 Hz because LDAC is a supported feature on the product page — https://cdn.cs.1worldsync.com/8d/a8/8da8ac73-f29e-47f2-8b81-2ad284d1f9fd.pdf
- **requiresAmplifier** (derived): false — 16Ω low-impedance wireless earbud; no dedicated amplifier required
- **microphone** (marketing-fact): "Calls: 4 Mics with AI" and "With 4 mics and AI-driven noise reduction, your voice stays clear while background sounds fade" — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **cableTermination** (marketing-fact): true-wireless earbuds; no headphone cable or termination connector is supplied, listed, or referenced (boolean feature-absence rule applied) — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **detachableCable** (marketing-fact): false — true-wireless earbuds with no cable to detach (boolean feature-absence rule applied) — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **cableLengthM** (hard-spec): null — true-wireless earbuds; no audio cable ships with the product
- **foldable** (marketing-fact): false — open-ear earbuds with no folding hinge, folded position, or fold step described (boolean feature-absence rule applied) — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **ipxRating** (marketing-fact): "Water Resistance: IP55" and "IP Rating: IP55" — source states the full IP55 code; the water/sweat component (second digit) is 5, so recorded as "IPX5" — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **bluetoothCodecs** (hard-spec): "LDAC" and "LDAC enables the transmission of audio content at the maximum bitrate of 990kbps" — only LDAC is explicitly named; SBC/AAC are not stated — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **anc** (marketing-fact): "none" — the product is marketed as open-ear, relying on the unsealed design; no active, passive, or noise-cancelling claim appears (boolean feature-absence rule applied) — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **batteryLifeHours** (marketing-fact): "Listen all day with 10 hours of battery life per charge, and up to 42 hours with the case" and spec table "Playtime: 10H/42H" — no ANC feature is offered, so ancOn is null — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **driverType** (hard-spec): "20 x 11.5mm Drivers" and user guide "Driver unit 20*11.5mm" — single dynamic driver per earbud — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
- **driverConfigBucket** (hard-spec): single-dynamic — one dynamic driver per earbud
- **driverConfigDetail** (derived): "1 × 20 × 11.5mm dynamic driver (per earbud)" — derived from the driver unit stated on the product page
- **awards** (marketing-fact): [] — no award, Editors' Choice badge, or named recognition is claimed for this SKU on the product page (boolean feature-absence rule applied) — https://www.soundcore.com/products/a3874-aerofit-2-open-earbuds
