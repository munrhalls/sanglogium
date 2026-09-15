---
product_id: "n10eAegrGspodtsQvy4b6u"
product_slug: "ferrum-wandla-dac---goldensound-edition"
brand: "Ferrum Audio"
name: "Ferrum WANDLA DAC - GoldenSound Edition"
slice: "audio-electronics"
price: 329500
spec_fields:
  brand:
    - "ferrum-audio"
  customerRating: null
  condition: "new"
  inStock: null
  dealsDiscount: "none"
  newArrival: false
  awards: []
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
  hiResCertification: []
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
  - "https://ferrum.audio/wandla-goldensound-edition/"
  - "https://ferrum.audio/wp-content/uploads/2024/09/WANDLA_2024.09.pdf"
  - "https://ferrum.audio/wp-content/uploads/2025/02/WANDLA_2025.02.pdf"
  - "https://goldensound.audio/2024/03/03/ferrum-wandla-goldensound-edition/"
  - "https://headphones.com/blogs/reviews/ferrum-wandla-goldensound-edition-measurements-discussion"
  - "https://upscaleaudio.com/products/ferrum-wandla-2-0-goldensound-edition-dac-preamplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (marketing-fact): `329500` cents ($3,295.00 USD) — GoldenSound announcement: "It will retail for $3295 exclusively at headphones.com". The catalogue price matches this launch price.
