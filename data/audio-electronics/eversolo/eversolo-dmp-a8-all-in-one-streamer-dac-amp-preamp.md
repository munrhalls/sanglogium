---
product_id: n10eAegrGspodtsQw12tbj
product_slug: eversolo-dmp-a8-all-in-one-streamer-dac-amp-preamp
brand: Eversolo
name: "Eversolo DMP-A8 All-In-One Streamer, DAC Amp, Preamp"
slice: audio-electronics
spec_fields:
  deviceType: network-streamer
  deviceConnectivity: wifi-networked
  formFactor: desktop
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  voiceAssistant: null
  multiroomSupport: null
  countryOfManufacture: null
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
  dacIncluded: true
  balancedOutput: true
  inputs:
    - usb
    - optical
    - coaxial
    - hdmi-earc
    - xlr-balanced
    - rca
    - bluetooth
    - ethernet-lan
  outputs: null
  maxSampleRateBitDepth: "DSD512, PCM 768 kHz 32-bit"
  dsdSupport: dsd256-plus
  hiResCertification: []
  dacChipsetFamily:
    - akm
  streamingPlatformSupport:
    - roon-ready
    - airplay2
    - dlna
    - tidal-connect
  networkConnection:
    - wifi
    - ethernet
  bluetoothCodecs:
    - sbc
    - aac
    - aptx
    - aptx-hd
    - ldac
  finishColor: null
  rackMountable19: false
  awards: []
source_urls:
  - "https://eversolo.eu/dmp-a8/"
  - "https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A8-User-Manual-v1.0.pdf"
verified_at: 2026-09-14
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (hard-spec): EVERSOLO DMP-A8 — https://eversolo.eu/dmp-a8/
- **deviceConnectivity** (hard-spec): "WiFi 2.4G + 5G dual band" and "RJ-45 (10/100/1000 Mbps)" → wifi-networked — https://eversolo.eu/dmp-a8/
- **formFactor** (marketing-fact): desktop chassis, W 388mm × L 248mm × H 90mm → desktop — https://eversolo.eu/dmp-a8/
- **dacIncluded** (hard-spec): DAC AK4191EQ + AK4499EX → true — https://eversolo.eu/dmp-a8/
- **balancedOutput** (hard-spec): "Analog Audio Output: Preamp Audio Output: XLR (Balanced) + RCA (Unbalanced)" and XLR output characteristics → true — https://eversolo.eu/dmp-a8/
- **inputs** (hard-spec): USB-B Audio Input, Optical/Coaxial Audio Input, HDMI ARC, Analog Preamp Audio Input (XLR + RCA), Bluetooth Audio Input, RJ-45 Ethernet → usb, optical, coaxial, hdmi-earc, xlr-balanced, rca, bluetooth, ethernet-lan — https://eversolo.eu/dmp-a8/
- **maxSampleRateBitDepth** (hard-spec): "Playback & DAC Decoding: Supports up to stereo DSD512, PCM 768KHz 32Bit" → DSD512, PCM 768 kHz 32-bit — https://eversolo.eu/dmp-a8/
- **dsdSupport** (hard-spec): DSD512 support → dsd256-plus — https://eversolo.eu/dmp-a8/
- **hiResCertification** (hard-spec): no MQA or Hi-Res Audio certification listed in current EU spec table or DMP-A8 user manual; recorded as empty list — https://eversolo.eu/dmp-a8/
- **dacChipsetFamily** (hard-spec): DAC AK4191EQ + AK4499EX → akm — https://eversolo.eu/dmp-a8/
- **streamingPlatformSupport** (hard-spec): "Streaming: Roon Ready, AirPlay, DLNA, Tidal Connect, etc." → roon-ready, airplay2, dlna, tidal-connect — https://eversolo.eu/dmp-a8/
- **networkConnection** (hard-spec): "WiFi 2.4G + 5G dual band" and "RJ-45 (10/100/1000 Mbps)" → wifi, ethernet — https://eversolo.eu/dmp-a8/
- **bluetoothCodecs** (hard-spec): user manual lists "BT5.0, SBC/AAC/aptX/aptX LL/aptX HD/LDAC" → sbc, aac, aptx, aptx-hd, ldac — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A8-User-Manual-v1.0.pdf
- **finishColor** (marketing-fact): no color options listed; chassis described as aviation aluminum only → null — https://eversolo.eu/dmp-a8/
- **rackMountable19** (marketing-fact): no 19" rack-mount feature or rack ears described; dimensions are for desktop placement → false — https://eversolo.eu/dmp-a8/
- **awards** (marketing-fact): no named awards or recognitions listed on manufacturer page → [] — https://eversolo.eu/dmp-a8/

## Conflict / Caution Notes
- **maxSampleRateBitDepth / MQA**: the catalogue product export lists "DSD512, PCM 768KHz 32Bit, MQA" but neither the current EU spec table nor the DMP-A8 user manual mentions MQA. Per Tier-1 sourcing, the value is recorded without MQA; the catalogue claim is noted here as unverified.
- **bluetoothCodecs**: the EU product page spec table lists "Bluetooth 5.0, supports SBC/AAC", while the official user manual lists the full set "SBC/AAC/aptX/aptX LL/aptX HD/LDAC". The manual is the more detailed Tier-1 source and is preferred; the EU table omission is noted.
- **outputs / trigger12v / remoteControlIncluded**: DMP-A8 has analog XLR/RCA pre-outputs, a Trigger out port, and an IR+Bluetooth remote, but these fields are domain-gated in productType.ts to amplifier deviceType values, so they are recorded as null for the network-streamer deviceType; source facts are preserved in this note.
