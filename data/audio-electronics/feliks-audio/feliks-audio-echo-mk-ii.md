---
product_id: "k27n1AQuIbSr5iozG1vExT"
product_slug: "feliks-audio-echo-mk-ii"
brand: "Feliks Audio"
name: "Feliks Audio Echo MK II"
slice: "audio-electronics"
price: 99500
spec_fields:
  brand: ["feliks-audio"]
  customerRating: null
  condition: "new"
  inStock: null
  dealsDiscount: "on-sale"
  newArrival: false
  awards: null
  deviceType: null
  deviceConnectivity: "wired"
  formFactor: "desktop"
  dacIncluded: false
  balancedOutput: false
  amplification: "tube"
  powerOutputPerChannelW: null
  channelCount: null
  inputs: ["rca"]
  outputs: ["headphone-jack", "pre-out"]
  phonoStageBuiltIn: false
  trigger12v: false
  remoteControlIncluded: false
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
  finishColor: ["black"]
  rackMountable19: false
  countryOfManufacture: "Poland"
source_urls:
  - "https://feliksaudio.pl/news/"
  - "https://feliksaudio.pl/wp-content/uploads/2021/11/ECHO_MKII_2021-druk-a4.pdf"
  - "https://wstereo.pl/feliks-audio-i-jego-nowa-wersja-wzmacniacza-sluchawkowego-echo-2/"
  - "https://headphone.shop/product/feliks-audio-echo-mk-2/"
  - "https://www.audioemotion.co.uk/feliks-audio-echo-2-headphone-amplifier-34353-p.asp"
  - "https://upscaleaudio.com/blogs/newsletter/this-amp-sold-out-before-we-even-got-it"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **price** (hard-spec): `$995.00` — Upscale Audio blog: "The Feliks Audio Echo Mk II headphone amp, normally $1,099, is now just $995."
- **condition** (marketing-fact): `new` — Audio Emotion product page lists Condition: New.
- **inStock** (marketing-fact): `null` — headphone.shop lists "Out of stock"; Audio Emotion lists "Item in Stock". Same-tier retailer disagreement.
- **dealsDiscount** (marketing-fact): `on-sale` — Upscale Audio blog explicitly states the amp is "now just $995" down from "$1,099".
- **deviceType** (marketing-fact): `null` — Feliks Audio news describes "a new version of the Echo headphone amplifier"; the audio-electronics Product Category list has no "headphone amplifier" value.
- **deviceConnectivity** (marketing-fact): `wired` — only RCA inputs and RCA pre-out plus 6.3mm headphone output; no wireless features.
- **formFactor** (marketing-fact): `desktop` — Wstereo and headphone.shop describe a desktop tube amplifier with front-panel source selector.
- **amplification** (hard-spec): `tube` — Wstereo: "konstrukcja OTL (bez transformatorów wyjściowych)" with 6N6P x 2 and 6N1P x 2 tubes.
- **inputs** (hard-spec): `["rca"]` — Wstereo: "3 wejścia audio z selektorem"; headphone.shop: "3 RCA audio inputs".
- **outputs** (hard-spec): `["headphone-jack", "pre-out"]` — Wstereo: "Wyjście słuchawkowe: Jack 6.3mm" and "1 wyjście RCA (przedwzmacniacz)"; headphone.shop confirms RCA pre-out.
- **finishColor** (hard-spec): `["black"]` — Wstereo: "czarne, proste bryły" (black, simple solids).
- **countryOfManufacture** (hard-spec): `Poland` — Wstereo: "Feliks Audio jest polską rodzinną firmą"; Audio Emotion "About the brand" states products are assembled in Lubliniec, Poland.
- **powerOutputPerChannelW** (hard-spec): `null` — sources quote 350mW–380mW headphone output power, not a per-channel W RMS speaker rating.

## Conflict / Caution Notes

- **Power output conflict:** headphone.shop prose says "Increased power output" of 380mW, but its own specification table and Audio Emotion both list 350mW. Wstereo also lists 380mW. The Feliks Audio news page only says "increased power output" without a number. The standard per-channel W field is `null`; the mW value is recorded here in the conflict note.
- **In-stock conflict:** headphone.shop says "Out of stock" while Audio Emotion says "Item in Stock". Therefore `inStock` is `null` and the conflict is recorded.
- **Product category mismatch:** The source describes an OTL tube headphone amplifier. `should-be-audio-electronics.md` Product Category has no "headphone amplifier" value, so `deviceType` is `null`.
- **PDF note:** The Feliks manuals page lists an "ECHO 2" PDF, but the provided URL resolved to a different (Euforia) PDF on the date checked. The linked manufacturer PDF `ECHO_MKII_2021-druk-a4.pdf` returned a 404 when directly requested, so the retailer sources above were used instead.
