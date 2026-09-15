---
product_id: MrEMtYwMtrFDGWmRnRGpuU
product_slug: aune-audio-bx2-magnum-portable-headphone-amplifier
brand: Aune Audio
name: Aune Audio BX2 Magnum Portable Headphone Amplifier
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
  formFactor: portable
  dacIncluded: false
  balancedOutput: true
  amplification: hybrid
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: none
  trigger12v: false
  remoteControlIncluded: false
  inputs:
  - rca
  - xlr-balanced
  outputs:
  - headphone-jack
  maxSampleRateBitDepth: null
  dsdSupport: null
  hiResCertification:
  - hi-res-audio
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
  countryOfManufacture: null
source_urls:
- https://www.aune-store.com/en/portable/aune-bx2-magnum/aune-bx2-magnum-headphone-amplifier_110216_1295/
- https://en.auneaudio.com/news/magnum-portable-headphone-amp-coming-soon-mkqnj66j
- https://headphones.com/products/aune-audio-bx2-magnum-portable-headphone-amplifier
verified_at: '2026-09-14'
data_status: COMPLETE
---
## Verification Notes

- **brand** (hard-spec): filterAttributes.brand in Sanity = ['aune-audio']; source confirms brand 'Aune Audio'.
- **condition** (marketing-fact): aune-store.com lists a regular new-item price with no open-box/refurbished indication.
- **inStock** (internal): Sanity product record shows stock 45 / reservedStock 0.
- **dealsDiscount** (internal): aune-store.com and headphones.com list regular price with no sale or clearance callout.
- **newArrival** (internal): product is a launched model with no 'new arrival' callout on the manufacturer page.
- **awards** (marketing-fact): no named awards or editor's-choice badges found on manufacturer or audited-retailer pages.
- **deviceType** (marketing-fact): source describes product as a 'portable headphone amplifier' and 'portable Class A headphone amplifier'; the should-be-audio-electronics.md Product Category list does not include 'headphone amplifier', so recorded as null.
- **deviceConnectivity** (marketing-fact): 3.5mm, 4.4mm balanced and RCA analog inputs; no Bluetooth or Wi-Fi.
- **formFactor** (legacy): source calls it 'portable' and 'portable headphone amplifier'.
- **dacIncluded** (legacy): no DAC function described; product is an analog headphone amplifier.
- **balancedOutput** (legacy): 4.4mm balanced headphone output is listed in the spec table.
- **amplification** (hard-spec): product uses dual Korg Nutube 6P1 vacuum tubes and transistor modes; headphones.com product filter lists 'Hybrid'; recorded as hybrid.
- **powerOutputPerChannelW** (hard-spec): source provides headphone output power in mW at multiple loads (5,180mW max balanced into 32Ω), not a single W RMS per-channel speaker value; recorded as null.
- **channelCount** (hard-spec): no explicit '2.0' or channel-count wording in the source; recorded as null.
- **phonoStageBuiltIn** (hard-spec): no phono/turntable input mentioned; recorded as none.
- **trigger12v** (marketing-fact): no 12V trigger or custom-install-ready language found.
- **remoteControlIncluded** (marketing-fact): no remote control mentioned in the box or features.
- **inputs** (hard-spec): source lists 3.5mm, 4.4mm balanced and dual RCA inputs; only rca and xlr-balanced values exist in the inputs vocabulary, so 3.5mm is not represented and 4.4mm balanced is encoded as xlr-balanced per the balanced-analog-input convention used in this repo.
- **outputs** (hard-spec): source lists 3.5mm and 4.4mm headphone outputs; recorded as headphone-jack.
- **maxSampleRateBitDepth / dsdSupport / dacChipsetFamily** (hard-spec): no DAC or digital source section.
- **hiResCertification** (marketing-fact): headphones.com key features list includes 'Hi-Res Audio certification'.
- **streamingPlatformSupport / networkConnection / bluetoothCodecs / voiceAssistant** (marketing-fact): no streaming, network, Bluetooth or voice-assistant features.
- **multiroomSupport** (marketing-fact): no multi-room/multi-zone language found.
- **finishColor** (marketing-fact): headphones.com describes 'All-aluminum CNC chassis in black and gold'; recorded primary color as black, gold is an accent.
- **rackMountable19** (marketing-fact): portable/desktop dimensions (186 x 92 x 38mm) are not a 19-inch rack form factor.
- **countryOfManufacture** (hard-spec): no explicit 'Made in' statement found on the product-specific sources; recorded as null.

## Conflict / Caution Notes

- **Output power format:** manufacturer and retailer sources quote headphone output power in mW across multiple loads, not a single W RMS per-channel value. powerOutputPerChannelW is left null rather than converting the 5,180mW balanced figure into 5.18W.
- **3.5mm / 4.4mm inputs:** the inputs vocabulary does not include 3.5mm or 4.4mm connector values. The 4.4mm balanced line input is mapped to xlr-balanced (the existing balanced-analog value); the 3.5mm unbalanced line input is not represented.
