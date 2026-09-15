---
product_id: MrEMtYwMtrFDGWmRnRKRM6
product_slug: aune-audio-n7-headphone-amplifier
brand: Aune Audio
name: Aune Audio N7 Headphone Amplifier
slice: audio-electronics
price: 39900
spec_fields:
  brand:
  - aune-audio
  customerRating: null
  condition: new
  inStock: true
  dealsDiscount: none
  newArrival: false
  awards: null
  deviceType: null
  deviceConnectivity: wired
  formFactor: desktop
  dacIncluded: false
  balancedOutput: true
  amplification: solid-state
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: none
  trigger12v: false
  remoteControlIncluded: true
  inputs:
  - rca
  - xlr-balanced
  outputs:
  - headphone-jack
  - pre-out-rca
  - pre-out-xlr
  maxSampleRateBitDepth: null
  dsdSupport: null
  hiResCertification: null
  dacChipsetFamily: null
  streamingPlatformSupport: null
  networkConnection: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  bluetoothCodecs: null
  voiceAssistant: null
  multiroomSupport: false
  finishColor: null
  rackMountable19: false
  countryOfManufacture: China
source_urls:
- https://api.en.auneaudio.com/storage/v1/object/public/downloads/resources/1771982590786/N7_User_Manual.pdf
- https://www.aune-store.com/en/n-series/aune-n7/aune-n7-class-a-headphone-amplifier_110119_1273/
verified_at: '2026-09-14'
data_status: COMPLETE
---
## Verification Notes

- **brand** (hard-spec): filterAttributes.brand in Sanity = ['aune-audio']; source confirms brand 'Aune'.
- **condition** (marketing-fact): aune-store.com lists a regular new-item price.
- **inStock** (internal): Sanity product record shows stock 36 / reservedStock 0.
- **dealsDiscount** (internal): no sale or clearance callout.
- **newArrival** (internal): no 'new arrival' callout.
- **awards** (marketing-fact): no named awards found.
- **deviceType** (marketing-fact): source describes product as a 'Class-A headphone amplifier' and 'preamplifier'; the should-be Product Category list does not include 'headphone amplifier', recorded as null.
- **deviceConnectivity** (marketing-fact): RCA and XLR analog inputs only; no Bluetooth or Wi-Fi.
- **formFactor** (legacy): aune-store.com describes a 'desktop setup' and 'compact' desktop unit.
- **dacIncluded** (legacy): N7 is an analog headphone amplifier/preamplifier (the separate N7D adds a DAC).
- **balancedOutput** (legacy): 4.4mm and XLR balanced outputs are listed.
- **amplification** (hard-spec): source describes fully discrete Class-A with twin JFET input; no vacuum tubes, recorded as solid-state.
- **powerOutputPerChannelW** (hard-spec): manual provides output power in mW across multiple loads, not a single W RMS per-channel value; recorded as null.
- **channelCount** (hard-spec): no explicit '2.0' in source; recorded as null.
- **phonoStageBuiltIn** (hard-spec): no phono input mentioned; recorded as none.
- **trigger12v** (marketing-fact): no 12V trigger or custom-install-ready language.
- **remoteControlIncluded** (marketing-fact): aune-store.com explicitly states 'Includes remote control'.
- **inputs** (hard-spec): user manual panel shows RCA in and XLR in; recorded as rca and xlr-balanced.
- **outputs** (hard-spec): manual lists 6.35mm/4.4mm headphone outputs and RCA/XLR preamp outputs.
- **maxSampleRateBitDepth / dsdSupport / dacChipsetFamily / hiResCertification** (hard-spec/marketing-fact): no DAC or digital source section.
- **streamingPlatformSupport / networkConnection / bluetoothCodecs / voiceAssistant** (marketing-fact): no streaming, network, Bluetooth or voice-assistant features.
- **multiroomSupport** (marketing-fact): no multi-room/multi-zone language found.
- **finishColor** (marketing-fact): no single color name confirmed for this product.
- **rackMountable19** (marketing-fact): dimensions 208 x 160 x 83mm are not a 19-inch rack form factor.
- **countryOfManufacture** (hard-spec): user manual last page reads 'aune | 430034 WUHAN | CHINA'.

## Conflict / Caution Notes

- **USB input:** the manual display indicator section mentions a 'USB' input icon, but the rear panel and operating instructions only list RCA/XLR line inputs. USB is not recorded as an input because the hardware panel does not show a USB input.
