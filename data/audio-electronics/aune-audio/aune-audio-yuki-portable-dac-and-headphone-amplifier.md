---
product_id: MrEMtYwMtrFDGWmRnRGtU3
product_slug: aune-audio-yuki-portable-dac-and-headphone-amplifier
brand: Aune Audio
name: Aune Audio YUKI Portable DAC and Headphone Amplifier
slice: audio-electronics
price: 16900
spec_fields:
  brand:
  - aune-audio
  customerRating: null
  condition: new
  inStock: true
  dealsDiscount: none
  newArrival: false
  awards: null
  deviceType: dac
  deviceConnectivity: wired
  formFactor: dongle
  dacIncluded: true
  balancedOutput: true
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
  - usb
  outputs: null
  maxSampleRateBitDepth: 32-bit / 384 kHz
  dsdSupport: dsd256-plus
  hiResCertification: null
  dacChipsetFamily:
  - cirrus-logic
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
  multiroomSupport: null
  finishColor:
  - white
  rackMountable19: false
  countryOfManufacture: China
source_urls:
- https://api.en.auneaudio.com/storage/v1/object/public/downloads/resources/1771982705581/Yuki_User_Manual.pdf
- https://www.audiomagic.eu/en/headphones/headphone-electronics/dac/aune-yuki
verified_at: '2026-09-14'
data_status: COMPLETE
---
## Verification Notes

- **brand** (hard-spec): filterAttributes.brand in Sanity = ['aune-audio']; source confirms brand 'Aune'.
- **condition** (marketing-fact): product listed as new by retailer; no open-box/refurbished indication.
- **inStock** (internal): Sanity product record shows stock 36 / reservedStock 0.
- **dealsDiscount** (internal): no sale or clearance callout on the sources.
- **newArrival** (internal): no 'new arrival' callout found.
- **awards** (marketing-fact): no named awards found.
- **deviceType** (marketing-fact): source describes Yuki as a 'portable USB digital-to-analog converter' and 'USB DAC with Headphone Amp'; the should-be list includes 'DAC', recorded as dac.
- **deviceConnectivity** (marketing-fact): USB Type-C input only; no Bluetooth or Wi-Fi.
- **formFactor** (legacy): source calls it a 'dongle' and 'portable DAC/AMP'; recorded as dongle.
- **dacIncluded** (legacy): dual CS43198 DAC chips are built in.
- **balancedOutput** (legacy): 4.4mm balanced headphone output is listed.
- **amplification** (hard-spec): the amplification field is domain-gated to amplifier product categories; with deviceType dac it is not applicable, recorded as null.
- **powerOutputPerChannelW** (hard-spec): headphone output power is quoted in mW at 32Ω (160mW balanced, 90mW single-ended), not W RMS per channel; recorded as null.
- **channelCount** (hard-spec): no explicit channel-count wording; recorded as null.
- **phonoStageBuiltIn / trigger12v / remoteControlIncluded** (hard-spec/marketing-fact): not applicable to a DAC/amp dongle.
- **inputs** (hard-spec): USB Type-C digital input; recorded as usb.
- **outputs** (hard-spec): the outputs field is domain-gated to amplifier product categories; with deviceType dac it is not applicable, recorded as null.
- **maxSampleRateBitDepth** (hard-spec): manufacturer user manual states 'Max bit depth: 32bit' and 'Max sampling rate: 384k'.
- **dsdSupport** (hard-spec): user manual states 'Max DSD rate (native): DSD256'; mapped to dsd256-plus.
- **hiResCertification** (marketing-fact): no MQA or Hi-Res Audio certification stated on the sources.
- **dacChipsetFamily** (hard-spec): user manual and retailer state '2 x Cirrus Logic CS43198'; recorded as cirrus-logic.
- **streamingPlatformSupport / networkConnection / bluetoothCodecs / voiceAssistant / multiroomSupport** (marketing-fact): no streaming, network, Bluetooth or voice-assistant features.
- **finishColor** (marketing-fact): manufacturer user manual 'Yuki at a Glance' illustration shows a white casing with gold accents; recorded as white.
- **rackMountable19** (marketing-fact): dimensions 53.5 x 24 x 13mm are not a 19-inch rack form factor.
- **countryOfManufacture** (hard-spec): manufacturer user manual last page reads 'aune | 430034 WUHAN | CHINA'.

## Conflict / Caution Notes

- **Max sampling rate conflict:** the manufacturer user manual states 32-bit/384kHz, while some retailer listings quote 32-bit/768kHz. The CS43198 DAC chip is specified up to 384kHz PCM, so the manual value is used and the 768kHz claim is recorded as a conflict.
