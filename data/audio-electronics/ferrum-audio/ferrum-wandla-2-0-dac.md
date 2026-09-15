---
product_id: "Pn6oyV4Ks5AcNbecjguCqf"
product_slug: "ferrum-wandla-2-0-dac"
brand: "Ferrum Audio"
name: "Ferrum WANDLA 2.0 DAC"
slice: "audio-electronics"
price: 319500
spec_fields:
  brand:
    - "ferrum-audio"
  customerRating: null
  condition: "new"
  inStock: null
  dealsDiscount: "none"
  newArrival: false
  awards:
    - "hificlube-dac-of-the-year-2023"
    - "headphone-show-dac-of-the-year-2023"
    - "eisa-award"
  deviceType: "dac"
  deviceConnectivity: "wired"
  formFactor: "desktop"
  dacIncluded: true
  balancedOutput: true
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
    - "aes-ebu"
    - "hdmi-earc"
    - "i2s-iis"
    - "rca"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "768 kHz / 32-bit"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
  dacChipsetFamily:
    - "ess-sabre"
  streamingPlatformSupport: null
  networkConnection: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs: null
  voiceAssistant: null
  multiroomSupport: null
  finishColor:
    - "black"
    - "rust"
  rackMountable19: false
  countryOfManufacture: "Poland"
source_urls:
  - "https://ferrum.audio/wandla/"
  - "https://ferrum.audio/wp-content/uploads/2025/02/WANDLA_2025.02.pdf"
  - "https://ferrum.audio/fantastic-news-from-portugal/"
  - "https://headphones.com/products/ferrum-wandla-dac"
  - "https://headphones.com/products/ferrum-wandla-dac-open-box"
  - "https://upscaleaudio.com/products/ferrum-wandla-dac-preamplifier"
  - "https://soundstagehifi.com/index.php/equipment-reviews/1850-ferrum-audio-wandla-digital-to-analog-converter-and-hypsos-power-supply"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (marketing-fact): `319500` cents ($3,195.00 USD) — both Upscale Audio ("Regular price $3,195") and Headphones.com ("Regular price $3,195") list the same regular price; the open-box listing shows a discounted $2,795, but that is a separate open-box SKU and not the new-product catalogue price.
