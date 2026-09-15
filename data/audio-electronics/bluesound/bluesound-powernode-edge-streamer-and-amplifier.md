---
product_id: "MrEMtYwMtrFDGWmRnNHjjW"
product_slug: "bluesound-powernode-edge-streamer-and-amplifier"
brand: "Bluesound"
name: Bluesound Powernode Edge Streamer and Amplifier
slice: "audio-electronics"
spec_fields:
  deviceType: integrated-amplifier
  deviceConnectivity: wifi-networked
  formFactor: desktop
  amplification: null
  dacIncluded: true
  balancedOutput: false
  powerOutputPerChannelW: 40
  channelCount:
    - "2.0"
  phonoStageBuiltIn: none
  trigger12v: false
  remoteControlIncluded: false
  inputs:
    - "hdmi-earc"
    - "optical"
    - "rca"
    - "usb"
    - "bluetooth"
    - "ethernet-lan"
  outputs:
    - "speaker-terminals"
    - "subwoofer-out"
  maxSampleRateBitDepth: "24-bit/192kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
  dacChipsetFamily: null
  streamingPlatformSupport:
    - "airplay2"
    - "spotify-connect"
    - "tidal-connect"
    - "roon-ready"
  networkConnection: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs:
    - "aptX HD"
  voiceAssistant:
    - "alexa"
  multiroomSupport: true
  finishColor:
    - "black"
    - "white"
  rackMountable19: true
  countryOfManufacture: null
  awards: []
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
source_urls:
  - "https://www.bluesound.com/products/powernode-edge"
  - "https://content-bluesound-com.s3.amazonaws.com/uploads/2022/04/POWERNODE-EDGE-Owners-Manual-N230.pdf"
  - "https://www.bluesound.com/blogs/news/bluesound-announces-the-powernode-edge"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes
