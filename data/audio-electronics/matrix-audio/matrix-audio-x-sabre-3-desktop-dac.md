---
product_id: "n10eAegrGspodtsQvy3lt9"
product_slug: "matrix-audio-x-sabre-3-desktop-dac"
brand: "Matrix Audio"
name: "Matrix Audio X-Sabre 3 Desktop DAC"
slice: "audio-electronics"
spec_fields:
  deviceType: "dac"
  deviceConnectivity: "wifi-networked"
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
    - "i2s-iis"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "32-bit/768kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
  dacChipsetFamily:
    - "ess-sabre"
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
  finishColor: null
  rackMountable19: false
  countryOfManufacture: null
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
  awards: null
source_urls:
  - "https://www.matrix-digi.com/product/14/X-SABRE_3"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `dac` — product page explicitly calls X-SABRE 3 a "streaming audio DAC" and "Desktop DAC".
- **deviceConnectivity** (marketing-fact): `wifi-networked` — product page lists 2.4/5 GHz dual-band Wi-Fi and Gigabit Ethernet.
- **inputs** (hard-spec): `usb, optical, coaxial, i2s-iis` — Digital Input table lists Coaxial & Optical, IIS-LVDS and USB Audio.
- **maxSampleRateBitDepth** (hard-spec): `32-bit/768kHz` — IIS-LVDS and USB Audio support 16-32Bit/768kHz PCM; coaxial/optical limited to 24-bit/192kHz.
- **dsdSupport** (hard-spec): `dsd256-plus` — USB and IIS-LVDS support native DSD up to 22.4MHz (DSD512).
- **hiResCertification** (marketing-fact): `["mqa"]` — USB Audio input explicitly supports MQA 16-24Bit streams.
- **dacChipsetFamily** (hard-spec): `["ess-sabre"]` — Specifications Hardware Platform lists D/A Chip ES9038PRO.
- **streamingPlatformSupport** (marketing-fact): `airplay2, tidal-connect, spotify-connect, roon-ready, dlna` — MA Player table lists AirPlay 2, DLNA/UPnP, TIDAL Connect, Spotify Connect, Roon Ready, vTuner, Radio Paradise, HIGHRESAUDIO and QQ Music.
- **networkConnection** (hard-spec): `["wifi", "ethernet"]` — Network spec lists 10/100/1000 Mbps LAN and 2.4 GHz / 5 GHz WLAN.
- **rackMountable19** (marketing-fact): `false` — desktop chassis with no rack-mount claim.

## Conflict / Caution Notes

- X-SABRE 3 includes a 12V trigger port and an RM3 remote control, but `trigger12v` and `remoteControlIncluded` are schema-gated to amplifier `deviceType` values, so they are recorded as `null`.
