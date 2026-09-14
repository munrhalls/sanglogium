---
product_id: "Pn6oyV4Ks5AcNbecjguegb"
product_slug: "rme-adi-2-dac-fs-desktop-dac-headphone-amp"
brand: "RME"
name: "RME ADI-2 DAC FS Desktop DAC & Headphone Amp"
slice: "audio-electronics"
spec_fields:
  price:
    min: 1299
    max: 1299
    currency: "USD"
  customerRating: null
  awards:
    - "Reviewers' Choice - SoundStage! Hi-Fi"
    - "Recommended Reference Component - SoundStage! Hi-Fi"
  condition: null
  inStock: null
  dealsDiscount: null
  newArrival: null
  deviceType: "dac"
  deviceConnectivity: "wired"
  formFactor: "desktop"
  amplification: null
  dacIncluded: true
  balancedOutput: true
  powerOutputPerChannelW: null
  channelCount: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
  outputs: null
  maxSampleRateBitDepth: "32-bit / 768 kHz"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "hi-res-audio"
  dacChipsetFamily:
    - "ess-sabre"
  streamingPlatformSupport: null
  networkConnection: null
  driveType: null
  turntableOperation: null
  speedsSupported: null
  phonoPreampBuiltIn: null
  cartridgeIncluded: null
  usbDigitalOutput: null
  voiceAssistant: null
  multiroomSupport: null
  bluetoothCodecs: null
  finishColor:
    - "Black"
  rackMountable19: false
  countryOfManufacture: "Germany"
source_urls:
  - "https://rme-audio.de/adi-2-dac.html"
  - "https://rme-audio.de/downloads/adi2dac_e.pdf"
  - "https://headphones.com/products/rme-adi-2-dac-fs"
  - "https://foundsound.com.au/products/21299"
  - "https://www.iglooaudio.co.uk/rme-adi-2-dac-fs-digital-analogue-converter.html"
  - "https://mail.soundstagehifi.com/index.php/reference-components/1759-recommended-reference-component-rme-adi-2-dac-fs-digital-to-analog-converter"
  - "https://www.bl2.it/en/dac-converter-usb/3143-rme-adi-2-dac-fs-balanced-dac-headphone-amplifier-es9028q2m-32bit-768khz-dsd256-black-4260123363277.html"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (hard-spec): `{min: 1299, max: 1299, currency: "USD"}` - Headphones.com lists "Regular price $1,299" and "Sale price $1,299.00". Source: https://headphones.com/products/rme-adi-2-dac-fs

- **customerRating** (internal): `null` - no aggregate customer rating is displayed on the source pages.

- **awards** (marketing-fact): `["Reviewers' Choice - SoundStage! Hi-Fi", "Recommended Reference Component - SoundStage! Hi-Fi"]` - SoundStage! Hi-Fi states the ADI-2 DAC FS "earned the ADI-2 DAC FS a Reviewers' Choice award at the time the review was published - but its objective and subjective performance is what's earned the ADI-2 a Recommended Reference Component award now." Source: https://mail.soundstagehifi.com/index.php/reference-components/1759-recommended-reference-component-rme-adi-2-dac-fs-digital-to-analog-converter

- **condition** (internal): `null` - no explicit condition / stock-type value is stated on the manufacturer or major retailer pages used.

- **inStock** (internal): `null` - availability is store-level inventory; the Headphones.com listing reports "Sold out", but this is not the Sang Logium store, so the field is left explicit null pending a store-specific source.

- **dealsDiscount** (internal): `null` - no sale or clearance discount is offered on Headphones.com (regular price equals sale price) and no other deal is cited.

- **newArrival** (internal): `null` - no "New Arrival" callout is present on the sources used.

- **deviceType** (marketing-fact): `"dac"` - the manufacturer product title is "ADI-2 DAC FS Ultra-Fidelity PCM/DSD 768 kHz DA Converter" and Headphones.com titles it "RME ADI-2 DAC FS Desktop DAC & Headphone Amp". Source: https://rme-audio.de/adi-2-dac.html, https://headphones.com/products/rme-adi-2-dac-fs

