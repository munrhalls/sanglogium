---
product_id: "Pn6oyV4Ks5AcNbecjkSwUK"
product_slug: "cambridge-audio-dacmagic-100"
brand: "Cambridge Audio"
name: "Cambridge Audio DacMagic 100"
slice: "audio-electronics"
price: 14900
spec_fields:
  brand: "cambridge-audio"
  customerRating: null
  condition: "new"
  inStock: true
  dealsDiscount: "none"
  newArrival: false
  awards: []
  deviceType: "dac"
  deviceConnectivity: "wired"
  formFactor: "desktop"
  dacIncluded: true
  balancedOutput: false
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "24-bit / 192 kHz"
  dsdSupport: "none"
  hiResCertification: []
  dacChipsetFamily: null
  streamingPlatformSupport: []
  networkConnection: []
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs: null
  voiceAssistant: null
  multiroomSupport: null
  finishColor: null
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://www.realaudio.eu/sites/default/files/downloads/dacmagic_100_user_manual_english.pdf"
  - "https://www.cambridgeaudio.com/usa/en/products/hi-fi/dacmagic/dacmagic100"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **brand** (hard-spec): `cambridge-audio` — manual identifies the brand as Cambridge Audio; Sanity store record uses `cambridge-audio` as the brand slug.
- **customerRating** (internal): `null` — store-computed field; no customer-review aggregate was individually sourced.
- **condition** (marketing-fact): `new` — product record shows a regular new-item price of $149.00 with no open-box/refurbished indication.
- **inStock** (internal): `true` — Sanity product record `_id` Pn6oyV4Ks5AcNbecjkSwUK shows `stock: 25`, `reservedStock: 0`.
- **dealsDiscount** (internal): `none` — no sale or clearance callout; the listed price is the regular price.
- **newArrival** (internal): `false` — product was launched in 2012/2017; not a new arrival.
- **awards** (marketing-fact): `[]` — no named awards or editor's-choice recognitions were found in the manufacturer manual or product page.
- **deviceType** (marketing-fact): `dac` — manual title: "Digital to Analogue Converter"; the `should-be-audio-electronics.md` product-category list does not include a combined DAC/headphone-amp, so the single best fit is `dac`.
- **deviceConnectivity** (marketing-fact): `wired` — all inputs are wired (USB Type B, Toslink, two S/P DIF coaxial); no Bluetooth or network connectivity is listed.
- **formFactor** (legacy): `desktop` — manual gives chassis dimensions 46 x 106 x 130mm; requires an external 12V PSU.
- **dacIncluded** (legacy): `true` — product is a digital-to-analogue converter; manual states "Wolfson WM8742 24-bit DAC".
- **balancedOutput** (legacy): `false` — manual "Rear panel connections" states "Audio outputs — Single-ended conventional stereo outputs for connection to the line-level Phono/RCA inputs of an amplifier"; no balanced XLR output is mentioned.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — domain-gated in `sanity-cms/schemaTypes/productType.ts` to the five amplifier/receiver `deviceType` values; with `deviceType: dac` these fields do not apply.
- **inputs** (hard-spec): `["usb", "optical", "coaxial"]` — manual: "Three digital inputs are fitted (2x S/P DIF and 1x TOSLINK) ... In addition, a USB input".
- **maxSampleRateBitDepth** (hard-spec): `24-bit / 192 kHz` — manual technical specifications: "Digital input word widths supported ... 16/24-bit" and "Digital input sampling frequencies supported ... 32kHz, 44.1kHz, 48kHz, 88.2kHz, 96kHz, 192kHz"; USB 2.0 supports "16/24-bit ... 192kHz".
- **dsdSupport** (hard-spec): `none` — manual does not list DSD support; the product specifications in the Sanity record explicitly state "no DSD, DXD, or MQA".
- **hiResCertification** (marketing-fact): `[]` — no MQA, Hi-Res Audio, or other named certification is stated in the manual.
- **dacChipsetFamily** (marketing-fact): `null` — manual states "Wolfson WM8742 24-bit DAC". The audio-electronics schema's `dacChipsetFamily` enum (`ess-sabre`, `akm`, `cirrus-logic`, `r2r-ladder`) does not include a Wolfson value, and the source is not mapped to another entry.
- **streamingPlatformSupport** (marketing-fact): `[]` — no AirPlay 2, Chromecast, Spotify Connect, TIDAL Connect, Roon Ready, or DLNA support is listed.
- **networkConnection** (marketing-fact): `[]` — no Wi-Fi or Ethernet network connection is listed.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — not a turntable; domain-gated to `deviceType: turntable`.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport**: `null` — `deviceConnectivity` is `wired`; these fields are domain-gated to `bluetooth`, `wifi-networked`, or `wired-wireless`.
- **finishColor** (hard-spec): `null` — the opened official manual does not state colour. Manufacturer product page and major retailer search results show "Black or silver", but direct fetching of the product page was blocked and an opened source confirming the exact colours for this product was not obtained.
- **rackMountable19** (marketing-fact): `false` — desktop chassis with no 19" rack-mounting callout; silence on this marketable feature is read as absence.
- **countryOfManufacture** (hard-spec): `null` — no "Made in ..." or country-of-manufacture statement was found in the opened official manual or accessible product-page text.

## Conflict / Caution Notes

- **DAC chipset family gap:** the source explicitly names a Wolfson WM8742 24-bit DAC, which has no matching value in the current `dacChipsetFamily` enum (`ess-sabre`, `akm`, `cirrus-logic`, `r2r-ladder`). The field is recorded as `null` rather than inventing a mapping.
- **Finish colour unverified:** the manufacturer product page and several retailer listings (e.g. Crutchfield, Cambridge Audio GBR/USA product pages) list the DacMagic 100 as available in "Black or silver", but these pages could not be directly opened during this sourcing pass. The field is left `null` to avoid an unverified value.
- **Sanity legacy data mismatch:** the existing `filterAttributes` for this product include `outputs: ["4.4mm"]`, `inputs: ["usb", "optical", "coaxial", "rca"]`, and `deviceType: "dac-amp-combo"`. The manufacturer manual confirms only unbalanced RCA line output, digital inputs (not RCA analogue input), and the product is a standalone DAC, so these legacy values have been corrected in this sourced record.
