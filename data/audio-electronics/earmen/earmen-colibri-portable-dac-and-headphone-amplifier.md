---
"product_id": "k27n1AQuIbSr5iozG1vI8F"
"product_slug": "earmen-colibri-portable-dac-and-headphone-amplifier"
"brand": "EarMen"
"name": "EarMen Colibri Portable DAC and Headphone Amplifier"
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
  "formFactor": "portable"
  "dacIncluded": true
  "balancedOutput": true
  "amplification": null
  "powerOutputPerChannelW": null
  "channelCount": null
  "inputs":
  - "usb"
  "outputs": null
  "phonoStageBuiltIn": null
  "trigger12v": null
  "remoteControlIncluded": null
  "maxSampleRateBitDepth": "32-bit/384kHz"
  "dsdSupport": "dsd128"
  "hiResCertification":
  - "mqa"
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
  "finishColor": null
  "rackMountable19": false
  "countryOfManufacture": "Europe"
"source_urls":
- "https://apos.audio/products/earmen-portable-dac-amp"
"verified_at": "2026-09-14"
"data_status": "COMPLETE"
---
## Verification Notes

- **customerRating** (internal): `null` — store-computed review aggregate; not individually sourced.
- **awards** (marketing-fact): `[]` — no named award or recognition badge found on the Apos Audio product page.
- **condition**, **inStock**, **dealsDiscount**, **newArrival** (internal): `null` — store-operational fields; not individually sourced.
- **deviceType** (marketing-fact): `"dac"` — Apos Audio describes the Colibri as "a portable, battery-powered balanced DAC/amp"; the `should-be-audio-electronics.md` product-category vocabulary does not contain a `headphone-amp` value, so `dac` is the closest fit. Source: https://apos.audio/products/earmen-portable-dac-amp
- **deviceConnectivity** (marketing-fact): `"wired"` — Apos lists USB-C (data) and 3.5mm/4.4mm outputs; no Bluetooth, Wi-Fi, or Ethernet is mentioned. Source: https://apos.audio/products/earmen-portable-dac-amp
- **formFactor** (legacy): `"portable"` — Apos describes a "portable" device with an internal battery. Source: https://apos.audio/products/earmen-portable-dac-amp
- **dacIncluded** (hard-spec): `true` — Apos states the unit uses an "ESS ES9281 PRO DAC". Source: https://apos.audio/products/earmen-portable-dac-amp
- **balancedOutput** (legacy): `true` — Apos highlights "fully-balanced 4.4mm output". Source: https://apos.audio/products/earmen-portable-dac-amp
- **amplification**, **powerOutputPerChannelW**, **channelCount**, **outputs**, **phonoStageBuiltIn**, **trigger12v**, **remoteControlIncluded** (hard-spec): `null` — domain-gated to amplifier/receiver `deviceType` values; the Colibri contains a headphone amplifier, but these fields are not applicable with `deviceType: dac`.
- **inputs** (hard-spec): `["usb"]` — Apos lists "Inputs: USB-C (data)". Source: https://apos.audio/products/earmen-portable-dac-amp
- **outputs** (hard-spec): `null` — domain-gated to amplifier/receiver `deviceType` values; Apos lists 3.5mm single-ended and 4.4mm balanced outputs.
- **maxSampleRateBitDepth** (hard-spec): `"32-bit/384kHz"` — Apos lists "Supported audio formats: PCM: Up to 384kHz" and describes "ESS ES9281 PRO DAC that supports high-resolution audio formats up to 32-bit/384kHz PCM". Source: https://apos.audio/products/earmen-portable-dac-amp
- **dsdSupport** (hard-spec): `"dsd128"` — Apos lists "DSD: 64 / 128 DoP". Source: https://apos.audio/products/earmen-portable-dac-amp
- **hiResCertification** (hard-spec): `["mqa"]` — Apos lists "MQA: Up to 384kHz" and "MQA support for high-resolution streaming". Source: https://apos.audio/products/earmen-portable-dac-amp
- **dacChipsetFamily** (hard-spec): `["ess-sabre"]` — Apos states "ESS ES9281 PRO DAC". Source: https://apos.audio/products/earmen-portable-dac-amp
- **streamingPlatformSupport** and **networkConnection** (marketing-fact): `null` — no AirPlay, Chromecast, Spotify/Tidal Connect, Roon Ready, DLNA, Wi-Fi, or Ethernet is listed.
- **driveType**, **turntableOperation**, **speedsSupported**, **phonoPreampBuiltIn**, **cartridgeIncluded**, **usbDigitalOutput** (hard-spec): `null` — domain-gated to `deviceType: turntable`.
- **bluetoothCodecs**, **voiceAssistant**, **multiroomSupport** (marketing-fact): `null` — `deviceConnectivity` is `wired`; no Bluetooth or wireless connectivity is listed.
- **finishColor** (marketing-fact): `null` — no explicit finish-color statement found on the Apos Audio product page; product images appear silver, but color is not stated.
- **rackMountable19** (marketing-fact): `false` — the device is a portable unit with dimensions 77 x 35 x 14 mm; no 19" rack-mounting claim is mentioned.
- **countryOfManufacture** (marketing-fact): `"Europe"` — Apos states "Manufactured in Europe to high-quality standards". Source: https://apos.audio/products/earmen-portable-dac-amp

## Conflict / Caution Notes

- **Product-category / schema mismatch:** The EarMen Colibri is marketed as a portable DAC/headphone amplifier. The `should-be-audio-electronics.md` product-category vocabulary does not include a `headphone-amp` value, so it is filed as `deviceType: "dac"`. This makes the amplifier/receiver-domain fields non-applicable (`null`) even though the hardware includes a headphone amplifier and 3.5mm/4.4mm outputs.
- **Price conflict:** Apos Audio lists a sale price of $130.00 USD and a regular price of $199.00 USD. The issue/Sanity record uses the $199.00 USD regular price; the sale is noted as a retailer discount.
- **Manufacturer-page accessibility:** The direct EarMen manufacturer product page for the Colibri could not be opened during this sourcing pass. Apos Audio is used as the highest-tier available source for all hard and marketing facts.
