---
product_id: "n10eAegrGspodtsQw13RKz"
product_slug: "bluesound-node-wireless-music-streamer"
brand: "Bluesound"
name: Bluesound Node Wireless Music Streamer
slice: "audio-electronics"
spec_fields:
  deviceType: network-streamer
  deviceConnectivity: wifi-networked
  formFactor: desktop
  amplification: null
  dacIncluded: true
  balancedOutput: false
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - "hdmi-earc"
    - "optical"
    - "rca"
    - "usb"
    - "bluetooth"
    - "ethernet-lan"
  outputs: null
  maxSampleRateBitDepth: "24-bit/192kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "mqa"
  dacChipsetFamily:
    - "ess-sabre"
  streamingPlatformSupport:
    - "airplay2"
    - "spotify-connect"
    - "tidal-connect"
    - "roon-ready"
  networkConnection:
    - "wifi"
    - "ethernet"
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs:
    - "aptX Adaptive"
  voiceAssistant:
    - "alexa"
  multiroomSupport: true
  finishColor:
    - "black"
    - "white"
  rackMountable19: false
  countryOfManufacture: null
  awards: []
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
source_urls:
  - "https://www.bluesound.com/products/node"
  - "https://content-bluesound-com.s3.amazonaws.com/uploads/2021/05/Bluesound-NODE-Data-Sheet.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes
- **deviceType** (marketing-fact): product title "NODE - Performance Music Streamer" and page body "wireless hi-res music streamer" → `network-streamer` — https://www.bluesound.com/products/node
- **deviceConnectivity** (hard-spec): "Wi-Fi Built In: Wi-Fi 5 (802.11ac), dual-band" and "Ethernet/LAN: Ethernet RJ45, Gigabit 1000 Mbps" → `wifi-networked` (Bluetooth aptX Adaptive is handled separately in `bluetoothCodecs`) — https://www.bluesound.com/products/node
- **formFactor** (marketing-fact): compact desktop chassis, dimensions 220 x 46 x 146 mm → `desktop` — https://www.bluesound.com/products/node
- **dacIncluded** (hard-spec): product page states "ESS ES9039Q2M SABRE® DAC" and lists analog RCA / headphone / USB audio outputs → `true` — https://www.bluesound.com/products/node
- **balancedOutput** (hard-spec): outputs are unbalanced RCA stereo, 6.3 mm headphone jack, and subwoofer out; no XLR/4.4 mm balanced output is listed for the standard NODE → `false` — https://www.bluesound.com/products/node
- **inputs** (hard-spec): "HDMI Input: HDMI eARC", "Optical/Analog Input: Combo - Mini TOSLINK/Stereo 3.5mm", "USB IN: Type A (Fat32 Formatted) - External Storage only; Local Server Mode", "Ethernet/LAN: Ethernet RJ45, Gigabit 1000 Mbps", "Bluetooth Quality: Bluetooth 5.2 aptX Adaptive" → `hdmi-earc`, `optical`, `usb`, `bluetooth`, `ethernet-lan` plus `rca` for the analog portion of the combo input (see connector-mismatch note below) — https://www.bluesound.com/products/node
- **maxSampleRateBitDepth** (hard-spec): current product page lists "Native Sampling Rates: up to 192 kHz" and "Bit Depth: 16-24" → `24-bit/192kHz` — https://www.bluesound.com/products/node
- **dsdSupport** (hard-spec): "DSD Support: DSD256" → `dsd256-plus` — https://www.bluesound.com/products/node
- **hiResCertification** (marketing-fact): "Supported High-Quality Audio File Formats: FLAC, MQA, WAV, AIFF, MPEG-4 SLS" → `["mqa"]` — https://www.bluesound.com/products/node
- **dacChipsetFamily** (hard-spec): "DAC: ESS ES9039Q2M" and "ESS SABRE® DAC" → `["ess-sabre"]` — https://www.bluesound.com/products/node
- **streamingPlatformSupport** (marketing-fact): "3rd-Party Integrations: AirPlay 2, Spotify Connect (also support for Spotify Lossless), Tidal Connect, Qobuz Connect, Roon Ready, Dirac Live Ready" → `airplay2`, `spotify-connect`, `tidal-connect`, `roon-ready` (Qobuz and Dirac are not in the schema enum) — https://www.bluesound.com/products/node
- **networkConnection** (hard-spec): "Wi-Fi Built In: Wi-Fi 5 (802.11ac), dual-band" and "Ethernet/LAN: Ethernet RJ45, Gigabit 1000 Mbps" → `["wifi", "ethernet"]` — https://www.bluesound.com/products/node
- **bluetoothCodecs** (hard-spec): "Bluetooth Quality: Bluetooth 5.2 aptX Adaptive" → `["aptX Adaptive"]` — https://www.bluesound.com/products/node
- **voiceAssistant** (marketing-fact): "Voice Control Integrations: Amazon Alexa Skills" → `["alexa"]` — https://www.bluesound.com/products/node
- **multiroomSupport** (marketing-fact): product page describes "seamless multi-room music throughout the home" and "wirelessly connect to Bluesound Players" → `true` — https://www.bluesound.com/products/node
- **finishColor** (marketing-fact): "Finish: Black or White: Matte Satin Paint" → `["black", "white"]` — https://www.bluesound.com/products/node
- **rackMountable19** (marketing-fact): no 19" rack-mount feature or rack ears are described; dimensions 220 x 46 x 146 mm are for desktop placement → `false` — https://www.bluesound.com/products/node
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**, **outputs**: these fields are domain-gated in `productType.ts` to amplifier `deviceType` values (`integrated-amplifier`, `power-amplifier`, `preamplifier`, `av-surround-receiver`, `stereo-receiver`); `deviceType` is `network-streamer`, so they are recorded as `null` per schema — https://www.bluesound.com/products/node

