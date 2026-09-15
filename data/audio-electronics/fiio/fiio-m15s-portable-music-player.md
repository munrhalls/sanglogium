---
product_id: MrEMtYwMtrFDGWmRnKwOVD
product_slug: fiio-m15s-portable-music-player
brand: FiiO
name: FiiO M15S Portable Music Player
slice: audio-electronics
spec_fields:
  deviceType: null
  deviceConnectivity: wifi-networked
  formFactor: portable
  amplification: null
  dacIncluded: true
  balancedOutput: true
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - usb
    - coaxial
    - bluetooth
  outputs: null
  maxSampleRateBitDepth: 384kHz/32bit
  dsdSupport: dsd256-plus
  hiResCertification:
    - mqa
  dacChipsetFamily:
    - ess-sabre
  streamingPlatformSupport:
    - airplay2
    - roon-ready
    - dlna
  networkConnection:
    - wifi
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs:
    - SBC
    - AAC
    - aptX
    - aptX HD
    - aptX Adaptive
    - aptX LL
    - LDAC
  voiceAssistant: null
  multiroomSupport: null
  finishColor:
    - Black
  rackMountable19: false
  countryOfManufacture: China
  awards: null
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
source_urls:
  - https://fiio.com/m15s
  - https://www.fiio.com/m15s_parameters
verified_at: "2026-09-14"
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (marketing-fact): Product page title is 'Portable HD Lossless Music Player-M15S'; should-be-audio-electronics.md Product Category list does not include DAP/Player, so recorded as null — https://fiio.com/m15s
- **deviceConnectivity** (marketing-fact): WiFi 2.4GHz/5GHz plus Bluetooth 5.0; wired via USB Type-C and headphone outputs — https://www.fiio.com/m15s_parameters
- **formFactor** (marketing-fact): Portable Hi-Res Lossless Music Player — https://fiio.com/m15s
- **dacIncluded** (hard-spec): DAC: ES9038PRO — https://www.fiio.com/m15s_parameters
- **balancedOutput** (hard-spec): Balanced output: 2.5mm + 4.4mm balanced — https://www.fiio.com/m15s_parameters
- **inputs** (hard-spec): USB TYPE C USB3.0, coaxial interface (3.5mm shared with PO), Bluetooth reception — https://www.fiio.com/m15s_parameters
- **maxSampleRateBitDepth** (hard-spec): USB DAC: 384kHz-32bit/DSD256 — https://www.fiio.com/m15s_parameters
- **dsdSupport** (hard-spec): Maximum supported sampling rate: Native up to 384kHz-32bit/DSD256 — https://www.fiio.com/m15s_parameters
- **hiResCertification** (marketing-fact): MQA: Global 8x decoding — https://www.fiio.com/m15s_parameters
- **dacChipsetFamily** (hard-spec): DAC: ES9038PRO (ESS Sabre) — https://www.fiio.com/m15s_parameters
- **streamingPlatformSupport** (marketing-fact): WiFi: supports DLNA transmission and reception, AirPlay, WiFi transmission, Roon Ready — https://www.fiio.com/m15s_parameters
- **networkConnection** (marketing-fact): WiFi: 2.4GHz/5GHz — https://www.fiio.com/m15s_parameters
- **bluetoothCodecs** (hard-spec): Bluetooth Transmitter (5.0): SBC/AAC/aptX/aptX HD/LDAC/LHDC; Bluetooth reception (5.0): SBC/AAC/aptX/aptX HD/aptX LL/aptX Adaptive/LDAC — https://www.fiio.com/m15s_parameters
- **finishColor** (marketing-fact): Color: Black — https://www.fiio.com/m15s_parameters
- **rackMountable19** (marketing-fact): No 19" rack-mount feature mentioned — https://fiio.com/m15s
- **countryOfManufacture** (marketing-fact): Guangzhou FIIO Electronics Technology Co., Ltd. ... Made in China — https://www.fiio.com/About_FIIO

## Conflict / Caution Notes
- deviceType is null because the should-be-audio-electronics.md Product Category enum does not include 'DAP / portable music player'.
- Source lists LHDC for Bluetooth transmission, which is not in the current schema bluetoothCodecs enum, so it is omitted and recorded here only with schema-listed codecs.
- All other fields were checked against the manufacturer product/parameters pages and left null where not explicitly stated or not applicable.
