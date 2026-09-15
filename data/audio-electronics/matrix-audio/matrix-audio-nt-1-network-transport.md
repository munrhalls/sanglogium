---
product_id: "xMEqvkRBbdrlJXyFG8fa0r"
product_slug: "matrix-audio-nt-1-network-transport"
brand: "Matrix Audio"
name: "Matrix Audio NT-1 Network Transport"
slice: "audio-electronics"
spec_fields:
  deviceType: "network-streamer"
  deviceConnectivity: "wifi-networked"
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs: null
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "32-bit/768kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification: null
  dacChipsetFamily: null
  streamingPlatformSupport:
    - "airplay2"
    - "tidal-connect"
    - "spotify-connect"
    - "roon-ready"
    - "dlna"
  networkConnection:
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
  finishColor: null
  rackMountable19: false
  countryOfManufacture: null
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
  awards: null
source_urls:
  - "https://www.matrix-digi.com/product/117/NT-1"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `network-streamer` — product page describes NT-1 as a "Digital Audio Transport" that unlocks network streaming; it is not a CD player, so the Network Streamer category is the closest match in the schema.
- **deviceConnectivity** (marketing-fact): `wifi-networked` — the device is network-connected even though it uses wired Ethernet/SFP (no onboard Wi-Fi listed).
- **maxSampleRateBitDepth** (hard-spec): `32-bit/768kHz` — IIS-LVDS digital output supports 16-32Bit/768kHz PCM; the device can output PCM up to this rate to an external DAC.
- **dsdSupport** (hard-spec): `dsd256-plus` — IIS-LVDS output supports native DSD up to 22.58MHz/24.58MHz (DSD512).
- **hiResCertification** (marketing-fact): `null` — as a digital transport with no onboard DAC, no MQA or Hi-Res Audio certification is listed.
- **dacChipsetFamily** (hard-spec): `null` — NT-1 has no onboard DAC; it is a transport only.
- **streamingPlatformSupport** (marketing-fact): `airplay2, tidal-connect, spotify-connect, roon-ready, dlna` — MA Player table lists AirPlay 2, DLNA/UPnP, TIDAL Connect, Spotify Connect, Qobuz Connect, Roon Ready, vTuner, Radio Paradise, QQ Music.
- **networkConnection** (hard-spec): `["ethernet"]` — Network spec lists 10/100/1000 Mbps LAN and SFP ports; no Wi-Fi is listed.
- **rackMountable19** (marketing-fact): `false` — no 19" rack-mount claim.
- All turntable, amplification and wired/wireless-voice fields are `null` because the product is a network transport and does not fit those domains.

## Conflict / Caution Notes

- NT-1 has trigger in/out ports, but `trigger12v` is schema-gated to amplifier `deviceType` values, so it is recorded as `null`. The `inputs` field is also `null` because the product's specifications list digital outputs and network/USB storage, not audio input ports.
