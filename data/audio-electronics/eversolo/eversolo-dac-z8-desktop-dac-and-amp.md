---
product_id: Pn6oyV4Ks5AcNbecjkThBz
product_slug: eversolo-dac-z8-desktop-dac-and-amp
brand: Eversolo
name: Eversolo DAC-Z8 Desktop DAC and Amp
slice: audio-electronics
spec_fields:
  deviceType: dac
  deviceConnectivity: wired-wireless
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
    - bluetooth
    - usb
    - optical
    - coaxial
  outputs: null
  maxSampleRateBitDepth: "DSD512, PCM 768 kHz 32-bit, MQA"
  dsdSupport: dsd256-plus
  hiResCertification:
    - mqa
  dacChipsetFamily:
    - ess-sabre
  streamingPlatformSupport: null
  networkConnection: null
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
  - "https://eversolo.eu/dac-z8/"
  - "https://www.eversolo.com/files/DAC-Z8%20User%20Manual-v1.0.pdf"
verified_at: 2026-09-14
data_status: COMPLETE
---

## Verification Notes
- **deviceType** (hard-spec): EverSolo DAC-Z8, described as a DAC/headphone amp with no network streaming → dac — https://eversolo.eu/dac-z8/
- **deviceConnectivity** (hard-spec): wired digital inputs (USB-B, USB-C, optical, coaxial) plus Bluetooth audio input → wired-wireless — https://eversolo.eu/dac-z8/
- **formFactor** (marketing-fact): desktop chassis, 270mm (W) × 187mm (D) × 50mm (H) → desktop — https://eversolo.eu/dac-z8/
- **dacIncluded** (hard-spec): "DAC: ES9038Pro" → true — https://eversolo.eu/dac-z8/
- **balancedOutput** (hard-spec): "Analog Audio Output: Preamp output: XLR (balanced), RCA" and XLR characteristics table → true — https://eversolo.eu/dac-z8/
- **inputs** (hard-spec): Bluetooth Audio Input, USB-B DAC Input, USB-C DAC Input, Optical Audio Input, Coaxial Audio Input → bluetooth, usb, optical, coaxial — https://eversolo.eu/dac-z8/
- **maxSampleRateBitDepth** (hard-spec): "up to stereo DSD512, PCM 768kHz 32Bit, MQA" (USB-B/USB-C inputs) → DSD512, PCM 768 kHz 32-bit, MQA — https://eversolo.eu/dac-z8/
- **dsdSupport** (hard-spec): DSD512 support → dsd256-plus — https://eversolo.eu/dac-z8/
- **hiResCertification** (hard-spec): MQA full decoding and rendering listed for optical, coaxial, and USB inputs → mqa — https://eversolo.eu/dac-z8/
- **dacChipsetFamily** (hard-spec): "ESS Sabre flagship ES9038Pro" and "DAC: ES9038Pro" → ess-sabre — https://eversolo.eu/dac-z8/
- **streamingPlatformSupport** (hard-spec): no network streaming or platform support listed for this DAC → null — https://eversolo.eu/dac-z8/
- **networkConnection** (hard-spec): no Wi-Fi or Ethernet listed → null — https://eversolo.eu/dac-z8/
- **bluetoothCodecs** (hard-spec): user manual lists "支持 SBC/AAC/aptX/aptX LL/aptX HD/LDAC" → sbc, aac, aptx, aptx-hd, ldac — https://www.eversolo.com/files/DAC-Z8%20User%20Manual-v1.0.pdf
- **finishColor** (marketing-fact): no color options listed; chassis described as aviation aluminum alloy → null — https://eversolo.eu/dac-z8/
- **rackMountable19** (marketing-fact): no 19" rack-mount feature described; desktop dimensions → false — https://eversolo.eu/dac-z8/
- **awards** (marketing-fact): no named awards or recognitions listed on manufacturer page → [] — https://eversolo.eu/dac-z8/

## Conflict / Caution Notes
- **bluetoothCodecs**: the EU product-page spec table lists "Bluetooth Audio Input: Qualcomm QCC5125 Bluetooth module, BT 5.0, Support SBC/AAC", while the official DAC-Z8 user manual lists the full set "SBC/AAC/aptX/aptX LL/aptX HD/LDAC". The manual is the more detailed Tier-1 source and is preferred; the EU table omission is noted.
- **outputs**: the DAC-Z8 has preamp XLR/RCA outputs and a 6.35mm headphone output, but the outputs field in productType.ts is domain-gated to amplifier deviceType values and is recorded as null for the dac deviceType; source facts are preserved in this note.
