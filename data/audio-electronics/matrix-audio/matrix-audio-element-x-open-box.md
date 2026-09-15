---
product_id: "n10eAegrGspodtsQw13Qpt"
product_slug: "matrix-audio-element-x---open-box"
brand: "Matrix Audio"
name: "Matrix Audio Element X - Open Box"
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
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "32-bit/768kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
    - "hi-res-audio"
  dacChipsetFamily:
    - "ess-sabre"
  streamingPlatformSupport:
    - "airplay2"
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
  condition: "open-box"
  dealsDiscount: null
  newArrival: null
  awards: null
source_urls:
  - "https://www.matrix-digi.com/history-product?year=2018"
  - "https://www.matrix-digi.com/pdf/element_X_Manual_EN.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `network-streamer` — legacy product page describes element X as a music streamer/DAC/AMP combo; manual is "MUSIC STREAMER COMBO".
- **deviceConnectivity** (marketing-fact): `wifi-networked` — manual covers LAN and WLAN (2.4GHz/5GHz 802.11 a/b/g/n).
- **inputs** (hard-spec): `usb, optical, coaxial, i2s-iis` — Technical Specifications list Coaxial & Optical, IIS-LVDS and USB Audio digital inputs.
- **maxSampleRateBitDepth** (hard-spec): `32-bit/768kHz` — IIS-LVDS supports 16-32Bit/768kHz PCM; USB Audio 16-24Bit/768kHz.
- **dsdSupport** (hard-spec): `dsd256-plus` — IIS-LVDS and USB Audio support native DSD up to DSD512.
- **hiResCertification** (marketing-fact): `["mqa", "hi-res-audio"]` — manual states MQA logo and "The product with Hi-Res Audio logo is conformed to High-Resolution Audio standard defined by Japan Audio Society."
- **dacChipsetFamily** (hard-spec): `["ess-sabre"]` — product page states built-in DAC uses ES9038PRO from ESS.
- **streamingPlatformSupport** (marketing-fact): `airplay2, roon-ready, dlna` — legacy page lists AirPlay and DLNA; Roon Ready is listed in the news article and manual. Source uses "AirPlay" without explicit version 2 (closest schema value is `airplay2`).
- **networkConnection** (hard-spec): `["wifi", "ethernet"]` — manual lists 10BASE-T/100BASE-TX LAN and 2.4GHz/5GHz WLAN.
- **condition** (marketing-fact): `open-box` — live Sanity product name is "Matrix Audio Element X - Open Box" (source: live catalogue record / dataset.json).
- **rackMountable19** (marketing-fact): `false` — desktop chassis with no rack-mount claim.

## Conflict / Caution Notes

- The source only says "AirPlay" without specifying version 2. TIDAL/Qobuz/Spotify streaming is described as controllable through the MA Player app, but not as TIDAL Connect / Spotify Connect, so those are not recorded.