- **brand** (hard-spec): `["ferrum-audio"]` — the manufacturer product page lists "Ferrum" / "Ferrum Audio" and the product title is "WANDLA GoldenSound Edition by Ferrum".
- **customerRating** (editorial): `null` — no public customer-review aggregate is displayed on the manufacturer page, GoldenSound announcement, or on the audited retailer listings for the original GoldenSound Edition.
- **condition** (marketing-fact): `"new"` — the GoldenSound announcement describes a new collaboration product sold at launch for $3,295 with no open-box, B-stock, refurbished, or used indication.
- **inStock** (marketing-fact): `null` — the original GoldenSound Edition was an exclusive launch product and the manufacturer page now says "Wandla GoldenSound Gen 2 is now available – Please visit the latest model"; no current audited retailer listing for the original edition confirms stock. The later Gen 2 listing at Upscale Audio is a different model (see Conflict Notes).
- **dealsDiscount** (marketing-fact): `"none"` — the GoldenSound announcement lists a single launch price of $3,295 with no sale, clearance, or discount callout.
- **newArrival** (marketing-fact): `false` — the product was announced in March 2024 and the current manufacturer page points to the newer Gen 2, so it is no longer a new arrival.
- **awards** (editorial): `[]` — no named awards, editor's-choice badges, or recognition callouts are found on the manufacturer product page, the GoldenSound announcement, or the audited retailer listings specifically for the GoldenSound Edition.
- **deviceType** (marketing-fact): `"dac"` — the manufacturer product page describes the product as "WANDLA GoldenSound Edition, fully balanced DAC/PREAMP" and the WANDLA 2024/2025 family manuals call it a "D/A Converter" family member.
- **deviceConnectivity** (marketing-fact): `"wired"` — the product has USB, S/PDIF, AES, ARC, I2S and RCA analog inputs, plus XLR/RCA line outputs. No Bluetooth, Wi-Fi, or Ethernet/network connection is listed.
- **formFactor** (marketing-fact): `"desktop"` — the product page and manual list dimensions of "21.7 cm x 20.6 cm x 5 cm / 8.6″ x 8.1″ x 2.0″" and weight "1.8 kg / 3.97 lbs"; it is marketed as a desktop DAC/preamp.
- **dacIncluded** (hard-spec): `true` — the product page and manuals list the "ESS Sabre ES9038PRO" DAC chip and "768 kHz / 32 bit, DSD 512" resolution.
- **balancedOutput** (hard-spec): `true` — the product page states "Balanced XLR and unbalanced RCA line outputs" and "Truly Balanced".
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated in `sanity-cms/schemaTypes/productType.ts` to the five amplifier/receiver `deviceType` values. The GoldenSound Edition is filed as a `dac`, so the amplification group does not apply.
- **inputs** (hard-spec): `["usb", "optical", "coaxial", "aes-ebu", "hdmi-earc", "i2s-iis", "rca"]` — WANDLA 2024/2025 family manuals and product page list: USB Type-C, I2S (PS Audio® compatible), ARC, AES, coaxial S/PDIF, optical S/PDIF, and RCA analog input. ARC is mapped to `hdmi-earc` and I2S to `i2s-iis` per the combined input vocabulary.
- **outputs** (hard-spec): `null` — the `outputs` field is domain-gated to amplifier/receiver `deviceType` values in the current schema, even though the product has real balanced XLR and unbalanced RCA line outputs. This is a schema-domain limitation.
- **maxSampleRateBitDepth** (hard-spec): `"768 kHz / 32-bit"` — product page and manuals state "DAC resolution: 768 kHz / 32 bit, DSD 512".
- **dsdSupport** (hard-spec): `"dsd256-plus"` — product page and manuals state "DSD 512".
- **hiResCertification** (hard-spec): `[]` — the WANDLA 2024 manual (section 9) and GoldenSound announcement explicitly state "MQA feature is not available in the WANDLA GoldenSound Edition" and "No MQA". No independent "Hi-Res Audio" certification mark is stated for this edition, so the certification array is recorded as empty rather than inventing a value.
- **dacChipsetFamily** (hard-spec): `["ess-sabre"]` — product page and manuals list "ESS Sabre ES9038PRO".
- **streamingPlatformSupport** (marketing-fact): `null` — no named streaming platform (AirPlay 2, Chromecast, Spotify Connect, TIDAL Connect, Roon Ready, DLNA) is listed; the product uses Ferrum's own digital-filter and control firmware.
- **networkConnection** (marketing-fact): `null` — no Wi-Fi or Ethernet/network connection is listed on the product page or in the manuals.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — the product is not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport**: `null` — `deviceConnectivity` is `wired`; the wireless/connectivity group does not apply.
- **finishColor** (editorial): `["black", "rust"]` — Headphones.com GoldenSound Edition review: "The chassis is the same matte black finish as the other Ferrum products, accented by the corten steel square and illuminated Ferrum logo"; the same review describes the "textured brown finish thanks to the corten steel".
- **rackMountable19** (marketing-fact): `false` — the product is marketed and dimensioned as a desktop unit; no 19" rack-mounting hardware or claim is found on the manufacturer page or in the manuals.
- **countryOfManufacture** (marketing-fact): `"Poland"` — the Ferrum product page footer states "Ferrum is a new brand proudly made in Poland by parent company HEM"; SoundStage! Hi-Fi review: "The company’s name is inspired by the large deposits of iron ore found near its headquarters on the outskirts of Warsaw, Poland."

## Conflict / Caution Notes

- **Model and price conflict — original GoldenSound Edition vs. Gen 2:** The original WANDLA GoldenSound Edition (this product) is described by Ferrum as "WANDLA GoldenSound Edition" and was announced at $3,295 exclusively at headphones.com. The current Upscale Audio listing is "Ferrum WANDLA 2.0 GoldenSound Edition DAC/Preamplifier" at $3,695 and is a different, later model (Gen 2). The manufacturer page for the original now says "Wandla GoldenSound Gen 2 is now available – Please visit the latest model". The $3,295 launch price is used here because it matches the catalogue identity of the original GoldenSound Edition.
- **Outputs schema-domain mismatch:** The GoldenSound Edition has real balanced XLR and unbalanced RCA line outputs, but the current `outputs` field in `sanity-cms/schemaTypes/productType.ts` is domain-gated to the five amplifier/receiver `deviceType` values. Because `deviceType` is `dac`, `outputs` is recorded as `null`; the real output connectors are documented in the notes instead.
- **MQA explicitly absent:** Unlike the standard WANDLA and WANDLA HP, the GoldenSound Edition does not decode or render MQA. This is recorded as `hiResCertification: []` because the product is a DAC (the field is applicable) but the only listed certification option (MQA) is explicitly unavailable for this edition.