- **deviceConnectivity** (marketing-fact): `"wired"` - Headphones.com connectivity field reads "Wired" and the product has USB, SPDIF coaxial and SPDIF optical inputs only. Source: https://headphones.com/products/rme-adi-2-dac-fs

- **formFactor** (marketing-fact): `"desktop"` - Headphones.com portability field reads "Not Portable" and the product name is "Desktop DAC & Headphone Amp". Source: https://headphones.com/products/rme-adi-2-dac-fs

- **amplification** (hard-spec / domain-gated): `null` - Headphones.com shows an "Amplifier type" field of "Solid-state", but the schema's `amplification` field is domain-gated to the five amplifier `deviceType` values; `deviceType` is `dac`, so this field does not apply. Source: https://headphones.com/products/rme-adi-2-dac-fs

- **dacIncluded** (marketing-fact): `true` - the product is a DAC; manufacturer and retailer titles and descriptions both identify it as a digital-to-analog converter. Source: https://rme-audio.de/adi-2-dac.html, https://headphones.com/products/rme-adi-2-dac-fs

- **balancedOutput** (hard-spec): `true` - the manual states "The rear of the ADI-2 DAC has ... 2 XLR sockets as balanced outputs" and the XLR output specs are listed under "Analog Outputs". Source: https://rme-audio.de/downloads/adi2dac_e.pdf (sections 19.2 and 30.2)

- **powerOutputPerChannelW** (hard-spec / domain-gated): `null` - the headphone output section lists "Max power @ 0.001% THD: 1.5 W per channel", but the field is domain-gated to amplifier `deviceType`s and does not apply to a `dac`. Source: https://rme-audio.de/downloads/adi2dac_e.pdf (section 30.2 Phones)

- **channelCount** (hard-spec / domain-gated): `null` - the field is domain-gated to amplifier `deviceType`s and does not apply to `dac`. The product is a 2-channel DAC, not an amplifier.

- **phonoStageBuiltIn** (marketing-fact / domain-gated): `null` - no phono input or built-in phono stage is mentioned in any source; field is domain-gated to amplifier `deviceType`s.

- **trigger12v** (marketing-fact / domain-gated): `null` - no 12V trigger or custom-install feature is mentioned; field is domain-gated to amplifier `deviceType`s.

- **remoteControlIncluded** (marketing-fact / domain-gated): `null` - the product includes an MRC remote, but the schema's `remoteControlIncluded` field is domain-gated to amplifier `deviceType`s and does not apply to `dac`. Source: https://rme-audio.de/adi-2-dac.html

- **inputs** (hard-spec): `["usb", "optical", "coaxial"]` - the manual "Digital Inputs" section lists "SPDIF coaxial 1 x RCA", "SPDIF optical 1 x optical, ADAT compatible" and the rear panel has a USB socket. Product page: "SPDIF coaxial, SPDIF optical (ADAT compatible) and USB". Source: https://rme-audio.de/downloads/adi2dac_e.pdf (section 30.1), https://rme-audio.de/adi-2-dac.html

- **outputs** (hard-spec / domain-gated): `null` - the product has line-out (RCA/XLR) and headphone outputs, but the schema's `outputs` field is domain-gated to amplifier `deviceType`s and does not apply to `dac`.

- **maxSampleRateBitDepth** (hard-spec): `"32-bit / 768 kHz"` - the manual cover states "32 Bit / 768 kHz Digital Audio" and the technical specifications state "Internally supported sample rates: 44.1 kHz up to 768 kHz". Source: https://rme-audio.de/downloads/adi2dac_e.pdf (cover and section 30.3)

- **dsdSupport** (hard-spec): `"dsd256-plus"` - the manual and product page state "DSD at up to 768 kHz / DSD256" and section 17 lists DSD64, DSD128 and DSD256 playback; the schema's top DSD support option is `dsd256-plus`, which is used to record DSD256-capable products. Source: https://rme-audio.de/downloads/adi2dac_e.pdf (sections 4 and 17), https://rme-audio.de/adi-2-dac.html

