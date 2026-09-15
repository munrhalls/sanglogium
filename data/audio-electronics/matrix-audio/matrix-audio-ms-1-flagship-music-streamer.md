---
product_id: "DZc43yHr6ydfgE7zB40rkU"
product_slug: "matrix-audio-ms-1-flagship-music-streamer"
brand: "Matrix Audio"
name: "Matrix Audio MS-1 Flagship Music Streamer"
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
    - "i2s-iis"
    - "xlr-balanced"
    - "rca"
    - "phono-mm-mc"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "32-bit/768kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
  dacChipsetFamily:
    - "akm"
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
  - "https://www.matrix-digi.com/product/99/MS-1"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `network-streamer` — manufacturer product page titles and describes the product as a "music streamer" in the M series (https://www.matrix-digi.com/product/99/MS-1).
- **deviceConnectivity** (marketing-fact): `wifi-networked` — the device is a network-connected music streamer; network spec lists LAN and SFP ports (wired network).
- **inputs** (hard-spec): `usb, optical, coaxial, i2s-iis, xlr-balanced, rca, phono-mm-mc` — the specifications table lists USB, coaxial & optical, IIS-LVDS digital inputs, and XLR/RCA line plus phono (MM/MC) analog inputs.
- **maxSampleRateBitDepth** (hard-spec): `32-bit/768kHz` — the IIS-LVDS input and DAC path support 16-32Bit/768kHz PCM; USB Audio supports 16-24Bit/768kHz.
- **dsdSupport** (hard-spec): `dsd256-plus` — IIS-LVDS supports native DSD up to 45.16MHz/49.15MHz (DSD1024); USB Audio supports native DSD up to 24.58MHz.
- **hiResCertification** (marketing-fact): `["mqa"]` — the spec table and MA Player section explicitly list MQA 16-24Bit streams.
- **dacChipsetFamily** (hard-spec): `["akm"]` — product page states dual AK4191 + AK4499 flagship D/A chipsets.
- **streamingPlatformSupport** (marketing-fact): `airplay2, tidal-connect, spotify-connect, roon-ready, dlna` — MA Player table lists AirPlay 2, DLNA/UPnP, TIDAL Connect, Spotify Connect, Roon Ready, vTuner, Radio Paradise, HIGHRESAUDIO and QQ Music.
- **networkConnection** (hard-spec): `["ethernet"]` — network spec lists 10/100/1000 Mbps LAN and SFP ports.
- **rackMountable19** (marketing-fact): `false` — product is described as a desktop/source component with no 19-inch rack-mounting claim; width 430 mm still not stated as rack-mountable.
- All other `spec_fields` are `null` because they fall outside this product's `deviceType`/`deviceConnectivity` domain (no amplification, turntable, Bluetooth or Wi-Fi voice-assistant features).

## Conflict / Caution Notes

- The MS-1 physically includes a built-in phono preamplifier (MM/MC), pre-output XLR/RCA, trigger in/out, and a remote control, but these features are not captured in the current audio-electronics schema because `outputs`, `phonoStageBuiltIn`, `trigger12v` and `remoteControlIncluded` are domain-gated to amplifier `deviceType` values. They are recorded as `null` per the schema rather than force-fitting `deviceType` to `preamplifier`.
