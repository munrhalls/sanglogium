---
product_id: "GPjMdcfFWZVrKyR2PB6DOw"
product_slug: "xduoo-xd05-pro-xd05pro-hard-nucleus-modular-dac-amp"
brand: "xDuoo"
name: "xDuoo XD05 Pro (XD05Pro) Hard Nucleus Modular DAC/Amp"
slice: "audio-electronics"
spec_fields:
  customerRating: null
  awards: null
  condition: null
  inStock: null
  dealsDiscount: null
  newArrival: null
  deviceType: "dac"
  deviceConnectivity: "wired-wireless"
  formFactor: "portable"
  amplification: null
  dacIncluded: true
  balancedOutput: true
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
    - "aes-ebu"
    - "bluetooth"
  outputs: null
  maxSampleRateBitDepth: "32-bit/768kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification: []
  dacChipsetFamily:
    - "ess-sabre"
  streamingPlatformSupport: []
  networkConnection: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  voiceAssistant: []
  multiroomSupport: null
  bluetoothCodecs:
    - "SBC"
    - "AAC"
    - "aptX"
    - "aptX HD"
    - "aptX LL"
    - "LDAC"
  finishColor: null
  rackMountable19: false
  countryOfManufacture: null
  price:
    min: 799
    max: 799
    currency: "USD"
source_urls:
  - "https://xduoo.net/product/xd05-pro/"
  - "https://apos.audio/products/xduoo-xd05pro-hard-nucleus-modular-dac-amp"
  - "https://hifigo.com/products/xduoo-xd05pro"
  - "https://reference-audio-analyzer.pro/en/review-report.php?id=4919"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — xDuoo titles the product "Hard Nucleus Modular DAC/Amp" and describes a portable DAC/headphone amplifier.
- **deviceConnectivity** (marketing-fact): `wired-wireless` — xDuoo lists USB, optical, coaxial, and Bluetooth inputs.
- **formFactor** (marketing-fact): `portable` — xDuoo lists dimensions 18.5 x 9.5 x 3.3 cm, weight 0.78 kg, and a 13,600 mAh battery.
- **dacIncluded** (marketing-fact): `true` — product is a modular DAC/amp.
- **balancedOutput** (marketing-fact): `true` — Apos, HiFiGo, and xDuoo list a 4.4mm balanced output.
- **inputs** (hard-spec): `["usb", "optical", "coaxial", "aes-ebu", "bluetooth"]` — xDuoo lists USB, optical, coaxial, and Bluetooth; Reference Audio Analyzer adds AES/EBU and SPDIF/Toslink support.
- **maxSampleRateBitDepth** (hard-spec): `32-bit/768kHz` — Reference Audio Analyzer states "768 kHz with 32 bit input bit depth" over USB.
- **dsdSupport** (hard-spec): `dsd256-plus` — Reference Audio Analyzer and xDuoo list DSD512 support.
- **dacChipsetFamily** (marketing-fact): `["ess-sabre"]` — Apos and HiFiGo list the stock card as ESS ES9039SPRO.
- **bluetoothCodecs** (hard-spec): `["SBC", "AAC", "aptX", "aptX HD", "aptX LL", "LDAC"]` — HiFiGo codec list.
- **hiResCertification** (marketing-fact): `[]` — no MQA or Hi-Res Audio certification found.
- **price** (internal): `{min: 799, max: 799, currency: "USD"}` — live Sanity product record for this issue lists $799.00.
- **rackMountable19** (marketing-fact): `false` — portable device with no rack-mount feature mentioned.

## Conflict / Caution Notes

- Bluetooth version: xDuoo official product page lists "Bluetooth 5.0", while HiFiGo, Headphonesty, and Headfonics state Bluetooth 5.1 and a Qualcomm QCC5125 chip. The `deviceConnectivity` field does not encode a version, so the conflict is recorded.
- Some retailer sources list a 3.5mm/4.4mm analog input, but the `inputs` vocabulary does not include a 3.5mm/4.4mm analog value, so this input is not recorded in the frontmatter.