- **brand** (hard-spec): `["ferrum-audio"]` — the manufacturer product page lists "Ferrum" / "Ferrum Audio" and the product title is "WANDLA — the converter".
- **customerRating** (editorial): `null` — no public customer-review aggregate is displayed on the manufacturer page or on audited retailer listings.
- **condition** (marketing-fact): `"new"` — Upscale Audio and Headphones.com list regular-price product pages with no open-box, B-stock, refurbished, or used indication.
- **inStock** (marketing-fact): `null` — Upscale Audio lists "In stock now!", while Headphones.com lists the product as "Back-order" / "Pre-pay to reserve" / "Join The Waitlist" (same-tier retailer conflict; see Conflict Notes).
- **dealsDiscount** (marketing-fact): `"none"` — the regular-price retailers show a single price with no sale, clearance, or discount callout; the open-box listing is a different condition/offer.
- **newArrival** (marketing-fact): `false` — product page and press references describe an established product line (WANDLA 2.0.0 firmware is a later update), with no "New Arrival" or launch callout.
- **awards** (editorial): `["hificlube-dac-of-the-year-2023", "headphone-show-dac-of-the-year-2023", "eisa-award"]` — Ferrum press release: "our flagship DAC WANDLA has clinched the prestigious HIFICLUBE.NET DAC OF THE YEAR 2023 award"; Headphones.com open-box product page: "Winner of The HEADPHONE Show's DAC of The Year in 2023 Award"; SoundStage! Hi-Fi review: "the Wandla DAC ... and, of course, another EISA victory" (exact EISA category/year not specified).
- **deviceType** (marketing-fact): `"dac"` — the manufacturer product page describes WANDLA as "WANDLA fully balanced DAC/PREAMP" and the WANDLA 2025 family manual calls it a "D/A Converter".
- **deviceConnectivity** (marketing-fact): `"wired"` — the product has USB, S/PDIF, AES/EBU, ARC, I2S and RCA analog inputs, plus XLR/RCA line outputs. No Bluetooth, Wi-Fi, or Ethernet/network connection is listed.
- **formFactor** (marketing-fact): `"desktop"` — the product page and manual list dimensions of "21.7 cm x 20.6 cm x 5 cm / 8.6″ x 8.1″ x 2.0″" and it is marketed as a desktop DAC/preamp.
- **dacIncluded** (hard-spec): `true` — the product page and manual list the "ESS Sabre ES9038PRO" DAC chip and "768 kHz/32-bit, DSD 512" resolution.
- **balancedOutput** (hard-spec): `true` — the product page states "Balanced XLR and unbalanced RCA line outputs" and "The analog signal path is truly balanced."
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated in `sanity-cms/schemaTypes/productType.ts` to the five amplifier/receiver `deviceType` values. WANDLA is a `dac`, so the amplification group does not apply.
- **inputs** (hard-spec): `["usb", "optical", "coaxial", "aes-ebu", "hdmi-earc", "i2s-iis", "rca"]` — WANDLA 2025 family manual and product page list: USB (up to PCM 768 kHz/32-bit, DSD 512, DoP 256), I2S (PS Audio® compatible), ARC (TV input with CEC), AES/EBU, optical S/PDIF, coaxial S/PDIF, and RCA analog input. ARC is mapped to `hdmi-earc` per the combined input vocabulary; I2S is mapped to `i2s-iis`.
- **outputs** (hard-spec): `null` — the `outputs` field is domain-gated to amplifier/receiver `deviceType` values in the current schema, even though the product has real balanced XLR and unbalanced RCA line outputs. This is a schema-domain limitation, not a missing spec.
- **maxSampleRateBitDepth** (hard-spec): `"768 kHz / 32-bit"` — product page and manual state "DAC resolution: 768 kHz/32-bit, DSD 512".
- **dsdSupport** (hard-spec): `"dsd256-plus"` — product page and manual state "DSD 512".
- **hiResCertification** (hard-spec): `["mqa"]` — product page and manual state "Includes MQA® decoder and renderer" and "MQA decoder and renderer on all digital inputs". No independent "Hi-Res Audio" certification mark is stated.
- **dacChipsetFamily** (hard-spec): `["ess-sabre"]` — product page and manual list "ESS Sabre ES9038PRO".
- **streamingPlatformSupport** (marketing-fact): `null` — the product supports Ferrum Streaming Control Technology (firmware update for WANDLA 2.0.0), but no named streaming platform (AirPlay 2, Chromecast, Spotify Connect, TIDAL Connect, Roon Ready, DLNA) is listed.
- **networkConnection** (marketing-fact): `null` — no Wi-Fi or Ethernet/network connection is listed on the product page or in the manual.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport**: `null` — `deviceConnectivity` is `wired`; the wireless/connectivity group does not apply.
- **finishColor** (editorial): `["black", "rust"]` — SoundStage! Hi-Fi review of WANDLA: "Rust-colored slabs of lacquered weathering steel, with inset illuminated Ferrum logos, form the left of the devices’ fasciae, while a black knob occupies their right side"; Headphones.com GoldenSound Edition review: "The chassis is the same matte black finish as the other Ferrum products, accented by the corten steel square and illuminated Ferrum logo".
- **rackMountable19** (marketing-fact): `false` — the product is marketed and dimensioned as a desktop unit; no 19" rack-mounting hardware or claim is found on the manufacturer page or in the manual.
- **countryOfManufacture** (marketing-fact): `"Poland"` — the Ferrum product page footer states "Ferrum is a new brand proudly made in Poland by parent company HEM"; SoundStage! Hi-Fi review: "The company’s name is inspired by the large deposits of iron ore found near its headquarters on the outskirts of Warsaw, Poland."

## Conflict / Caution Notes

- **Outputs schema-domain mismatch:** WANDLA has real balanced XLR and unbalanced RCA line outputs, but the current `outputs` field in `sanity-cms/schemaTypes/productType.ts` is domain-gated to `integrated-amplifier`, `power-amplifier`, `preamplifier`, `av-surround-receiver`, and `stereo-receiver` only. Because `deviceType` is `dac`, `outputs` is recorded as `null`; the real output connectors are documented in the notes instead.
- **In-stock conflict across same-tier retailers:** Upscale Audio lists WANDLA as "In stock now!", while Headphones.com lists it as "Back-order" / "Pre-pay to reserve" / "Join The Waitlist". Because these are same-tier audited retailers and they contradict each other, `inStock` is recorded as `null` and the conflict is documented rather than silently resolved.
- **Power consumption conflict across manufacturer sources:** The WANDLA product page states "Power consumption: 10 W idle, 15 W max", while the WANDLA 2025 family manual (section 15) states "12 W idle / 15 W max (WANDLA & WANDLA GoldenSound Edition)". This same-tier manufacturer conflict is recorded; power consumption is not a `should-be-audio-electronics.md` filter field.
