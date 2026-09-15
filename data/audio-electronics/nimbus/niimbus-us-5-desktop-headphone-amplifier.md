---
product_id: "k27n1AQuIbSr5iozG1vNxK"
product_slug: "niimbus-us-5-desktop-headphone-amplifier"
brand: "Nimbus"
name: "Niimbus US 5 Desktop Headphone Amplifier"
slice: "audio-electronics"
spec_fields:
  deviceType: "preamplifier"
  deviceConnectivity: "wired"
  formFactor: "desktop"
  amplification: "solid-state"
  dacIncluded: false
  balancedOutput: true
  powerOutputPerChannelW: 7
  channelCount:
    - "2.0"
  phonoStageBuiltIn: "none"
  trigger12v: false
  remoteControlIncluded: true
  inputs:
    - "rca"
    - "xlr-balanced"
  outputs:
    - "pre-out-rca"
    - "pre-out-xlr"
    - "headphone-jack"
  maxSampleRateBitDepth: null
  dsdSupport: null
  hiResCertification: null
  dacChipsetFamily: null
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
  rackMountable19: false
  countryOfManufacture: "Germany"
  awards: null
  customerRating: null
  condition: "new"
  dealsDiscount: null
  newArrival: null
source_urls:
  - "https://www.violectric.de/en/products/niimbus/niimbus-us-5"
  - "https://www.electromod.co.uk/files/Niimbus_US5_Manual_EN_2024_07.pdf"
  - "https://www.cma.audio/en/categories/headphone-preamp/headphone-preamps-hifi/niimbus-us-5"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): cma.audio lists the product under "Headphone PreAmp > Headphone PreAmps HiFi" and "Analog Audio > PreAmps"; Violectric describes a pre-amp function to directly connect and control power amps or active speakers. Mapped to the schema value `preamplifier` because that is the only should-be Product Category matching the source. — https://www.cma.audio/en/categories/headphone-preamp/headphone-preamps-hifi/niimbus-us-5
