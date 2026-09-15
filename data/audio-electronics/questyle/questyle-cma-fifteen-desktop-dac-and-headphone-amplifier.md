---
product_id: "n10eAegrGspodtsQvy3jJm"
product_slug: "questyle-cma-fifteen-desktop-dac-and-headphone-amplifier"
brand: "Questyle"
name: "Questyle CMA Fifteen Desktop DAC and Headphone Amplifier"
slice: "audio-electronics"
spec_fields:
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
  awards: []
  deviceType: "dac"
  deviceConnectivity: "wired-wireless"
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
    - "bluetooth"
    - "rca"
  maxSampleRateBitDepth: "USB: 44.1kHz-768kHz/32bit; Optical/Coaxial: 44.1kHz-192kHz/24bit"
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
    - "aac"
    - "ldac"
  voiceAssistant: []
  multiroomSupport: false
  finishColor:
    - "Black"
  rackMountable19: false
  countryOfManufacture: null
source_urls:
  - "https://eliseaudio.com/products/questyle-cma-fifteen"
  - "https://headphones.com/products/questyle-cma-fifteen-desktop-dac-and-headphone-amplifier"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): "dac" — Headphones.com product title: "Questyle CMA Fifteen Desktop DAC and Headphone Amplifier"; Elise Audio: "Questyle CMA Fifteen" and "Flagship DAC/Amp" — https://headphones.com/products/questyle-cma-fifteen-desktop-dac-and-headphone-amplifier / https://eliseaudio.com/products/questyle-cma-fifteen
- **deviceConnectivity** (marketing-fact): "wired-wireless" — Elise Audio: "CMA Fifteen supports LDAC Bluetooth" and it also has USB, optical and coaxial wired inputs — https://eliseaudio.com/products/questyle-cma-fifteen
- **inputs** (hard-spec): ["usb", "optical", "coaxial", "bluetooth", "rca"] — Elise Audio Technical Specifications: "Digital Input: USB x 2 (Including a high-priority USB Type-C interface and a USB Type-B interface.)"; "Optical Input x 1"; "Coaxial Input x 1"; "Bluetooth Input x 1"; "Analog Input: RCA x 1, 2Vrms standard level" — https://eliseaudio.com/products/questyle-cma-fifteen
- **maxSampleRateBitDepth** (hard-spec): "USB: 44.1kHz-768kHz/32bit; Optical/Coaxial: 44.1kHz-192kHz/24bit" — Elise Audio: "PCM: 44.1kHz-768kHz/32bit" (USB), "Optical Input x 1: PCM: 44.1kHz~192kHz/24bit", "Coaxial Input x 1: PCM: 44.1kHz~192kHz/24bit" — https://eliseaudio.com/products/questyle-cma-fifteen
- **dsdSupport** (hard-spec): "dsd256-plus" — Elise Audio: "DSD: Native DSD512; DOP DSD256" — https://eliseaudio.com/products/questyle-cma-fifteen
- **dacChipsetFamily** (hard-spec): ["ess-sabre"] — Headphones.com product description: "Questyle selected the flagship DAC ES9038PRO, a decoding chip with the most powerful performance of any DAC invented to date" — https://headphones.com/products/questyle-cma-fifteen-desktop-dac-and-headphone-amplifier
- **hiResCertification** (marketing-fact): ["mqa"] — Elise Audio: "MQA: Full / Core decoder" and Headphones.com: "CMA Fifteen supports MQA full decoding" — https://eliseaudio.com/products/questyle-cma-fifteen / https://headphones.com/products/questyle-cma-fifteen-desktop-dac-and-headphone-amplifier
- **bluetoothCodecs** (hard-spec): ["sbc", "aac", "ldac"] — Elise Audio: "Bluetooth Input x 1: SBC, AAC, LDAC (At the highest level of 96kHz/24Bit, 990kps/909kps)" — https://eliseaudio.com/products/questyle-cma-fifteen
- **voiceAssistant** (marketing-fact): [] — no Alexa or Google Assistant feature is mentioned
- **multiroomSupport** (marketing-fact): false — no multiroom/multi-zone claim appears on any source
- **streamingPlatformSupport** (marketing-fact): [] — no AirPlay, Chromecast, Spotify Connect, Tidal Connect, Roon Ready, or DLNA support is listed
- **networkConnection** (marketing-fact): [] — no Wi-Fi or Ethernet networking claim; Bluetooth is the only wireless input
- **finishColor** (marketing-fact): ["Black"] — Headphones.com product imagery/caption: "black metal chassis" and Elise Audio: "Aircraft Grade Aluminium Body" — https://headphones.com/products/questyle-cma-fifteen-desktop-dac-and-headphone-amplifier / https://eliseaudio.com/products/questyle-cma-fifteen
- **awards** (marketing-fact): [] — no named awards or editor recognitions are listed
- **customerRating**, **condition**, **dealsDiscount**, **newArrival** (internal): null — store-operational fields, not individually sourced
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded** (n/a): null — domain-gated to amplifier `deviceType` values in productType.ts; this product is a `dac`
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (n/a): null — domain-gated to `deviceType: turntable`
- **rackMountable19** (marketing-fact): false — no 19" rack-mounting claim; it is a desktop DAC/amp
- **countryOfManufacture** (marketing-fact): null — no explicit "Made in ..." statement on the manufacturer or audited-retailer sources

## Conflict / Caution Notes

- The `outputs` filter field is domain-gated to amplifier `deviceType`s, so the CMA Fifteen's 6.35mm/4.4mm/4-pin headphone outputs and RCA/XLR pre-amp outputs are not captured by that facet.
