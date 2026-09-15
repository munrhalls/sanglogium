---
product_id: PHPYj28HJdPDHAaIBAMKFk
product_slug: fiio-r7-dac-and-headphone-amp
brand: FiiO
name: FiiO R7 DAC and Headphone Amp
slice: audio-electronics
spec_fields:
  deviceType: dac
  deviceConnectivity: wifi-networked
  formFactor: desktop
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
    - optical
    - coaxial
    - bluetooth
    - ethernet-lan
  outputs:
    - headphone-jack
    - headphone-jack
    - headphone-jack
    - pre-out-rca
    - pre-out-xlr
  maxSampleRateBitDepth: 768kHz/32bit
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
    - ethernet
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
    - LDAC
  voiceAssistant: null
  multiroomSupport: null
  finishColor:
    - Black
    - White
  rackMountable19: false
  countryOfManufacture: China
  awards: null
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
source_urls:
  - https://www.fiio.com/r7
  - https://www.fiio.com/r7_parameters
verified_at: "2026-09-14"
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (marketing-fact): All-in-One Desktop HD DTS Decoding and Ear Mafer - combines transmitter/decoder/amp/preamp/media playback — https://www.fiio.com/r7
- **deviceConnectivity** (marketing-fact): Ethernet port, WiFi, Bluetooth — https://www.fiio.com/r7
- **formFactor** (marketing-fact): All-in-One Desktop unit — https://www.fiio.com/r7
- **dacIncluded** (hard-spec): DAC: ES9068AS — https://www.fiio.com/r7_parameters
- **balancedOutput** (hard-spec): 4.4mm balanced headphone output and four-pin XLR balanced headphone output — https://www.fiio.com/r7
- **inputs** (hard-spec): USB Type-C, USB-A, optical, coaxial, Bluetooth receiving, Ethernet, TF card — https://www.fiio.com/r7_parameters
- **outputs** (hard-spec): 6.35mm, 4.4mm, four-pin XLR headphone outputs; RCA line-out and XLR balanced line-out — https://www.fiio.com/r7
- **maxSampleRateBitDepth** (hard-spec): USB Audio: 768kHz/32bit — https://www.fiio.com/r7_parameters
- **dsdSupport** (hard-spec): USB Audio: DSD512 (DoP/D2P/Native) — https://www.fiio.com/r7_parameters
- **hiResCertification** (marketing-fact): MQA: 8x decoding — https://www.fiio.com/r7_parameters
- **dacChipsetFamily** (hard-spec): DAC: ES9068AS (ESS Sabre) — https://www.fiio.com/r7_parameters
- **streamingPlatformSupport** (marketing-fact): Eight operating modes including Roon Ready and AirPlay; DLNA and WiFi song transfer — https://www.fiio.com/r7_parameters
- **networkConnection** (marketing-fact): WiFi 2.4GHz/5GHz and Ethernet — https://www.fiio.com/r7_parameters
- **bluetoothCodecs** (hard-spec): Bluetooth Emission (5.0): AAC/SBC/aptX/aptX HD/LDAC/LHDC; Bluetooth receiving (5.0): SBC/AAC/LDAC — https://www.fiio.com/r7_parameters
- **finishColor** (marketing-fact): Color: Black/White — https://www.fiio.com/r7_parameters
- **rackMountable19** (marketing-fact): No 19" rack-mount feature mentioned — https://www.fiio.com/r7
- **countryOfManufacture** (marketing-fact): Guangzhou FIIO Electronics Technology Co., Ltd. ... Made in China — https://www.fiio.com/About_FIIO

## Conflict / Caution Notes
- Source lists LHDC for Bluetooth transmission, which is not in the current schema bluetoothCodecs enum, so it is omitted and recorded here only with schema-listed codecs.
- Product page states '3.6W high output power' while parameters give multiple load/gain-specific values; powerOutputPerChannelW is left null.
- All other fields were checked against the manufacturer product/parameters pages and left null where not explicitly stated or not applicable.