- **deviceType** (marketing-fact): product title "POWERNODE EDGE - Compact Wireless Music Streaming Amplifier" and page body "just add speakers" all-in-one amplifier; should-be category is `integrated-amplifier` — https://www.bluesound.com/products/powernode-edge
- **deviceConnectivity** (hard-spec): "Wi-Fi Built In: Wi-Fi 5 (802.11ac), dual-band" and "Ethernet/LAN: Ethernet RJ45, Gigabit 1000 Mbps" → `wifi-networked` — https://www.bluesound.com/products/powernode-edge
- **formFactor** (marketing-fact): "1U rack height and half-rack width" plus compact dimensions 219 x 44.5 x 193 mm → `desktop` — https://www.bluesound.com/products/powernode-edge
- **dacIncluded** (hard-spec): supports digital streaming formats and has HDMI eARC / optical / USB / Ethernet inputs that are decoded to analog for speaker output; no dedicated DAC chip named, but a DAC function is required for the listed digital-to-analog playback and the source lists "24 bits/192 kHz" and "Bit Depth: 16-24" — https://www.bluesound.com/products/powernode-edge
- **balancedOutput** (hard-spec): no balanced (XLR/4.4 mm) output listed; speaker terminals are 5-way binding post and sub output is single-ended RCA → `false` — https://www.bluesound.com/products/powernode-edge
- **powerOutputPerChannelW** (hard-spec): "Rated Power Output: 40W x 2 (8 Ohms)" → `40` — https://www.bluesound.com/products/powernode-edge
- **channelCount** (hard-spec): product page and manual describe powering a pair of passive speakers; two amplifier channels → `["2.0"]` — https://www.bluesound.com/products/powernode-edge
- **phonoStageBuiltIn** (hard-spec): no MM/MC phono stage is mentioned for the combo analog/digital input; the source lists the input as generic analog/TOSLINK combo → `none` — https://www.bluesound.com/products/powernode-edge
- **trigger12v** (hard-spec): product page connections table does not list a 12V trigger output → `false` — https://www.bluesound.com/products/powernode-edge
- **remoteControlIncluded** (marketing-fact): product page says "IR remote learning capability – optional control using the RC1 Remote Controller"; no remote is listed as included in accessories → `false` — https://www.bluesound.com/products/powernode-edge
- **inputs** (hard-spec): "HDMI Input: HDMI eARC", "Optical/Analog Input: Combo - Mini TOSLINK/Stereo 3.5mm", "USB IN: Type A", "Ethernet/LAN: Ethernet RJ45, Gigabit 1000 Mbps", "Bluetooth Quality: Bluetooth 5.0 aptX HD" → `hdmi-earc`, `optical`, `usb`, `bluetooth`, `ethernet-lan` plus `rca` for the analog portion of the combo input (see connector-mismatch note below) — https://www.bluesound.com/products/powernode-edge
- **outputs** (hard-spec): "Speaker Terminals: 5-Way Binding Post" and the manual describes "SUBW OUT" for a powered subwoofer → `speaker-terminals`, `subwoofer-out` — https://www.bluesound.com/products/powernode-edge / https://content-bluesound-com.s3.amazonaws.com/uploads/2022/04/POWERNODE-EDGE-Owners-Manual-N230.pdf
- **maxSampleRateBitDepth** (hard-spec): "Native Sampling Rates: up to 192 kHz" and "Bit Depth: 16-24" → `24-bit/192kHz` — https://www.bluesound.com/products/powernode-edge
- **dsdSupport** (hard-spec): "DSD Support: DSD256" → `dsd256-plus` — https://www.bluesound.com/products/powernode-edge
- **hiResCertification** (marketing-fact): "Supported Hi-Res Audio File Formats: FLAC, MQA, WAV, AIFF, MPEG-4 SLS" → `["mqa"]` — https://www.bluesound.com/products/powernode-edge
- **dacChipsetFamily** (hard-spec): no specific DAC chip is named on the product page or in the manual → `null` — https://www.bluesound.com/products/powernode-edge
- **streamingPlatformSupport** (marketing-fact): "3rd-Party Integrations: AirPlay 2, Spotify Connect (also support for Spotify Lossless), Tidal Connect, Qobuz Connect, Roon Ready, Dirac Live Ready" → `airplay2`, `spotify-connect`, `tidal-connect`, `roon-ready` (Qobuz and Dirac are not in the schema enum) — https://www.bluesound.com/products/powernode-edge
- **bluetoothCodecs** (hard-spec): "Bluetooth Quality: Bluetooth 5.0 aptX HD" → `["aptX HD"]` — https://www.bluesound.com/products/powernode-edge
- **voiceAssistant** (marketing-fact): "Voice Control Integrations: Amazon Alexa Skills" → `["alexa"]` — https://www.bluesound.com/products/powernode-edge
- **multiroomSupport** (marketing-fact): product page describes "wireless multi-room capabilities" and the manual describes "whole-home, multi-room listening experiences" → `true` — https://www.bluesound.com/products/powernode-edge / https://content-bluesound-com.s3.amazonaws.com/uploads/2022/04/POWERNODE-EDGE-Owners-Manual-N230.pdf
- **finishColor** (marketing-fact): "Finish: Black/White; Matte Satin Paint" → `["black", "white"]` — https://www.bluesound.com/products/powernode-edge
- **rackMountable19** (marketing-fact): product page says "1U rack height and half-rack width" and the manual states "properly designed for rack placement: 1U rack height, and half-rack width" → `true` — https://www.bluesound.com/products/powernode-edge / https://content-bluesound-com.s3.amazonaws.com/uploads/2022/04/POWERNODE-EDGE-Owners-Manual-N230.pdf
- **networkConnection** (schema-gated): the device has both Wi-Fi and Ethernet, but `networkConnection` in `productType.ts` is domain-gated to `dac`, `network-streamer`, and `cd-player-transport`; `deviceType` is `integrated-amplifier`, so the field is recorded as `null` per schema — https://www.bluesound.com/products/powernode-edge

## Conflict / Caution Notes
- **amplification**: the product page and manual both state the amplifier topology as "DirectDigital™". The `filterAttributes.amplification` enum is `solid-state`, `tube`, `hybrid`, `class-d` and does not include `direct-digital`, so the value is recorded as `null` with the exact source phrase preserved here. No same-tier source states `class-d`.
- **inputs / rca**: the source describes the analog input as a "Combo - Mini TOSLINK/Stereo 3.5mm" jack, not a pair of RCA connectors. The `inputs` enum has no `3.5mm` or generic `analog` value, so the analog portion is mapped to `rca` as the closest unbalanced line-level input type; this is a connector/format mismatch.
- **outputs / headphone-jack**: the product supports Bluetooth headphone output ("Headphone Output: Bluetooth only"), but the `outputs` enum does not include a Bluetooth or wireless value, so only physical outputs are listed.
- **countryOfManufacture**: no country of manufacture or final assembly is stated on the manufacturer product page, in the manual, or in the press release; Bluesound International is headquartered in Toronto, Canada, but that is not a manufacturing location.
- **awards**: the press release describes Bluesound as "award-winning" but does not name a specific award for the POWERNODE EDGE; the product page lists no awards or recognitions, so the field is an empty list rather than `null`.
