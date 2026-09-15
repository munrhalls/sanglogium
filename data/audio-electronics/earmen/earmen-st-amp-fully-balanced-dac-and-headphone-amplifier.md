---
"product_id": "Pn6oyV4Ks5AcNbecjkU57D"
"product_slug": "earmen-st-amp-fully-balanced-dac-and-headphone-amplifier"
"brand": "EarMen"
"name": "EarMen ST-Amp Fully Balanced DAC and Headphone Amplifier"
"slice": "audio-electronics"
"price": 19900
"spec_fields":
  "customerRating": null
  "awards": []
  "condition": null
  "inStock": null
  "dealsDiscount": null
  "newArrival": null
  "deviceType": "dac"
  "deviceConnectivity": "wired"
  "formFactor": "desktop"
  "dacIncluded": true
  "balancedOutput": true
  "amplification": null
  "powerOutputPerChannelW": null
  "channelCount": null
  "inputs":
  - "usb"
  - "rca"
  - "xlr-balanced"
  "outputs": null
  "phonoStageBuiltIn": null
  "trigger12v": null
  "remoteControlIncluded": null
  "maxSampleRateBitDepth": "32-bit/384kHz"
  "dsdSupport": "dsd128"
  "hiResCertification": null
  "dacChipsetFamily":
  - "ess-sabre"
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
  "finishColor":
  - "Black"
  "rackMountable19": false
  "countryOfManufacture": null
"source_urls":
- "https://earmen.com/pages/st-amp-black-edition"
- "https://earmen-shop.com/products/earmen-st-amp"
- "https://manualspro.net/170631-earmen-st-amp-desktop-headphone-amplifier-user-manual"
- "https://hifinews.com/content/earmen-st-amp-dacheadphone-amp"
"verified_at": "2026-09-14"
"data_status": "COMPLETE"
---
## Verification Notes

- **customerRating** (internal): `null` — store-computed review aggregate; not individually sourced.
- **awards** (marketing-fact): `[]` — no named award or recognition badge found on the manufacturer page, manual, or checked sources.
- **condition**, **inStock**, **dealsDiscount**, **newArrival** (internal): `null` — store-operational fields; not individually sourced.
- **deviceType** (marketing-fact): `"dac"` — the official EarMen product page titles the unit as "Desktop DAC / Headphone Amp / Preamp"; the `should-be-audio-electronics.md` product-category vocabulary does not contain a `headphone-amp` value, so `dac` is the closest fit. Source: https://earmen.com/pages/st-amp-black-edition
- **deviceConnectivity** (marketing-fact): `"wired"` — the user manual lists RCA, 4.4mm balanced, and USB inputs; no Bluetooth, Wi-Fi, or Ethernet is mentioned. Source: https://manualspro.net/170631-earmen-st-amp-desktop-headphone-amplifier-user-manual
- **formFactor** (legacy): `"desktop"` — the product page and manual describe a desktop unit. Source: https://earmen.com/pages/st-amp-black-edition
- **dacIncluded** (hard-spec): `true` — the official page states "ESS SABRE DAC" and the manual specification table lists "DAC: ESS 9280". Sources: https://earmen.com/pages/st-amp-black-edition, https://manualspro.net/170631-earmen-st-amp-desktop-headphone-amplifier-user-manual
- **balancedOutput** (legacy): `true` — the manual lists "Balanced 4.4 mm Input" and a "Balanced 4.4mm" headphone/pre output. Source: https://manualspro.net/170631-earmen-st-amp-desktop-headphone-amplifier-user-manual
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded** (hard-spec): `null` — domain-gated to amplifier/receiver `deviceType` values in `productType.ts`; the unit contains a headphone amplifier and pre-out, but these fields are not applicable when filed as `dac`.
- **inputs** (hard-spec): `["usb", "rca", "xlr-balanced"]` — the manual specification table lists "Inputs: RCA Single End Input, Balanced 4.4 mm Input" and the operation section describes USB DAC input. The 4.4mm balanced input is recorded under `xlr-balanced` because the `inputs` enum in `productType.ts` has no dedicated 4.4mm option. Source: https://manualspro.net/170631-earmen-st-amp-desktop-headphone-amplifier-user-manual
- **maxSampleRateBitDepth** (hard-spec): `"32-bit/384kHz"` — the manual page-8 specification table lists "PCM Up to 384 kHz"; the EarMen shop spec table repeats "PCM Up to 384 kHz"; Hi-Fi News states the ES9280PRO "supports PCM audio up to 384kHz/32-bit". Sources: https://manualspro.net/170631-earmen-st-amp-desktop-headphone-amplifier-user-manual, https://earmen-shop.com/products/earmen-st-amp, https://hifinews.com/content/earmen-st-amp-dacheadphone-amp
- **dsdSupport** (hard-spec): `"dsd128"` — the manual page-8 specification table lists "DSD 64 / 128 DoP". Source: https://manualspro.net/170631-earmen-st-amp-desktop-headphone-amplifier-user-manual
- **hiResCertification** (marketing-fact): `null` — no MQA or Hi-Res Audio certification or badge is mentioned in the manufacturer page, manual, or checked retailer sources.
- **dacChipsetFamily** (hard-spec): `["ess-sabre"]` — the manual lists "DAC: ESS 9280"; the official page states "ESS SABRE DAC". Sources: https://manualspro.net/170631-earmen-st-amp-desktop-headphone-amplifier-user-manual, https://earmen.com/pages/st-amp-black-edition
- **streamingPlatformSupport** and **networkConnection** (marketing-fact): `null` — no AirPlay, Chromecast, Spotify/Tidal Connect, Roon Ready, DLNA, Wi-Fi, or Ethernet is listed.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (hard-spec): `null` — domain-gated to `deviceType: turntable`.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no Bluetooth or wireless connectivity is listed.
- **finishColor** (marketing-fact): `["Black"]` — the official product page path and heading are "ST-Amp Black Edition". The user manual and shop spec table are silent on color, so the value is derived from the product variant name and is flagged. Source: https://earmen.com/pages/st-amp-black-edition
- **rackMountable19** (marketing-fact): `false` — the product is a desktop unit; no 19" rack-mounting hardware or claim is mentioned.
- **countryOfManufacture** (marketing-fact): `null` — no explicit "Made in..." or country-of-manufacture statement found.

## Conflict / Caution Notes

- **Finish-color sourcing caution:** The only explicit color cue is the official Shopify page path and title "ST-Amp Black Edition". The user manual and EarMen shop spec table do not state the finish color, so `finishColor` is recorded as `["Black"]` and flagged as derived from the product name rather than a direct spec statement.
- **Product-category / schema mismatch:** The ST-Amp is a desktop DAC/headphone amplifier/preamp. The `should-be-audio-electronics.md` product-category vocabulary does not include a `headphone-amp` value, so it is filed as `deviceType: "dac"`. This makes the amplifier/receiver-domain fields non-applicable (`null`) even though the hardware includes a headphone amplifier and pre-out.
- **Input connector representability gap:** The balanced analog input is a 4.4mm TRRS jack, not an XLR connector. The `inputs` enum in `productType.ts` has `xlr-balanced` as the only balanced analog option, so the 4.4mm balanced input is recorded there with this caveat.
