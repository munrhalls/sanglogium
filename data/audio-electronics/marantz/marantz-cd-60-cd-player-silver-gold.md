---
product_id: "ZuUKzmkqDyQwdcwhxlIfVH"
product_slug: "marantz-cd-60-cd-player-silver-gold"
brand: "Marantz"
name: "Marantz CD 60 CD Player (Silver Gold)"
slice: "audio-electronics"
spec_fields:
  deviceType: "cd-player-transport"
  deviceConnectivity: "wired"
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
    - "usb"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "192kHz/24bit"
  dsdSupport: "dsd128"
  hiResCertification:
    - "hi-res-audio"
  dacChipsetFamily:
    - "ess-sabre"
  streamingPlatformSupport: []
  networkConnection: []
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
    - "Silver Gold"
    - "Black"
  rackMountable19: false
  countryOfManufacture: null
  awards: []
source_urls:
  - "https://www.marantz.com/en-gb/product/cd-sacd-players/cd-60/CD60GB.html"
  - "https://www.marantz.com/on/demandware.static/-/Library-Sites-marantz_apac_shared/default/dwb2b7357a/archive-downloads/marantz_cd-60_infosheet_eu.pdf"
  - "https://manuals.marantz.com/cd60/NA/EN/OBAOSYqwgclbuv.php"
  - "https://manuals.marantz.com/CD60/NA/EN/pdf/CD60_NA_EN.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `"cd-player-transport"` — the manufacturer product page titles the product as "CD 60 Premium CD Player" and the product is a standalone CD/SACD-capable player; it matches the audio-electronics schema's `cd-player-transport` category.

- **deviceConnectivity** (marketing-fact): `"wired"` — the product has only wired digital and analog connections (front USB-A for storage playback, fixed RCA analog output, optical/coaxial digital outputs, headphone jack). The product page "Which CD Player is Right for You" table lists "No" under HEOS, HDMI Inputs and HDMI Outputs; no Bluetooth, Wi-Fi or Ethernet is listed.

- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated in `sanity-cms/schemaTypes/productType.ts` to the five amplifier `deviceType` values; because `deviceType` is `cd-player-transport`, the fields do not apply.

- **inputs** (hard-spec): `["usb"]` — the product page lists "USB A 1 (Front)" for mass-storage playback; the NA manual Specifications section lists "Digital input USB (Front): USB Type A (USB 2.0 High speed)". The product page also lists "Optical input / output (Maximum Support) 0 / 1" and "Coaxial input / output (Maximum Support) 0 / 1", confirming zero optical and zero coaxial inputs. Source: manufacturer product page and NA manual.

- **maxSampleRateBitDepth** (hard-spec): `"192kHz/24bit"` — the manufacturer product page states the CD 60 can play "WAV, FLAC HD, ALAC, AIFF (up to 192-kHz/24bit), and DSD (up to 5.6-MHz) files from a connected USB storage device". Source: https://www.marantz.com/en-gb/product/cd-sacd-players/cd-60/CD60GB.html.

- **dsdSupport** (hard-spec): `"dsd128"` — the product page states DSD playback "up to 5.6-MHz" from USB storage; 5.6 MHz corresponds to DSD128. Source: https://www.marantz.com/en-gb/product/cd-sacd-players/cd-60/CD60GB.html.

- **hiResCertification** (marketing-fact): `["hi-res-audio"]` — the product page lists "Hi-Res Audio" under Key Technologies and describes "Plays Hi-Res Audio USB Sources". MQA is not mentioned. Source: https://www.marantz.com/en-gb/product/cd-sacd-players/cd-60/CD60GB.html.

- **dacChipsetFamily** (marketing-fact): `["ess-sabre"]` — the EU information sheet lists the DAC circuit as "ES9016K2M" (ESS Technology Sabre ES9016K2M). Source: https://www.marantz.com/on/demandware.static/-/Library-Sites-marantz_apac_shared/default/dwb2b7357a/archive-downloads/marantz_cd-60_infosheet_eu.pdf.

- **streamingPlatformSupport** (marketing-fact): `[]` — no streaming service support (AirPlay 2, Chromecast, Spotify Connect, TIDAL Connect, Roon Ready, DLNA) is listed on the product page, the information sheet, or the manual.

- **networkConnection** (marketing-fact): `[]` — the product has no network hardware. The product page "Which CD Player is Right for You" table lists "No" under HEOS; the connectivity section lists only physical wired terminals and a USB-A front port.

- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — these fields are domain-gated in `productType.ts` to `deviceType: turntable`; the CD 60 is not a turntable.

- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport**: `null` — these fields are domain-gated in `productType.ts` to `deviceConnectivity` values `bluetooth`, `wifi-networked`, or `wired-wireless`; `deviceConnectivity` is `wired`.

- **finishColor** (marketing-fact): `["Silver Gold", "Black"]` — the EU information sheet states "Panel Colour Silver Gold / Black"; the product page lists the available colors as "Silver/Gold and Marantz Black". The source text from the information sheet is used as the canonical color pair.

- **rackMountable19** (marketing-fact): `false` — the product is a desktop unit with dimensions 442 × 129 × 396 mm and a stated " desktop" form factor; no 19" rack-mounting hardware or claim is mentioned. For this marketable feature, manufacturer silence is read as `false`.

- **countryOfManufacture** (marketing-fact): `null` — no country of manufacture or "Made in ..." statement was found on the manufacturer product page, the EU information sheet, or the NA owner’s manual.

- **awards** (marketing-fact): `[]` — the manufacturer product page lists no named awards or editor's-choice recognitions. The only badges shown are "Hi-Res Audio" and "Class 1 Laser Product", which are certifications rather than named awards.

## Conflict / Caution Notes

- The current Sanity `filterAttributes` for this product contain legacy values such as `deviceType: "dap"`, `productCategory: "turntable"`, `connectivity: "bluetooth"`, `outputs: ["4.4mm"]`, `driveType: "belt-drive"`, `turntableOperation: "manual"`, and `countryOfManufacture: "China"`. None of these are supported by the `should-be-audio-electronics.md` schema or the manufacturer sources and have been corrected in this sourced record.
- The `inputs` field is the schema-merged replacement for the `should-be-audio-electronics.md` "Input Types" and "Digital Inputs" items; the CD 60 has only a front USB Type A input (for storage playback), and zero optical/coaxial inputs.
