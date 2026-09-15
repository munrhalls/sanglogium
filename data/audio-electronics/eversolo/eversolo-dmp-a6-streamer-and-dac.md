---
product_id: n10eAegrGspodtsQw134Ce
product_slug: eversolo-dmp-a6-streamer-and-dac
brand: Eversolo
name: Eversolo DMP-A6 Streamer and DAC
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
    - bluetooth
    - ethernet-lan
  outputs: null
  maxSampleRateBitDepth: "DSD512, PCM 768 kHz 32-bit, MQA"
  dsdSupport: dsd256-plus
  hiResCertification:
    - mqa
  dacChipsetFamily:
    - ess-sabre
  streamingPlatformSupport:
    - roon-ready
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
  - "https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf"
verified_at: 2026-09-14
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (hard-spec): Eversolo DMP-A6 all-in-one streamer — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **deviceConnectivity** (hard-spec): "WiFi: 2.4G+5G" and "Ethernet: RJ-45(10/100/1000Mbps)" → wifi-networked — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **formFactor** (marketing-fact): aluminium-alloy desktop chassis → desktop — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **dacIncluded** (hard-spec): "DAC: ES9038Q2M*2" → true — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **balancedOutput** (hard-spec): "Analogue Audio Output: XLR (balanced) + RCA" and XLR output level 5V → true — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **inputs** (hard-spec): USB-C Audio Input, Optical/Coaxial Input, Bluetooth Audio Input, RJ-45 Ethernet for network streaming → usb, optical, coaxial, bluetooth, ethernet-lan — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **maxSampleRateBitDepth** (hard-spec): "DAC Decoding: Support DSD512 stereo, PCM 768KHz 32Bit, MQA" → DSD512, PCM 768 kHz 32-bit, MQA — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **dsdSupport** (hard-spec): DSD512 support → dsd256-plus — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **hiResCertification** (hard-spec): MQA decoding listed → mqa — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **dacChipsetFamily** (hard-spec): "DAC: ES9038Q2M*2" → ess-sabre — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **streamingPlatformSupport** (hard-spec): "Music Streaming: Roon Ready, Tidal Connect, WebDav, UPnP, DLNA etc" → roon-ready, dlna, tidal-connect (WebDAV/UPnP are protocols, not platform enum values) — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **networkConnection** (hard-spec): "WiFi: 2.4G+5G" and "Ethernet: RJ-45(10/100/1000Mbps)" → wifi, ethernet — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **bluetoothCodecs** (hard-spec): "Bluetooth Input: Bluetooth BT5.0, SBC/AAC/aptX/aptX LL/aptX HD/LDAC" → sbc, aac, aptx, aptx-hd, ldac (aptX LL not in schema enum and omitted) — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **finishColor** (marketing-fact): no color options listed; body material is aluminium alloy → null — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **rackMountable19** (marketing-fact): no 19" rack-mount feature described; desktop placement → false — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf
- **awards** (marketing-fact): no named awards or recognitions listed in manual → [] — https://music.eversolo.com/dmp/instruction/EVERSOLO-DMP-A6-User-Manual-v1.0.pdf

## Conflict / Caution Notes
- **outputs / remoteControlIncluded**: the original DMP-A6 has XLR/RCA analogue output, USB/HDMI/optical/coaxial audio outputs, and app/touchscreen control, but outputs and remoteControlIncluded are domain-gated to amplifier deviceType values in productType.ts and are recorded as null for the network-streamer deviceType; source facts are preserved in this note.
- **HDMI**: the manual describes HDMI Audio Output (up to 5.1) but the schema outputs/input enums do not include a generic HDMI value, so the HDMI output is not recorded in outputs.
