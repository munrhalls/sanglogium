---
"product_id": "Pn6oyV4Ks5AcNbecjkUefp"
"product_slug": "earmen-ch-amp-headphone-amplifier-open-box"
"brand": "EarMen"
"name": "EarMen Ch-Amp Headphone Amplifier - Open Box"
"slice": "audio-electronics"
"price": 49900
"spec_fields":
  "customerRating": null
  "awards": []
  "condition": "open-box"
  "inStock": null
  "dealsDiscount": null
  "newArrival": null
  "deviceType": "preamplifier"
  "deviceConnectivity": "wired"
  "formFactor": "desktop"
  "dacIncluded": false
  "balancedOutput": true
  "amplification": "solid-state"
  "powerOutputPerChannelW": 3.8
  "channelCount":
  - "2.0"
  "inputs":
  - "rca"
  - "xlr-balanced"
  "outputs":
  - "headphone-jack"
  - "pre-out-rca"
  "phonoStageBuiltIn": "none"
  "trigger12v": false
  "remoteControlIncluded": true
  "maxSampleRateBitDepth": null
  "dsdSupport": null
  "hiResCertification": null
  "dacChipsetFamily": null
  "streamingPlatformSupport": null
  "networkConnection": null
  "driveType": null
  "turntableOperation": null
  "speedsSupported": null
  "phonoPreampBuiltIn": null
  "cartridgeIncluded": null
  "usbDigitalOutput": null
  "bluetoothCodecs": null
  "voiceAssistant": null
  "multiroomSupport": null
  "finishColor": null
  "rackMountable19": false
  "countryOfManufacture": null
"source_urls":
- "https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual"
"verified_at": "2026-09-14"
"data_status": "COMPLETE"
---
## Verification Notes

- **customerRating** (internal): `null` — store-computed review aggregate; not individually sourced.
- **awards** (marketing-fact): `[]` — no named award or recognition badge found.
- **condition** (marketing-fact): `"open-box"` — the product name is "EarMen Ch-Amp Headphone Amplifier - Open Box". Source: Sanity product export / issue product list.
- **inStock**, **dealsDiscount**, **newArrival** (internal): `null` — store-operational fields; not individually sourced.
- **deviceType** (marketing-fact): `"preamplifier"` — the EarMen CH-Amp user manual describes the unit as a "Fully Balanced Desktop Headphone Amplifier with the Pre Amp option"; the `should-be-audio-electronics.md` product-category vocabulary does not contain a `headphone-amp` value, and the presence of balanced/single-ended preamp outputs makes `preamplifier` the closest fit. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **deviceConnectivity** (marketing-fact): `"wired"` — the manual lists RCA and 4.4mm analog inputs; no Bluetooth, Wi-Fi, or Ethernet is mentioned. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **formFactor** (legacy): `"desktop"` — the manual and product name describe a desktop unit. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **dacIncluded** (hard-spec): `false` — the manual specification table and front/back panel descriptions show only analog inputs and outputs; no DAC, USB data, or digital-source function is listed. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **balancedOutput** (legacy): `true` — the manual lists a "Balanced 4.4 mm Input" and a "Balanced 4.4mm" headphone/pre output. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **amplification** (marketing-fact): `"solid-state"` — the overview and specification table reference SoundPlus OPA1642 operational amplifiers, WIMA capacitors, and MELF low-noise resistors; no tube, hybrid, or Class D topology is claimed. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **powerOutputPerChannelW** (hard-spec): `3.8` — the manual specification table lists "Max Power" for the balanced output as "3,8W" (at 32Ω). This is the manufacturer-rated maximum headphone output power, not a conventional W RMS into a 4/8Ω speaker load. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **channelCount** (hard-spec): `["2.0"]` — the manual describes stereo RCA/XLR balanced inputs and stereo headphone outputs. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **inputs** (hard-spec): `["rca", "xlr-balanced"]` — the manual specification table lists "RCA Single End Input" and "Balanced 4.4 mm Input". The 4.4mm balanced input is recorded under `xlr-balanced` because the `inputs` enum in `productType.ts` has no dedicated 4.4mm option. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **outputs** (hard-spec): `["headphone-jack", "pre-out-rca"]` — the manual lists "Headphone Outputs: SE 6.35mm, Balanced 4.4mm" and "Pre Outputs: RCA (SE output), Balanced 4.4mm". The 6.35mm and 4.4mm headphone jacks are represented by `headphone-jack`; the RCA pre-out is represented by `pre-out-rca`. The 4.4mm balanced pre-out is not in the `outputs` enum and is not separately represented. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **phonoStageBuiltIn** (marketing-fact): `"none"` — the manual lists only line-level RCA and 4.4mm analog inputs; no MM/MC phono stage is mentioned. Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **trigger12v** (marketing-fact): `false` — no 12V trigger or custom-install-ready feature is mentioned in the manual; for this marketable feature, manufacturer silence is read as `false`.
- **remoteControlIncluded** (hard-spec): `true` — the manual package contents list includes "Remote Control". Source: https://manualspro.net/445825-earmen-psu-3-ch-amp-desktop-headphone-amplifier-user-manual
- **maxSampleRateBitDepth**, **dsdSupport**, **hiResCertification**, **dacChipsetFamily** (hard-spec): `null` — the CH-Amp is a pure analog headphone amplifier/preamplifier with no DAC or digital-source function.
- **streamingPlatformSupport** and **networkConnection** (marketing-fact): `null` — no streaming or network features are listed.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (hard-spec): `null` — domain-gated to `deviceType: turntable`.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no Bluetooth or wireless connectivity is listed.
- **finishColor** (marketing-fact): `null` — no explicit finish-color statement found in the manufacturer manual.
- **rackMountable19** (marketing-fact): `false` — the device is a desktop unit; no 19" rack-mounting hardware or claim is mentioned.
- **countryOfManufacture** (marketing-fact): `null` — no explicit "Made in..." or country-of-manufacture statement found in the manufacturer manual.

## Conflict / Caution Notes

- **Legacy filter-attributes conflict:** The Sanity product export lists `deviceType: "headphone-amp"`, `balancedOutput: false`, `inputs: ["usb"]`, and `outputs: ["4.4mm"]`. The EarMen CH-Amp user manual shows the unit is a pure analog headphone amplifier/preamplifier with RCA and 4.4mm analog inputs, no USB input, and both single-ended and balanced outputs. This sourced record corrects the legacy values.
- **Output connector representability gap:** The CH-Amp has a 4.4mm balanced headphone output (front) and a 4.4mm balanced pre-out (rear). The `outputs` enum in `productType.ts` has `pre-out-rca` and `pre-out-xlr`, but no 4.4mm balanced pre-out value. The 4.4mm headphone jack is folded into `headphone-jack` and the 4.4mm pre-out is not separately represented.
- **Input connector representability gap:** the balanced input is a 4.4mm TRRS jack, not an XLR connector; it is recorded under `xlr-balanced` because the `inputs` enum lacks a 4.4mm option.
- **Power-output load caveat:** The `powerOutputPerChannelW` value of 3.8 W is the manufacturer "Max Power" at 32Ω into the balanced headphone output, not a conventional W RMS into a 4/8Ω speaker load.
