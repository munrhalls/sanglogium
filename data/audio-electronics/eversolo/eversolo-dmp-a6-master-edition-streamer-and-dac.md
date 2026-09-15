---
product_id: MrEMtYwMtrFDGWmRnN8E5N
product_slug: eversolo-dmp-a6-master-edition-streamer-and-dac
brand: Eversolo
name: Eversolo DMP-A6 Master Edition Streamer and DAC
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
  finishColor:
    - black
    - silver
  rackMountable19: false
  awards: []
source_urls:
  - "https://eversolo.eu/dmp-a6-master-edition/"
verified_at: 2026-09-14
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (hard-spec): EVERSOLO DMP-A6 Master Edition Gen 2 — https://eversolo.eu/dmp-a6-master-edition/
- **deviceConnectivity** (hard-spec): "Wireless Network: WiFi 2.4G + 5G Dual-Band" and "Ethernet: RJ-45 (10/100/1000Mbps)" → wifi-networked — https://eversolo.eu/dmp-a6-master-edition/
- **formFactor** (marketing-fact): desktop chassis, L 187mm × W 270mm × H 90mm → desktop — https://eversolo.eu/dmp-a6-master-edition/
- **dacIncluded** (hard-spec): DAC ES 9038Q2M ×2 → true — https://eversolo.eu/dmp-a6-master-edition/
- **balancedOutput** (hard-spec): "Analog Audio Output: Pre-output: XLR (Balanced) + RCA (Unbalanced)" and XLR output level 5.2V → true — https://eversolo.eu/dmp-a6-master-edition/
- **inputs** (hard-spec): USB-B Audio Input, Optical/Coaxial Audio Input, HDMI ARC Input, Bluetooth Audio Input, RJ-45 Ethernet → usb, optical, coaxial, hdmi-earc, bluetooth, ethernet-lan — https://eversolo.eu/dmp-a6-master-edition/
- **maxSampleRateBitDepth** (hard-spec): "Music Playback & DAC Decoding: Supports up to Stereo DSD512, PCM 768KHz 32Bit, MQA Format" → DSD512, PCM 768 kHz 32-bit, MQA — https://eversolo.eu/dmp-a6-master-edition/
- **dsdSupport** (hard-spec): DSD512 support → dsd256-plus — https://eversolo.eu/dmp-a6-master-edition/
- **hiResCertification** (hard-spec): MQA format support → mqa — https://eversolo.eu/dmp-a6-master-edition/
- **dacChipsetFamily** (hard-spec): DAC ES 9038Q2M ×2 → ess-sabre — https://eversolo.eu/dmp-a6-master-edition/
- **streamingPlatformSupport** (hard-spec): "Streaming: Roon Ready, DLNA, TIDAL Connect…" → roon-ready, dlna, tidal-connect — https://eversolo.eu/dmp-a6-master-edition/
- **networkConnection** (hard-spec): "Wireless Network: WiFi 2.4G + 5G Dual-Band" and "Ethernet: RJ-45 (10/100/1000Mbps)" → wifi, ethernet — https://eversolo.eu/dmp-a6-master-edition/
- **bluetoothCodecs** (hard-spec): "Bluetooth Audio Input: Bluetooth BT5.0, Supports SBC/AAC" → sbc, aac — https://eversolo.eu/dmp-a6-master-edition/
- **finishColor** (marketing-fact): product page has Black / Silver color tabs → black, silver — https://eversolo.eu/dmp-a6-master-edition/
- **rackMountable19** (marketing-fact): no 19" rack-mount feature described; desktop dimensions → false — https://eversolo.eu/dmp-a6-master-edition/
- **awards** (marketing-fact): no named awards or recognitions listed on manufacturer page → [] — https://eversolo.eu/dmp-a6-master-edition/

## Conflict / Caution Notes
- **Op-amp Chip**: the Master Edition Gen 2 spec table lists OPA1642, while the marketing overview states "OPA1612 I/V Operational Amplifier Network". This is a same-tier manufacturer self-contradiction; the op-amp value is not a schema filter field, but both claims are recorded here.
- **outputs / trigger12v / remoteControlIncluded**: the Master Edition has analog XLR/RCA pre-output, TRIGGER OUT, and mobile/touchscreen/tablet app control, but outputs, trigger12v, and remoteControlIncluded are domain-gated to amplifier deviceType values in productType.ts, so they are recorded as null for the network-streamer deviceType; source facts are preserved in this note.
- **catalogue name mismatch**: the catalogue product is named "Eversolo DMP-A6 Master Edition Streamer and DAC" while the current manufacturer page is "EVERSOLO DMP-A6 Master Edition Gen 2". The live source is used because the original Master Edition page is no longer published.
