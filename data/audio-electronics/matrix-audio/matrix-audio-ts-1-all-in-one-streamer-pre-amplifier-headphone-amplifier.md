---
product_id: "GPjMdcfFWZVrKyR2PB7h5O"
product_slug: "matrix-audio-ts-1-all-in-one-streamer-pre-amplifier-headphone-amplifier"
brand: "Matrix Audio"
name: "Matrix Audio TS-1 All-in-One Streamer / Pre-Amplifier / Headphone Amplifier"
slice: "audio-electronics"
spec_fields:
  deviceType: "network-streamer"
  deviceConnectivity: "wifi-networked"
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
    - "hdmi-earc"
    - "rca"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "24-bit/768kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification: null
  dacChipsetFamily:
    - "akm"
  streamingPlatformSupport:
    - "airplay2"
    - "tidal-connect"
    - "spotify-connect"
    - "roon-ready"
    - "dlna"
  networkConnection:
    - "wifi"
    - "ethernet"
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
    - "Titanium Silver"
    - "Obsidian Black"
  rackMountable19: false
  countryOfManufacture: null
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
  awards: null
source_urls:
  - "https://www.matrix-digi.com/product/121/TS-1"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `network-streamer` — product page describes TS-1 as an "all-in-one" streamer/DAC/headphone amplifier; the should-be category is Network Streamer.
- **deviceConnectivity** (marketing-fact): `wifi-networked` — page explicitly states Wi-Fi 6 connectivity plus Gigabit Ethernet; network spec lists 2.4/5 GHz Wi-Fi and 10/100/1000 Mbps LAN.
- **inputs** (hard-spec): `usb, optical, coaxial, hdmi-earc, rca` — Digital Input table lists coaxial & optical, HDMI ARC, and USB Audio; Audio Center section also lists RCA analog input.
- **maxSampleRateBitDepth** (hard-spec): `24-bit/768kHz` — USB Audio supports 16-24Bit PCM up to 768kHz; coaxial/optical and HDMI ARC are limited to 192kHz.
- **dsdSupport** (hard-spec): `dsd256-plus` — USB Audio supports native DSD up to 22.4MHz (DSD512).
- **hiResCertification** (marketing-fact): `null` — no MQA or Hi-Res Audio logo/certification is stated on the product page or in the manual.
- **dacChipsetFamily** (hard-spec): `["akm"]` — Fully Balanced DAC section states each channel uses an AK4493SEQ chip.
- **streamingPlatformSupport** (marketing-fact): `airplay2, tidal-connect, spotify-connect, roon-ready, dlna` — page lists Roon Ready, TIDAL Connect, Qobuz Connect, Spotify Connect, AirPlay 2, QPlay and UPnP/DLNA; QPlay and Qobuz Connect are not in the schema enum.
- **networkConnection** (hard-spec): `["wifi", "ethernet"]` — Network spec lists 2.4 GHz / 5 GHz Wi-Fi and 10/100/1000 Mbps LAN.
- **finishColor** (marketing-fact): `["Titanium Silver", "Obsidian Black"]` — Choose Your Aesthetic section explicitly names these two finishes.
- **rackMountable19** (marketing-fact): `false` — compact desktop chassis with no 19" rack-mount claim.

## Conflict / Caution Notes

- TS-1 has a headphone amplifier and line/subwoofer outputs, but `amplification`, `powerOutputPerChannelW`, `channelCount`, `outputs`, `phonoStageBuiltIn`, `trigger12v` and `remoteControlIncluded` are schema-gated to amplifier `deviceType` values and are recorded as `null` for this `network-streamer`.
