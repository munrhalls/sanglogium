---
product_id: "k27n1AQuIbSr5iozG1vJ1L"
product_slug: "matrix-audio-element-i-network-streamer,-dac/amp"
brand: "Matrix Audio"
name: "Matrix Audio Element i Network Streamer, DAC/Amp"
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
  condition: null
  dealsDiscount: null
  newArrival: null
  awards: null
source_urls:
  - "https://www.matrix-digi.com/history-product?year=2019"
  - "https://www.matrix-digi.com/pdf/element_i_Manual_EN.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `network-streamer` — legacy product page describes element i as a music streamer with D/A conversion and headphone amplification; manual title is "MUSIC STREAMER COMBO".
- **deviceConnectivity** (marketing-fact): `wifi-networked` — manual section 3.6/3.7 cover LAN and WLAN connections; network spec lists 10BASE-T/100BASE-TX LAN and 2.4GHz 802.11 a/b/g/n WLAN.
- **inputs** (hard-spec): `usb, optical, coaxial, i2s-iis` — Technical Specifications list Coaxial & Optical, IIS-LVDS, and USB Audio digital inputs.
- **maxSampleRateBitDepth** (hard-spec): `32-bit/768kHz` — IIS-LVDS supports 16-32Bit/768kHz PCM; USB Audio supports 16-24Bit/768kHz.
- **dsdSupport** (hard-spec): `dsd256-plus` — IIS-LVDS and USB Audio support native DSD up to DSD512 (22.58MHz).
- **hiResCertification** (marketing-fact): `["hi-res-audio"]` — manual states "The product with Hi-Res Audio logo is conformed to High-Resolution Audio standard defined by Japan Audio Society."
- **dacChipsetFamily** (hard-spec): `["ess-sabre"]` — manufacturer states the D/A conversion is exactly the same as element M; element M product page lists ES9028PRO D/A chip (ESS Sabre family).
- **streamingPlatformSupport** (marketing-fact): `airplay2, roon-ready, dlna` — legacy page and manual list AirPlay, DLNA and Roon Ready. The source uses the generic term "AirPlay"; AirPlay 2 is the closest schema value but not explicitly confirmed, so it is recorded with a caution note.
- **networkConnection** (hard-spec): `["wifi", "ethernet"]` — manual lists 10BASE-T/100BASE-TX LAN and 2.4GHz WLAN.
- **rackMountable19** (marketing-fact): `false` — desktop chassis with no rack-mount claim.

## Conflict / Caution Notes

- The source only says "AirPlay" without specifying version 2. The schema's only AirPlay value is `airplay2`; this is recorded as the closest controlled-vocabulary match with this caution. TIDAL/Qobuz/Spotify streaming is mentioned as supported via the MA Player app, but the terms "TIDAL Connect" / "Spotify Connect" are not used, so they are not recorded.
