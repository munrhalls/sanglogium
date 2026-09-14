---
product_id: "MrEMtYwMtrFDGWmRnRHed9"
product_slug: "cambridge-audio-dacmagic-200m-open-box"
brand: "Cambridge Audio"
name: "Cambridge Audio DacMagic 200M - Open Box"
slice: "audio-electronics"
price: 44900
spec_fields:
  brand: "cambridge-audio"
  customerRating: null
  condition: "open-box"
  inStock: true
  dealsDiscount: "none"
  newArrival: false
  awards:
    - "What Hi-Fi? Awards 2021 winner"
  deviceType: "dac"
  deviceConnectivity: "wired-wireless"
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
    - "bluetooth"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "24-bit / 768 kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
  dacChipsetFamily:
    - "ess-sabre"
  streamingPlatformSupport: []
  networkConnection: []
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs:
    - "sbc"
    - "aptx"
  voiceAssistant: []
  multiroomSupport: false
  finishColor:
    - "lunar-grey"
    - "black"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://www.cambridgeaudio.com/usa/en/products/hi-fi/dacmagic/dacmagic-200m"
  - "https://www.kirstein.de/docs/manuals/00118445/manual_EN.pdf?h=61f987314bc35d01d658ae245833087d"
  - "https://www.whathifi.com/reviews/cambridge-audio-dacmagic-200m"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **brand** (hard-spec): `cambridge-audio` — manufacturer product page and manual identify the brand as Cambridge Audio; Sanity store record uses `cambridge-audio` as the brand slug.
- **customerRating** (internal): `null` — store-computed field; no customer-review aggregate was individually sourced.
- **condition** (marketing-fact): `open-box` — product name and store record identify this as an open-box item; price is listed as $449.00.
- **inStock** (internal): `true` — Sanity product record `_id` MrEMtYwMtrFDGWmRnRHed9 shows `stock: 36`, `reservedStock: 0`.
- **dealsDiscount** (internal): `none` — open-box is a condition/stock type, not a sale or clearance flag.
- **newArrival** (internal): `false` — product was launched in 2021; not a new arrival.
- **awards** (marketing-fact): `["What Hi-Fi? Awards 2021 winner"]` — product model is the same as the new DacMagic 200M, which What Hi-Fi? lists as a "What Hi-Fi? Awards 2021 winner".
- **deviceType** (marketing-fact): `dac` — manufacturer titles the product "Digital to Analogue Converter and Headphone Amplifier"; the `should-be-audio-electronics.md` product-category list does not include a combined DAC/headphone-amp, so the single best fit is `dac`.
- **deviceConnectivity** (marketing-fact): `wired-wireless` — the unit offers wired digital inputs (USB, optical, coaxial) plus Bluetooth aptX wireless input.
- **formFactor** (legacy): `desktop` — product page describes a "compact half-width hi-fi unit"; manual gives chassis dimensions 52 x 215 x 191mm.
- **dacIncluded** (legacy): `true` — product is a digital-to-analogue converter; manual lists "Dual ESS ES9028Q2M DACs".
- **balancedOutput** (legacy): `true` — manual rear panel connections section lists "Balanced audio outputs – Outputs for use with balanced XLR cables" in addition to RCA unbalanced outputs.
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — domain-gated in `sanity-cms/schemaTypes/productType.ts` to the five amplifier/receiver `deviceType` values; with `deviceType: dac` these fields do not apply.
- **inputs** (hard-spec): `["usb", "optical", "coaxial", "bluetooth"]` — manual: "USB audio in", two digital inputs accepting "S/P DIF co-axial, or TOSLINK optical", and a Bluetooth antenna for wireless streaming.
- **maxSampleRateBitDepth** (hard-spec): `24-bit / 768 kHz` — manual technical specifications: "DIGITAL INPUT WORD WIDTHS SUPPORTED ... 16-24bit (USB)" and "DIGITAL INPUT SAMPLING FREQUENCIES SUPPORTED ... 44.1kHz to 768kHz PCM ... (USB)"; product page lists "24-bit/768kHz".
- **dsdSupport** (hard-spec): `dsd256-plus` — manual: "Native DSD 64x to 512x, DoP 64x to 256x (USB)".
- **hiResCertification** (marketing-fact): `["mqa"]` — manual: "MQA COMPATIBILITY Full decoding (Core + Renderer)"; no Hi-Res Audio certification badge was found.
- **dacChipsetFamily** (marketing-fact): `["ess-sabre"]` — manual: "Dual ESS ES9028Q2M DACs" (ESS Sabre).
- **streamingPlatformSupport** (marketing-fact): `[]` — no AirPlay 2, Chromecast, Spotify Connect, TIDAL Connect, Roon Ready, or DLNA support is listed.
- **networkConnection** (marketing-fact): `[]` — no Wi-Fi or Ethernet network connection is listed.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — not a turntable; domain-gated to `deviceType: turntable`.
- **bluetoothCodecs** (marketing-fact): `["sbc", "aptx"]` — manual: "BLUETOOTH ... v4.2, A2DP profile, SBC and AptX codecs".
- **voiceAssistant** (marketing-fact): `[]` — `deviceConnectivity` is `wired-wireless`; no Alexa or Google Assistant support is listed.
- **multiroomSupport** (marketing-fact): `false` — `deviceConnectivity` is `wired-wireless`; no multiroom support is mentioned, and silence on this marketable feature is read as absence.
- **finishColor** (hard-spec): `["lunar-grey", "black"]` — same product model as the new DacMagic 200M; the live manufacturer product page lists "Colour Lunar grey Black", and the official manual states "COLOUR Lunar Grey".
- **rackMountable19** (marketing-fact): `false` — desktop chassis with no 19" rack-mounting callout; silence on this marketable feature is read as absence.
- **countryOfManufacture** (hard-spec): `null` — no "Made in ..." or country-of-manufacture statement was found in the opened manufacturer product page or manual.

## Conflict / Caution Notes

- **Open-box pricing:** the open-box item is priced $449.00 in the Sanity record, which is higher than the new item's $399.00. This is the store-recorded price; no sale or clearance flag is implied.
- **Finish colour conflict:** the official manual (printed 2024) lists only "Lunar Grey", while the live manufacturer product page lists "Lunar grey" and "Black". Per the sourcing-protocol.md manufacturer self-contradiction rule, the currently-live web product page is treated as more current; both colours are recorded.
