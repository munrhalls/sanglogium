---
product_id: MrEMtYwMtrFDGWmRnRL7UE
product_slug: woo-audio-wa7-fireflies-3rd-gen-headphone-tube-amplifier
brand: Woo Audio
name: Woo Audio WA7 Fireflies 3rd Gen Headphone Tube Amplifier
slice: audio-electronics
spec_fields:
  deviceType: dac
  deviceConnectivity: wired
  amplification: tube
  powerOutputPerChannelW: 1.5
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - usb
    - rca
  outputs:
    - headphone-jack
  maxSampleRateBitDepth: 24-bit/384kHz
  dsdSupport: dsd256-plus
  hiResCertification: null
  dacChipsetFamily:
    - ess-sabre
  streamingPlatformSupport: null
  networkConnection: null
  bluetoothCodecs: null
  voiceAssistant: null
  multiroomSupport: null
  finishColor:
    - Platinum Silver
    - Midnight Black
  rackMountable19: false
  countryOfManufacture: USA
  awards: null
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
source_urls:
  - https://wooaudio.com/amplifiers/wa7-3rd-generation
  - https://wooaudio.com/s/WA7_3rd_manual.pdf
verified_at: '2026-09-14'
data_status: COMPLETE
---
## Verification Notes

- **deviceType** (marketing-fact): Product page calls the unit a "Class-A balanced headphone amplifier and DAC" with an "ESS SABRE Audiophile DAC". The should-be-audio-electronics.md Product Category list does not include "headphone amplifier"; the closest matching should-be category is **DAC**, because the unit contains a built-in DAC. Recorded as `dac`; the headphone-amp aspect is noted as a category gap. — https://wooaudio.com/amplifiers/wa7-3rd-generation
- **deviceConnectivity** (marketing-fact): Source lists "High-retention USB connector x 1" and "RCA analog Input x 1"; no Bluetooth or Wi-Fi/Networked connectivity is mentioned. Recorded as `wired`. — https://wooaudio.com/amplifiers/wa7-3rd-generation
- **amplification** (marketing-fact): "Class-A balanced headphone amplifier" driven by "a pair of 12AU7 vacuum tubes" and "5963 / 12AU7 tubes, self-biasing". Recorded as `tube`. — https://wooaudio.com/amplifiers/wa7-3rd-generation
- **powerOutputPerChannelW** (hard-spec): Product page states "Up to 1.5w power output (4.4mm balanced)"; manual (WA7_3rd_manual.pdf) states "balanced (recommended): 1.5W @ 4Ω". Both agree. Recorded as `1.5`. — https://wooaudio.com/amplifiers/wa7-3rd-generation and https://wooaudio.com/s/WA7_3rd_manual.pdf
- **inputs** (marketing-fact): "High-retention USB connector x 1" and "RCA analog Input x 1". Recorded as `["usb", "rca"]`. — https://wooaudio.com/amplifiers/wa7-3rd-generation
- **outputs** (marketing-fact): Product has "4.4mm (5-pole) ... balanced headphone output" and "6.3mm (1/4”) stereo headphone output"; it also has pre-out via 4.4mm and 3.5mm. The current schema `outputs` enum (`speaker-terminals`, `pre-out-rca`, `pre-out-xlr`, `headphone-jack`, `subwoofer-out`) does not represent 4.4mm/3.5mm pre-outs, so only `headphone-jack` is recorded. The pre-out feature is noted here as present but not representable. — https://wooaudio.com/amplifiers/wa7-3rd-generation
- **maxSampleRateBitDepth** (hard-spec): "ESS SABRE Audiophile DAC up to 24-bit/384kHz PCM". Recorded as `24-bit/384kHz`. — https://wooaudio.com/amplifiers/wa7-3rd-generation
- **dsdSupport** (hard-spec): Product page says "up to DSD256 (11.2MHz)"; manual (WA7_3rd_manual.pdf) says "DSD128/5.6 MHz". Same-tier manufacturer sources disagree. The live product page is treated as the current source and recorded as `dsd256-plus`; the manual's DSD128 reading is recorded as a conflict. — https://wooaudio.com/amplifiers/wa7-3rd-generation and https://wooaudio.com/s/WA7_3rd_manual.pdf
- **dacChipsetFamily** (marketing-fact): "ESS SABRE Audiophile DAC". Recorded as `["ess-sabre"]`. — https://wooaudio.com/amplifiers/wa7-3rd-generation
- **finishColor** (marketing-fact): "Platinum Silver" and "Midnight Black". Recorded as `["Platinum Silver", "Midnight Black"]`. — https://wooaudio.com/amplifiers/wa7-3rd-generation
- **rackMountable19** (marketing-fact): No 19" rack-mount feature mentioned; desktop cube form. Recorded as `false`. — https://wooaudio.com/amplifiers/wa7-3rd-generation
- **countryOfManufacture** (marketing-fact): "Designed and assembled in New York, USA". Recorded as `USA`. — https://wooaudio.com/amplifiers/wa7-3rd-generation
- All other fields were checked against the manufacturer product page and the manual PDF; where no value was found, they are recorded as `null`. Boolean marketable features that were not mentioned are recorded as `false`.
