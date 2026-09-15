---
product_id: PHPYj28HJdPDHAaIBChWTc
product_slug: aune-audio-s17-pro-evo-headphone-amplifier
brand: Aune Audio
name: Aune Audio S17 Pro EVO Headphone Amplifier
slice: audio-electronics
price: 79900
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
  finishColor:
  - black
  rackMountable19: false
  countryOfManufacture: China
source_urls:
- https://api.en.auneaudio.com/storage/v1/object/public/downloads/resources/1771982556502/S17_Pro_EVO_User_Manual.pdf
- https://www.aune-store.com/en/aune-s17-pro-evo_110409_1234/
- https://www.audiohum.com/gb/hi-fi-headphones/headphone-amplifier/aune-s17-pro-evo
verified_at: '2026-09-14'
data_status: COMPLETE
---
## Verification Notes

- **brand** (hard-spec): filterAttributes.brand in Sanity = ['aune-audio']; source confirms 'Aune'.
- **condition** (marketing-fact): aune-store.com lists a regular new-item price.
- **inStock** (internal): Sanity product record shows stock 21 / reservedStock 0.
- **dealsDiscount** (internal): no sale or clearance callout.
- **newArrival** (internal): no 'new arrival' callout.
- **awards** (marketing-fact): no named awards found.
- **deviceType** (marketing-fact): source describes product as a 'fully discrete Class-A headphone amplifier'; the should-be Product Category list does not include 'headphone amplifier', recorded as null.
- **deviceConnectivity** (marketing-fact): RCA and XLR analog inputs only; no Bluetooth or Wi-Fi.
- **formFactor** (legacy): source describes a desktop unit.
- **dacIncluded** (legacy): S17 Pro EVO is an analog headphone amplifier/preamplifier.
- **balancedOutput** (legacy): 4.4mm, 6.35mm and 4-pin XLR outputs include balanced options.
- **amplification** (hard-spec): source describes fully discrete Class-A with twin JFET and transistor output stage; no vacuum tubes, recorded as solid-state.
- **powerOutputPerChannelW** (hard-spec): manual provides output power in mW across multiple loads (max 7,500mW balanced into 32Ω), not a single W RMS per-channel speaker value; recorded as null.
- **channelCount** (hard-spec): no explicit '2.0' in source; recorded as null.
- **phonoStageBuiltIn** (hard-spec): no phono input mentioned; recorded as none.
- **trigger12v** (marketing-fact): no 12V trigger or custom-install-ready language.
- **remoteControlIncluded** (marketing-fact): user manual lists 'remote control' in accessories and aune-store.com mentions 'aluminium remote control'.
- **inputs** (hard-spec): user manual panel and audiohum list RCA and XLR line inputs.
- **outputs** (hard-spec): manual and audiohum list 6.35mm, 4.4mm and 4-pin XLR headphone outputs plus RCA/XLR preamp outputs.
- **maxSampleRateBitDepth / dsdSupport / dacChipsetFamily / hiResCertification** (hard-spec/marketing-fact): no DAC or digital source section.
- **streamingPlatformSupport / networkConnection / bluetoothCodecs / voiceAssistant** (marketing-fact): no streaming, network, Bluetooth or voice-assistant features.
- **multiroomSupport** (marketing-fact): no multi-room/multi-zone language.
- **finishColor** (marketing-fact): audiohum lists 'Colour Black'.
- **rackMountable19** (marketing-fact): dimensions 288 x 211 x 63mm are not a 19-inch rack form factor.
- **countryOfManufacture** (hard-spec): user manual last page reads 'aune | 430034 WUHAN | CHINA' (confirmed by reading the last page of the manufacturer PDF).

## Conflict / Caution Notes

- **Power output:** aune-store marketing says 'up to 7.5 W output power'; the manual gives a table of mW values into various headphone loads. powerOutputPerChannelW is left null because the source does not provide a single W RMS per-channel speaker value.
