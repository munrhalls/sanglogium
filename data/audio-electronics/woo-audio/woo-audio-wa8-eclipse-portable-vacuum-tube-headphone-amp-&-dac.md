---
product_id: k27n1AQuIbSr5iozG1vIfh
product_slug: woo-audio-wa8-eclipse-portable-vacuum-tube-headphone-amp-&-dac
brand: Woo Audio
name: Woo Audio WA8 Eclipse Portable Vacuum Tube Headphone Amp & DAC
slice: audio-electronics
spec_fields:
  deviceType: dac
  deviceConnectivity: wired
  amplification: tube
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - usb
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
    - Gold
    - Black
    - Space Gray
  rackMountable19: false
  countryOfManufacture: USA
  awards: null
  customerRating: null
  condition: null
  dealsDiscount: null
  newArrival: null
source_urls:
  - https://wooaudio.com/amplifiers/wa8
  - https://wooaudio.com/s/WA8-Quick-Guide.pdf
verified_at: '2026-09-14'
data_status: COMPLETE
---
## Verification Notes

- **deviceType** (marketing-fact): Product page calls it a "headphone amplifier and DAC" and says it has a "built-in 24bit/384kHz DAC". The should-be-audio-electronics.md Product Category list does not include "headphone amplifier"; the closest matching should-be category is **DAC**. Recorded as `dac`; the headphone-amp aspect is noted as a category gap. — https://wooaudio.com/amplifiers/wa8
- **deviceConnectivity** (marketing-fact): "XMOS xCORE-AUDIO asynchronous clocking USB Type-B Input x 1, 1/8" (3.5mm) analog Input x 1"; no Bluetooth/Wi-Fi. Recorded as `wired`. — https://wooaudio.com/amplifiers/wa8
- **amplification** (marketing-fact): "Single-Ended, Class-A" and "all-tubes" design with "Subminiature 6S31B power x2, 6021 driver x1". Recorded as `tube`. — https://wooaudio.com/amplifiers/wa8
- **powerOutputPerChannelW** (hard-spec): Product page lists a power rating in milliwatts at multiple loads: "250mW @32Ω, 350mW @50Ω, 180mW @120Ω, 120mW@300, 80mW @600Ω". No single W RMS value per channel is given. Recorded as `null`. — https://wooaudio.com/amplifiers/wa8
- **inputs** (marketing-fact): Source lists "USB Type-B Input x 1" and a "1/8" (3.5mm) analog Input x 1". The current schema `inputs` enum does not include 3.5mm, so only `usb` is recorded; the 3.5mm analog input is noted as present but not representable. — https://wooaudio.com/amplifiers/wa8
- **outputs** (marketing-fact): "1/4" (6.3mm) and 1/8" (3.5mm) headphone outputs (8–600 Ohms)". Recorded as `["headphone-jack"]`. — https://wooaudio.com/amplifiers/wa8
- **maxSampleRateBitDepth** (hard-spec): "ESS SABRE Reference 24bit/384kHz" PCM. Recorded as `24-bit/384kHz`. — https://wooaudio.com/amplifiers/wa8
- **dsdSupport** (hard-spec): "up to DSD256 (11.2MHz)". Recorded as `dsd256-plus`. — https://wooaudio.com/amplifiers/wa8
- **dacChipsetFamily** (marketing-fact): "ESS SABRE Reference ... DAC". Recorded as `["ess-sabre"]`. — https://wooaudio.com/amplifiers/wa8
- **finishColor** (marketing-fact): Color select shows "Gold" and "Black"; page text says "Anodized aluminum chassis available in black, space gray and gold". Recorded as `["Gold", "Black", "Space Gray"]` based on the more complete product description; select lists only Gold/Black at the time of sourcing. — https://wooaudio.com/amplifiers/wa8
- **rackMountable19** (marketing-fact): No 19" rack-mount feature mentioned; portable desktop unit. Recorded as `false`. — https://wooaudio.com/amplifiers/wa8
- **countryOfManufacture** (marketing-fact): "Designed and assembled in New York, USA". Recorded as `USA`. — https://wooaudio.com/amplifiers/wa8
- All other fields were checked against the manufacturer product page and the quick-start guide; where no value was found, they are recorded as `null`.