- **hiResCertification** (marketing-fact): `["hi-res-audio"]` - the manual cover lists "Hi-Res Audio"; no MQA or other certification is mentioned. Source: https://rme-audio.de/downloads/adi2dac_e.pdf

- **dacChipsetFamily** (hard-spec): `["ess-sabre"]` - the manufacturer product page states "The updated ADI-2 DAC uses ESS's ES9028Q2M" and SoundStage! Hi-Fi confirms "ESS Technology ES9028Q2M digital-to-analog conversion chip". ESS Sabre is the family. Source: https://rme-audio.de/adi-2-dac.html, https://mail.soundstagehifi.com/index.php/reference-components/1759-recommended-reference-component-rme-adi-2-dac-fs-digital-to-analog-converter

- **streamingPlatformSupport** (marketing-fact / domain-gated): `null` - no AirPlay, Chromecast, Spotify Connect, TIDAL Connect, Roon Ready or DLNA support is listed; the product is a pure USB/SPDIF DAC.

- **networkConnection** (marketing-fact / domain-gated): `null` - no Wi-Fi or Ethernet is listed; the product is a pure USB/SPDIF DAC.

- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (hard-spec / marketing-fact / domain-gated): `null` - this field group is domain-gated to `deviceType: turntable`; this product is a `dac`.

- **bluetoothCodecs** (marketing-fact): `null` - no Bluetooth is listed on any source page; `deviceConnectivity` is `wired`.

- **voiceAssistant** (marketing-fact / domain-gated): `null` - `deviceConnectivity` is `wired`, not `bluetooth` / `wifi-networked` / `wired-wireless`.

- **multiroomSupport** (marketing-fact / domain-gated): `null` - `deviceConnectivity` is `wired`.

- **finishColor** (marketing-fact): `["Black"]` - Found Sound lists "Finish: Black" and Igloo Audio lists "Finish Options: Black". Source: https://foundsound.com.au/products/21299, https://www.iglooaudio.co.uk/rme-adi-2-dac-fs-digital-analogue-converter.html

- **rackMountable19** (marketing-fact): `false` - the manual describes a "half-rack (9.5\") enclosure of 1 U height" and the product page calls it "compact half 19\" format factor"; no 19\" rack-mount kit or claim is listed for the ADI-2 DAC FS itself. Source: https://rme-audio.de/downloads/adi2dac_e.pdf (section 4), https://rme-audio.de/adi-2-dac.html

- **countryOfManufacture** (marketing-fact): `"Germany"` - the manual lists the RME Audio AG address in "D-85778 Haimhausen / Germany"; Found Sound lists "Made In: Germany". Source: https://rme-audio.de/downloads/adi2dac_e.pdf, https://foundsound.com.au/products/21299

## Conflict / Caution Notes

- The manufacturer and major retailers describe the ADI-2 DAC FS as a DAC/headphone-amp; the audio-electronics `deviceType` schema vocabulary does not include a `headphone-amp` value, so the product is filed as `dac`, the closest matching category.

- `dsdSupport` is recorded as `dsd256-plus` because the source confirms DSD64, DSD128 and DSD256 support and that is the highest option in the current `dsdSupport` enum. A future schema revision may want a dedicated `dsd256` (non-plus) value for products that stop at DSD256.

- `amplification`, `powerOutputPerChannelW`, `channelCount`, `outputs` (amp taxonomy), `phonoStageBuiltIn`, `trigger12v` and `remoteControlIncluded` are all domain-gated to amplifier `deviceType`s in the schema. Although the product contains a headphone amplifier, it is classified as a `dac`, so those fields are `null` rather than force-fit.

- `inputs` is scoped to the digital input types (USB, optical, coaxial) that the schema exposes for digital-source `deviceType`s. The SPDIF coaxial input uses an RCA connector, but the source calls it "SPDIF coaxial", so `coaxial` is recorded without adding the separate `rca` value.

- `inStock`, `condition`, `dealsDiscount` and `newArrival` are store/inventory-level fields; they are left `null` because this sourcing pass has no live Sang Logium inventory data.