## Conflict / Caution Notes
- **maxSampleRateBitDepth conflict**: the manufacturer product page (current N132, verified 2026-09-14) states "Native Sampling Rates: up to 192 kHz" and "Bit Depth: 16-24". An older manufacturer data sheet for the NODE (N130, dated 2021) states "DAC: 32-Bit, 384kHz Differential Output design" — https://content-bluesound-com.s3.amazonaws.com/uploads/2021/05/Bluesound-NODE-Data-Sheet.pdf. Per the sourcing protocol's manufacturer self-contradiction rule, the currently-live product page is the more current source and is preferred; the value is recorded as `24-bit/192kHz` and the older data sheet claim is noted here.
- **inputs / rca**: the source describes the analog input as a "Combo - Mini TOSLINK/Stereo 3.5mm" jack, not a pair of RCA connectors. The `inputs` enum has no `3.5mm` or generic `analog` value, so the analog portion is mapped to `rca` as the closest unbalanced line-level input type; this is a connector/format mismatch.
- **trigger12v**: the product page spec table lists "Trigger Out: 12 Volt", but `trigger12v` is domain-gated to amplifier `deviceType` values in the schema, so it is recorded as `null` for the `network-streamer` `deviceType`; the source fact is preserved in this note.
- **outputs**: the NODE has multiple physical audio outputs ("Audio Output: Analog RCA Stereo with Fixed option; USB Audio 2.0 (Type A)", "Coaxial Output: RCA", "Optical Output: TOSLINK digital optical", "Subwoofer Output: RCA x 1; Wireless to PULSE SUB+", "Headphone Output: 6.3mm Stereo; Bluetooth"), but the `outputs` field in `productType.ts` is domain-gated to amplifier `deviceType` values only and is recorded as `null` for `network-streamer`.
- **countryOfManufacture**: no country of manufacture or final assembly is stated on the manufacturer product page or in the manual; Bluesound International is headquartered in Toronto, Canada, but that is not a manufacturing location. A third-party retailer page contains a generic notice that "many of our audio products are made in China", but it does not attribute a specific country of manufacture to this product.
- **awards**: the manufacturer product page does not list any named awards or recognitions for the NODE; the field is an empty list rather than `null`.
