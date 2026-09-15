---
product_id: ZuUKzmkqDyQwdcwhxlJkHG
product_slug: hifi-rose-rd160-network-streamer-dac-silver
brand: "HiFi Rose"
name: "HiFi Rose RD160 DAC (Silver)"
slice: audio-electronics
spec_fields:
  price:
    min: 5295
    max: 5295
    currency: USD
  customerRating: null
  awards: null
  condition: null
  inStock: false
  dealsDiscount: null
  newArrival: null
  deviceType: dac
  deviceConnectivity: wired
  formFactor: desktop
  amplification: null
  dacIncluded: true
  balancedOutput: true
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: false
  inputs:
    - usb
    - optical
    - coaxial
    - i2s-iis
    - aes-ebu
  outputs:
    - pre-out-rca
    - pre-out-xlr
  maxSampleRateBitDepth: 32-bit/768kHz
  dsdSupport: dsd256-plus
  hiResCertification: null
  dacChipsetFamily: akm
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
    - Silver
    - Black
  rackMountable19: false
  countryOfManufacture: "Republic of Korea"
source_urls:
  - "https://www.hifiroseusa.com/products/rd160-dac"
  - "https://cdn.shopify.com/s/files/1/0260/8588/3938/files/RD160_MANUAL_OWNERS_En_241129.pdf?v=1743076040"
  - "https://2tdmkpky.api.sanity.io/v2023-05-03/data/query/production?query=*%5B_id%3D%3D%22ZuUKzmkqDyQwdcwhxlJkHG%22%5D%7Bprice_data%2Cstock%2CreservedStock%2CfilterAttributes%7D"
verified_at: 2026-09-14
data_status: COMPLETE
---

## Verification Notes

**price** (internal / store record): `{min: 5295, max: 5295, currency: "USD"}` — live Sanity `price_data.unit_amount`: 529500. The distributor product page lists `$5,995.00 USD`; the live store price `$5295.00` is recorded.
- **customerRating** (marketing-fact): `null` — no customer rating shown.
- **awards** (marketing-fact): `null` — no awards or recognition badges listed on the manufacturer page.
- **condition** / **dealsDiscount** / **newArrival** (store-operational): `null`.
- **inStock** (internal / store record): `false` — Sanity `stock`: 0, `inStock`: false. The product page shows `Out Of Stock`; both agree.
- **deviceType** (marketing-fact): `"dac"` — product title `RD160 Absolute True Fidelity DAC` and description `DAC`. The Sanity slug contains `network-streamer-dac`, which is a legacy misclassification; `dac` is recorded.
- **deviceConnectivity** (marketing-fact): `"wired"` — the RD160 has no network, Wi-Fi, or Bluetooth; it is cabled via digital inputs and analog outputs.
- **formFactor** (marketing-fact): `"desktop"`.
- **amplification** / **powerOutputPerChannelW** / **channelCount** / **phonoStageBuiltIn** / **trigger12v**: `null` — the RD160 is a DAC, not an amplifier.
- **dacIncluded** (marketing-fact): `true` — the product is a DAC; the spec table lists `DAC: 2 × AK4499EXEQ + 2 × AK4191EQ (AKM)`.
- **balancedOutput** (hard-spec): `true` — product page: `Analog Outputs: Unbalanced, Balanced` and `Output Level: 4.5Vrms(RCA), 9Vrms(XLR)`.
- **remoteControlIncluded** (marketing-fact): `false` — the spec table lists `IR: 38kHz IR Receiver` but no remote control or included remote in the accessories. For this marketable feature, absence is read as `false`.
- **inputs** (hard-spec): `["usb", "optical", "coaxial", "i2s-iis", "aes-ebu"]` — product page: `Digital Inputs: USB SFP Module, USB 2.0 Type-B, HDMI I2S, Coaxial RCA, Coaxial BNC, Optical, AES/EBU`. `USB SFP` and `USB Type-B` are both mapped to `usb`; `Coaxial RCA` and `Coaxial BNC` to `coaxial`; `HDMI I2S` to `i2s-iis`; `AES/EBU` to `aes-ebu`.
- **outputs** (hard-spec): `["pre-out-rca", "pre-out-xlr"]` — product page: `Analog Outputs: Unbalanced, Balanced`.
- **maxSampleRateBitDepth** (hard-spec): `"32-bit/768kHz"` — product page: `PCM Sampling Rate: 8kHz~768kHz(8/16/24/32bit per Sample)`.
- **dsdSupport** (hard-spec): `"dsd256-plus"` — product page: `DSD: DSD64(2.8MHz)/DSD128(5.6MHz)/DSD256(11.2MHz)/DSD512(22.6MHz)`.
- **hiResCertification** (marketing-fact): `null` — no `Hi-Res Audio` or `MQA` certification is stated on the product page or manual. Do not infer from DSD/PCM support alone.
- **dacChipsetFamily** (hard-spec): `"akm"` — product page: `DAC: 2 × AK4499EXEQ + 2 × AK4191EQ (AKM)`.
- **streamingPlatformSupport** (marketing-fact): `null` — the RD160 has no network or streaming functionality.
- **networkConnection** (marketing-fact): `null` — no Ethernet or Wi-Fi listed.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — not a turntable.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`, so these wireless/connectivity fields do not apply.
- **finishColor** (marketing-fact): `["Silver", "Black"]` — product page: `Color Black Silver` with variants, and spec table `Finish: Silver, Black`.
- **rackMountable19** (marketing-fact): `false` — no 19" rack-mounting claim; dimensions 430(W) × 330(D) × 88(H) mm with no rack ears.
- **countryOfManufacture** (hard-spec): `"Republic of Korea"` — manual: `Manufacturer/Country of Manufacture: CITECH Co., Ltd. / Republic of Korea`.

## Conflict / Caution Notes

**Price conflict** — live Sanity store record `$5295.00`; the distributor product page lists `$5,995.00 USD`. The live store price is recorded.
- **DeviceType legacy mismatch** — the Sanity slug is `hifi-rose-rd160-network-streamer-dac-silver` and the legacy `filterAttributes.deviceType` is `network-streamer`. The manufacturer page and manual identify the product solely as a DAC with no network functionality; `dac` is recorded.
- **No MQA / Hi-Res certification** — the RD160 supports high-resolution PCM and DSD, but the manufacturer does not state MQA or Hi-Res Audio certification. `hiResCertification` is `null` rather than inferred from format support.
