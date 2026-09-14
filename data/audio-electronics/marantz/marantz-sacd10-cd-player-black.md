---
product_id: "ZuUKzmkqDyQwdcwhxlIflR"
product_slug: "marantz-sacd10-cd-player-black"
brand: "Marantz"
name: "Marantz SACD10 CD Player (Black)"
slice: "audio-electronics"
spec_fields:
  deviceType: "cd-player-transport"
  deviceConnectivity: "wired"
  amplification: null
  powerOutputPerChannelW: null
  channelCount: null
  inputs:
    - "usb"
    - "optical"
    - "coaxial"
  outputs: null
  phonoStageBuiltIn: null
  trigger12v: null
  remoteControlIncluded: null
  maxSampleRateBitDepth: "384kHz/32bit"
  dsdSupport: "dsd256-plus"
  hiResCertification:
    - "hi-res-audio"
  dacChipsetFamily: null
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
    - "Black"
    - "Marantz Champagne"
  rackMountable19: false
  countryOfManufacture: null
  awards:
    - "iF Design Award"
source_urls:
  - "https://www.marantz.com/en-us/product/cd-sacd-players/sacd-10/300989.html?dwvar_300989_color=Black"
  - "https://www.marantz.com/on/demandware.static/-/Library-Sites-marantz_northamerica_shared/default/dw46185f70/archive-downloads/Marantz-SACD-10-Info-Sheet.pdf"
  - "https://manuals.marantz.com/sacd10/NA/EN/YRWWSYgzkdztfj.php"
  - "https://manuals.marantz.com/SACD10/NA/EN/pdf/SACD10_NA_EN.pdf"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes

- **deviceType** (marketing-fact): `"cd-player-transport"` — the manufacturer product page titles the product as "SACD 10 High-Performance Reference SACD Player" and describes it as a combined SACD/CD player with DAC inputs; it matches the audio-electronics schema's `cd-player-transport` category.

- **deviceConnectivity** (marketing-fact): `"wired"` — the product has only wired digital and analog connections (optical/coaxial inputs and outputs, fixed RCA and balanced XLR outputs, USB-A and USB-B DAC inputs, headphone jack). The product page "Which CD Player is Right for You" table lists "No" under HEOS, HDMI Inputs and HDMI Outputs; no Bluetooth or Wi-Fi is listed.

- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded**: `null` — these fields are domain-gated in `sanity-cms/schemaTypes/productType.ts` to the five amplifier `deviceType` values; because `deviceType` is `cd-player-transport`, the fields do not apply.

- **inputs** (hard-spec): `["usb", "optical", "coaxial"]` — the North American information sheet lists "Digital in: Optical, Coaxial, USB-A, USB-B DAC". The product page lists "Optical input / output (Maximum Support) 2 / 1" and "Coaxial input / output (Maximum Support) 2 / 1" and confirms "Asynchronous mode (for USB-B input) Yes". The schema `inputs` options do not distinguish USB-A from USB-B, so the field is recorded as `usb` together with `optical` and `coaxial`. Source: manufacturer product page and North American information sheet.

- **maxSampleRateBitDepth** (hard-spec): `"384kHz/32bit"` — the product page and information sheet state "DSD 256 and PCM 384 / 32 support via USB". Source: https://www.marantz.com/en-us/product/cd-sacd-players/sacd-10/300989.html?dwvar_300989_color=Black.

- **dsdSupport** (hard-spec): `"dsd256-plus"` — the product page and information sheet state "DSD 256 ... support via USB". Source: https://www.marantz.com/en-us/product/cd-sacd-players/sacd-10/300989.html?dwvar_300989_color=Black.

- **hiResCertification** (marketing-fact): `["hi-res-audio"]` — the product page lists "Hi-Res Audio" under Key Technologies. MQA is not mentioned. Source: https://www.marantz.com/en-us/product/cd-sacd-players/sacd-10/300989.html?dwvar_300989_color=Black.

- **dacChipsetFamily** (marketing-fact): `null` — the manufacturer describes the DAC circuit as "New MMM-Conversion" (Marantz Musical Mastering) and "MMM-Stream". None of the schema's allowed values (`ess-sabre`, `akm`, `cirrus-logic`, `r2r-ladder`) is a match, and the manufacturer does not identify a standard commercial DAC family.

- **streamingPlatformSupport** (marketing-fact): `[]` — no streaming service support (AirPlay 2, Chromecast, Spotify Connect, TIDAL Connect, Roon Ready, DLNA) is listed on the product page, the information sheet, or the manual.

- **networkConnection** (marketing-fact): `[]` — the product has no network hardware. The Audio Feature section of the product page explicitly states "DAC Master Clock Design (No Support for Network Playback) Yes"; the connectivity section lists only physical wired terminals and USB ports.

- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput**: `null` — these fields are domain-gated in `productType.ts` to `deviceType: turntable`; the SACD 10 is not a turntable.

- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport**: `null` — these fields are domain-gated in `productType.ts` to `deviceConnectivity` values `bluetooth`, `wifi-networked`, or `wired-wireless`; `deviceConnectivity` is `wired`.

- **finishColor** (marketing-fact): `["Black", "Marantz Champagne"]` — the product page and information sheet list "Panel Color Black / Marantz Champagne". Source: https://www.marantz.com/en-us/product/cd-sacd-players/sacd-10/300989.html?dwvar_300989_color=Black.

- **rackMountable19** (marketing-fact): `false` — the product is a heavy desktop unit with dimensions 440 × 192 × 442 mm and a stated mass of 33.0 kg; no 19" rack-mounting hardware or claim is mentioned. For this marketable feature, manufacturer silence is read as `false`.

- **countryOfManufacture** (marketing-fact): `null` — no country of manufacture or "Made in ..." statement was found on the manufacturer product page, the North American information sheet, or the NA owner’s manual.

- **awards** (marketing-fact): `["iF Design Award"]` — the product page displays the quotation "With the 10 Series Collection, Marantz establishes its proposition as a luxury brand." attributed to "iF Design Award, October 2024". A separate "Hi-Fi News, June 2025" quotation is a review excerpt, not a named award, and is therefore excluded from this field. Source: https://www.marantz.com/en-us/product/cd-sacd-players/sacd-10/300989.html?dwvar_300989_color=Black.

## Conflict / Caution Notes

- The current Sanity `filterAttributes` for this product contain legacy values such as `deviceType: "dap"`, `productCategory: "turntable"`, `connectivity: "wired"`, `outputs: ["4.4mm"]`, `driveType: "direct-drive"`, `turntableOperation: "manual"`, `finishColor: "Graphite"`, and `countryOfManufacture: "China"`. None of these are supported by the `should-be-audio-electronics.md` schema or the manufacturer sources and have been corrected in this sourced record.
- The `inputs` field is the schema-merged replacement for the `should-be-audio-electronics.md` "Input Types" and "Digital Inputs" items; the SACD 10 has optical and coaxial digital inputs (two each), plus USB-A and USB-B DAC inputs.