- **deviceConnectivity** (marketing-fact): 3 analogue stereo inputs (2 x unbalanced RCA, 1 x balanced XLR); no Bluetooth/Wi-Fi/network features mentioned anywhere. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **formFactor** (marketing-fact): `desktop` — Sanity product name is "Niimbus US 5 Desktop Headphone Amplifier" (data/current-mappings.json); cma.audio lists a 7.06 kg, AC-powered unit and the manual lists a 351 x 59 x 248 mm chassis, ruling out `portable` or `dongle`. — https://www.cma.audio/en/categories/headphone-preamp/headphone-preamps-hifi/niimbus-us-5
- **amplification** (hard-spec): "4x 8 Transistors (true balanced)" / "4 Discrete-design power amps with 8 transistors per channel" — transistor-based, not tube, hybrid or Class D. — https://www.cma.audio/en/categories/headphone-preamp/headphone-preamps-hifi/niimbus-us-5
- **dacIncluded** (marketing-fact): `false` — described as "100% analog" and no DAC is mentioned in any source. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **balancedOutput** (marketing-fact): `true` — 1 x balanced XLR line output, 1 x 4-pin XLR balanced headphone output, 1 x 4.4 mm Pentaconn balanced headphone output. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **powerOutputPerChannelW** (hard-spec): `7` — "7000 mW Pmax into 50 Ohm" = 7 W per channel; the manual technical-data table confirms 50 Ohm / 7000 mW at <0.1% THD+N. The 600 Ohm figure is 32 V RMS (≈1.75 W) and is not the stated Pmax. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **channelCount** (marketing-fact): `["2.0"]` — the manual calls the device a "stereophonic headphone amplifier" and the source describes left/right dual-channel operation; `2.0` is the schema value for two-channel, no-subwoofer configurations. — https://www.electromod.co.uk/files/Niimbus_US5_Manual_EN_2024_07.pdf
- **phonoStageBuiltIn** (marketing-fact): `"none"` — the 3 analogue inputs are line-level RCA and XLR; no phono/MM/MC input is described. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **trigger12v** (marketing-fact): `false` — no 12V trigger or custom-install-ready language appears on the product page, in the manual, or on the distributor page. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **remoteControlIncluded** (marketing-fact): `true` — scope of delivery lists "1x Remote Control" and features include remote control of volume, mute, input and output selection. — https://www.cma.audio/en/categories/headphone-preamp/headphone-preamps-hifi/niimbus-us-5
- **inputs** (marketing-fact): `["rca", "xlr-balanced"]` — "3 analogue stereo inputs, 2 x unbalanced via RCA, 1 x balanced via XLR". — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **outputs** (marketing-fact): `["pre-out-rca", "pre-out-xlr", "headphone-jack"]` — 2 x line-outputs (1 x unbalanced RCA, 1 x balanced XLR) plus 1 x 4-pin XLR, 1 x 4.4 mm Pentaconn and 2 x 6.3 mm jack headphone outputs. Coarsened to the schema taxonomy. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **maxSampleRateBitDepth** (hard-spec): `null` — 100% analog device, no digital sampling stage. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **dsdSupport** (hard-spec): `null` — no DSD or digital audio support; 100% analog. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **hiResCertification** (marketing-fact): `null` — no MQA or Hi-Res Audio certification language found. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **dacChipsetFamily** (hard-spec): `null` — no DAC, so no DAC chipset. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **streamingPlatformSupport** (marketing-fact): `null` — no AirPlay, Chromecast, Spotify Connect, TIDAL Connect, Roon Ready or DLNA mentioned; wired-only analog device. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **networkConnection** (marketing-fact): `null` — no Wi-Fi or Ethernet mentioned. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **driveType** (hard-spec): `null` — not a turntable. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **turntableOperation** (marketing-fact): `null` — not a turntable. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **speedsSupported** (hard-spec): `null` — not a turntable. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **phonoPreampBuiltIn** (marketing-fact): `null` — not a turntable. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **cartridgeIncluded** (marketing-fact): `null` — not a turntable. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **usbDigitalOutput** (hard-spec): `null` — not a turntable; no USB output. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **bluetoothCodecs** (marketing-fact): `null` — wired-only, no Bluetooth. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **voiceAssistant** (marketing-fact): `null` — no Alexa or Google Assistant mentioned. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **multiroomSupport** (marketing-fact): `null` — no multiroom features mentioned. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **finishColor** (marketing-fact): `["black"]` — technical data lists `color: black`; manual describes black-anodized aluminum front and powdered steel case. — https://www.cma.audio/en/categories/headphone-preamp/headphone-preamps-hifi/niimbus-us-5
- **rackMountable19** (marketing-fact): `false` — case width is 351 mm (not 19" / 483 mm) and no rack-mount hardware is described. — https://www.electromod.co.uk/files/Niimbus_US5_Manual_EN_2024_07.pdf
- **countryOfManufacture** (marketing-fact): `"Germany"` — "devices are exclusively manufactured in Germany by Lake People electronic GmbH or contractors in the company's vicinity." — https://www.electromod.co.uk/files/Niimbus_US5_Manual_EN_2024_07.pdf
- **awards** (marketing-fact): `null` — no named awards or editor's-choice badges found on manufacturer or distributor pages. — https://www.violectric.de/en/products/niimbus/niimbus-us-5
- **customerRating** (store-derived): `null` — store-computed aggregate, not individually sourced per product.
- **condition** (marketing-fact): `"new"` — cma.audio and Violectric list the unit as orderable with no open-box, B-stock, demo or refurbished language. — https://www.cma.audio/en/categories/headphone-preamp/headphone-preamps-hifi/niimbus-us-5
- **dealsDiscount** (store-operational): `null` — not individually sourced.
- **newArrival** (store-operational): `null` — not individually sourced.

## Conflict / Caution Notes

- **deviceType / product-category mapping:** The source explicitly categorizes the Niimbus US 5 as a "Headphone PreAmp" and "preamplifier" with pre-amp line outputs. The schema/should-be Product Category list does not have a dedicated `headphone-amplifier` value, so `deviceType` is mapped to the closest matching schema enum `preamplifier`. The headphone-amp role is captured by the product name, by `outputs: ["headphone-jack"]`, and by the headphone-specific power-output spec.
- **powerOutputPerChannelW load qualifier:** The recorded 7 W is the 50 Ohm per-channel figure the manufacturer states as "7000 mW Pmax into 50 Ohm". The same source also publishes 32 V RMS into 600 Ohm (≈1.75 W per channel at 600 Ohm). The schema field has no load qualifier, so the Pmax value is used.
