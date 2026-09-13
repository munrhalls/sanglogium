# Sourced Data — Sony (`sang-logium-1xs.9.4`)

Sourced against `schema-headphones.md` + `sourcing-protocol-headphones.md`
(amended 2026-09-13: manufacturer-conflict resolution is now recency-based,
and boolean "would-advertise-if-present" feature fields read `false` on
manufacturer silence rather than `null`; no separate independent-verification
pass is required — sourcing and CMS patching happen in one pass per product,
via `sanity-cms/utils/migrations/headphonesFilterAttributes/`).

Tier legend: **H** hard spec, **M** marketing/feature fact, **E** editorial.

**Every POC `filterAttributes` value on these 10 documents was untrusted
invented enrichment data and was discarded.** The POC's `backDesign`,
`connector`, `noiseCancelling`, `microphone: false` and `connectivity` values
were never read as ground truth or used as hints — only each product's real
name/brand/price were carried over.

## Working citation path

Sony's own product/spec pages (`sony.com`, `sony.co.uk`) return **HTTP 403** to
non-browser fetches, and their specification PDFs are encrypted. The
**`helpguide.sony.net` web operating-instruction manuals** are the
manufacturer's own equally-authoritative manual tier and ARE fetchable. Path
shape is `/mdr/<model-code>/v1/en/contents/TP<id>.html`, where `<model-code>`
is the numeric model code in some cases and a slug in others:

| Model | Help-guide path |
|---|---|
| WH-1000XM5 | `/mdr/wh1000xm5/v1/en/` |
| WF-1000XM5 | `/mdr/2963/v1/en/` |
| WH-CH720N | `/mdr/2966/v1/en/` |
| LinkBuds (WF-L900) | `/mdr/linkbuds/v1/en/` |
| LinkBuds Fit (WF-LS910N) | `/mdr/2975/v1/en/` |
| LinkBuds Open (WF-L910) | `/mdr/2964/v1/en/` |
| INZONE Buds (WF-G700N) | `/mdr/2977/v1/en/` |

## 10 SKUs / 7 unique models

Six of the ten SKUs are colour or bundle variants of four hardware models, so
their `filterAttributes` are identical to the base model's — only the Sanity
`_id` and `name` differ:

| SKU | Model | Spec file |
|---|---|---|
| `moXlkADK7m1DHgGwWtblsT` WH-1000XM5 | WH-1000XM5 | `products/wh-1000xm5.mjs` |
| `ZuUKzmkqDyQwdcwhxl9BBF` WH-1000XM5 (Pink) | WH-1000XM5 | reuses `wh-1000xm5` |
| `n10eAegrGspodtsQw12meG` WF-1000XM5 | WF-1000XM5 | `products/wf-1000xm5.mjs` |
| `ZuUKzmkqDyQwdcwhxl99sR` WF-1000XM5 bundle (Black) | WF-1000XM5 | reuses `wf-1000xm5` |
| `ZuUKzmkqDyQwdcwhxwQPfT` WF-1000XM5 bundle (Silver) | WF-1000XM5 | reuses `wf-1000xm5` |
| `k27n1AQuIbSr5iozG2itJe` LinkBuds | WF-L900 | `products/linkbuds-wf-l900.mjs` |
| `ZuUKzmkqDyQwdcwhxwQLK7` LinkBuds Fit (White) | WF-LS910N | `products/linkbuds-fit.mjs` |
| `dLGDVDmEEI2lV8CArIgVky` LinkBuds Open (Black) | WF-L910 | `products/linkbuds-open-wf-l910.mjs` |
| `dLGDVDmEEI2lV8CArIgSA0` INZONE Buds bundle (Black) | WF-G700N | `products/inzone-buds-wf-g700n.mjs` |
| `dLGDVDmEEI2lV8CArIgbTY` WHCH720N/B | WH-CH720N | `products/wh-ch720n.mjs` |

The two WF-1000XM5 "gSport Hardshell Case" bundle listings and the INZONE
Buds "gSport Case" bundle listing are the same headset hardware plus a
third-party case; the accessory changes no filterable attribute.
## Per-model field tables

### WH-1000XM5 / WH-1000XM5 Pink (`products/wh-1000xm5.mjs`, `wh-1000xm5-pink.mjs`)

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| wearingStyle | M | `over-ear` | "Wireless Noise Canceling Stereo Headset ... Headphone cable (approx. 1.2 m (47.25 in.)) (1)" | [package contents](https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534515.html) |
| acousticDesign | M | `closed-back` | closed circumaural; no open-back/semi-open variant or vent described | package contents page |
| connectivity | M | `wireless` | "you can use the headset as noise canceling headphones while the headset is connected to a device via the supplied headphone cable" | [supplied cable](https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534744.html) |
| portable | M | `true` | "Carrying case ( WH-1000XM5 only) (1)" | package contents page |
| driverType | M | `dynamic` | "Model : YY2954" — single dynamic driver; no BA/planar/electrostatic/AMT stated | [spec PDF](https://helpguide.sony.net/mdr/wh1000xm5/v1/en/print.pdf) |
| freqResponseHz | H | `{min:4, max:40000}` | "4 Hz - 40,000 Hz (JEITA)" | spec PDF |
| cableTermination | M | `3.5mm` | "Headphone cable (approx. 1.2 m (47.25 in.)) (1)" | package contents page |
| detachableCable | M | `true` | "The headset turns off automatically if you disconnect the supplied headphone cable from the headset while it is turned on." | supplied cable page |
| cableLengthM | H | `1.2` | "Headphone cable (approx. 1.2 m (47.25 in.)) (1)" | package contents page |
| microphone | M | `true` | "When an incoming call arrives, a ring tone is heard via the headset... You can hear the caller's voice from the headset." | supplied cable page |
| foldable | M | `false` | no folding hinge/fold step anywhere; XM3/XM4 flat-fold absent | [carrying case](https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534705.html) + boolean feature-absence rule |
| ipxRating | M | `none` | "The headset is not waterproof. If the headset is charged while it is wet with rain or sweat, etc., this can result in burnout or malfunction." | [index](https://helpguide.sony.net/mdr/wh1000xm5/v1/en/index.html) |
| bluetoothCodecs | H | `SBC, AAC, LDAC` | "Codec ... LDAC ™ ... AAC ... SBC" | [operating time](https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/TP1000534508.html) |
| anc | M | `anc` | "Noise canceling function: ON Max. 30 hours" | operating time page |
| batteryLifeHours | M | `{ancOn:30, ancOff:40}` | "AAC Noise canceling function: ON Max. 30 hours / AAC OFF Max. 40 hours" | operating time page |
| soundSignature | E | `Warm` | "Sound Signature = Warm; Bass Amount = Very Emphasized (6 dB); Treble Amount = Slightly Emphasized (1 dB)" | [RTINGS](https://www.rtings.com/headphones/reviews/sony/wh-1000xm5-wireless) |

### WF-1000XM5 / both gSport bundles (`products/wf-1000xm5.mjs`)

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| wearingStyle | M | `in-ear` | "Mass : Approx. 5.9 g × 2 (0.21 oz × 2) (Headset (including earbud tips (M)))" | [specifications](https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783926.html) |
| acousticDesign | M | `closed-back` | sealed in-ear noise-cancelling earbud; no open-back/semi-open variant or vent described | specifications page |
| fitType | M | `universal` | removable earbud tips; no custom/CIEM mould offered | specifications page |
| connectivity | M | `true-wireless` | "Communication system : Bluetooth Specification version 5.3" | specifications page |
| portable | M | `true` | "Charging time : Approx. 1.5 hours (Headset) Approx. 2 hours (Charging case)" | specifications page |
| driverType | M | `dynamic` | "Model: YY2963" — single dynamic driver; no BA/planar/electrostatic/AMT stated | specifications page |
| freqResponseHz | H | `{min:20, max:40000}` | "Transmission range (A2DP) : 20 Hz - 20 000 Hz ... 20 Hz - 40 000 Hz (Sampling frequency LDAC 96 kHz, 990 kbps)" | specifications page |
| cableTermination | M | `usb-c` | only wired interface is the USB Type-C charging port; no analogue input exists | specifications page |
| detachableCable | M | `false` | "Power source : DC 3.85 V: Built-in lithium-ion rechargeable battery" — no detachable audio cable | specifications page |
| microphone | M | `true` | "Microphones (left, right)" listed under Location and function of parts; HFP profile supported | specifications page |
| foldable | M | `false` | no folding hinge/fold step anywhere; boolean feature-absence rule applied | specifications page |
| ipxRating | M | `IPX4` | "Do not splash water forcibly into the sound output parts, air holes, or microphone parts of the headset units." | [getting wet](https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000783366.html) |
| bluetoothCodecs | H | `SBC, AAC, LDAC, LC3` | "Supported Codec : SBC AAC LDAC LC3" | specifications page |
| anc | M | `anc` | "AAC Noise canceling function: ON Max. 8 hours" | [operating time](https://helpguide.sony.net/mdr/2963/v1/en/contents/TP1000781965.html) |
| batteryLifeHours | M | `{ancOn:8, ancOff:12}` | "AAC Noise canceling function: ON Max. 8 hours / AAC OFF Max. 12 hours" | operating time page |
| soundSignature | E | `Warm` | "Sound Signature = Warm; Bass Amount = Emphasized (4 dB); Treble Amount = Balanced (-1 dB)" | [RTINGS](https://www.rtings.com/headphones/reviews/sony/wf-1000xm5-truly-wireless) |

### LinkBuds WF-L900 (`products/linkbuds-wf-l900.mjs`)

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| wearingStyle | M | `in-ear` | "Mass: Approx. 4.1 g × 2 (0.15 oz × 2) (Headset (including fitting supporters (M)))" | [specifications](https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000449913.html) |
| acousticDesign | M | `semi-open` | "Wireless Stereo Headset LinkBuds / Model: YY2953" — ring driver leaves the ear canal open by design | specifications page |
| fitType | M | `universal` | "Fitting supporters ( XS / S / M / L / XL 2 each)" | [package contents](https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000447701.html) |
| connectivity | M | `true-wireless` | "Communication system: Bluetooth Specification version 5.2" | specifications page |
| portable | M | `true` | "Charging case (1)" | package contents page |
| driverType | M | `dynamic` | "Model: YY2953" — single dynamic ring driver | specifications page |
| freqResponseHz | H | `{min:20, max:20000}` | "Transmission range ( A2DP ): 20 Hz - 20,000 Hz (Sampling frequency 44.1 kHz)" | specifications page |
| cableTermination | M | `usb-c` | "USB Type-C® cable (USB-A to USB-C®) (approx. 20 cm (7.88 in.)) (1)" — charging only | package contents page |
| detachableCable | M | `false` | "Power source: DC 3.85 V: Built-in lithium-ion rechargeable battery" — no detachable audio cable | specifications page |
| microphone | M | `true` | "Compatible Bluetooth profiles (*2): A2DP / AVRCP / HFP / HSP" plus the Making/Receiving a call sections | specifications page |
| foldable | M | `false` | no folding hinge/fold step; boolean feature-absence rule applied | specifications page |
| ipxRating | M | `none` | "Charging with liquid such as water or sweat ... may cause an accident" / "Do not place the headset in water" | [getting wet](https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000467221.html) |
| bluetoothCodecs | H | `SBC, AAC` | "Supported Codec (*3): SBC AAC" | specifications page |
| anc | M | `none` | "Music playback time ( AAC ): Max. 5.5 hours" — no NC/AMB row or NC/AMB button exists | [operating time](https://helpguide.sony.net/mdr/linkbuds/v1/en/contents/TP1000447703.html) |
| batteryLifeHours | M | `{ancOn:null, ancOff:5.5}` | "Music playback time ( AAC ): Max. 5.5 hours / Music playback time ( SBC ): Max. 5 hours" | operating time page |
| soundSignature | E | `null` | no Crinacle entry; RTINGS reviewed it but published no Sound Signature verdict | protocol null rule + never-inferred rule |

### LinkBuds Fit WF-LS910N (`products/linkbuds-fit.mjs`)

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| wearingStyle | M | `in-ear` | "Mass : Approx. 4.9 g × 2 (0.18 oz × 2) (Headset (including earbud tips (M) and fitting supporters))" | [specifications](https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001614209.html) |
| acousticDesign | M | `closed-back` | sealed in-ear noise-cancelling earbud; no open variant or vent described | specifications page |
| fitType | M | `universal` | interchangeable earbud tips + fitting supporters; no custom/CIEM mould | specifications page |
| connectivity | M | `true-wireless` | "Communication system : Bluetooth Specification version 5.3" | specifications page |
| portable | M | `true` | "Charging time : Approx. 2 hours (Headset) Approx. 3 hours (Charging case)" | specifications page |
| driverType | M | `dynamic` | single dynamic driver; no BA/planar/electrostatic/AMT stated | specifications page |
| freqResponseHz | H | `{min:20, max:40000}` | "Transmission range (A2DP) : 20 Hz - 20 000 Hz ... 20 Hz - 40 000 Hz (Sampling frequency LDAC 96 kHz, 990 kbps)" | specifications page |
| cableTermination | M | `usb-c` | "Power source : DC 5 V (Using a commercially available USB AC Adaptor)" — charging only | specifications page |
| detachableCable | M | `false` | "Using built-in lithium-ion batteries (Product Operation Power: DC 3.85 V)" | specifications page |
| microphone | M | `true` | "A2DP / AVRCP / HFP / HSP TMAP / CSIP / MCP / VCP / CCP" plus the call sections | specifications page |
| foldable | M | `false` | no folding hinge/fold step; boolean feature-absence rule applied | specifications page |
| ipxRating | M | `none` | "Do not splash water forcibly into the sound output parts, air holes, or microphone parts" | [getting wet](https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001613767.html) |
| bluetoothCodecs | H | `SBC, AAC, LDAC, LC3` | "Supported Codec 3) : SBC AAC LDAC LC3" | specifications page |
| anc | M | `anc` | "AAC Noise canceling function: ON Max. 5.5 hours" | [operating time](https://helpguide.sony.net/mdr/2975/v1/en/contents/TP1001612417.html) |
| batteryLifeHours | M | `{ancOn:5.5, ancOff:8}` | "AAC Noise canceling function: ON Max. 5.5 hours / AAC OFF Max. 8 hours" | operating time page |
| soundSignature | E | `null` | no Crinacle entry, no RTINGS review | protocol null rule |

### LinkBuds Open WF-L910 (`products/linkbuds-open-wf-l910.mjs`)

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| wearingStyle | M | `in-ear` | "Mass : Approx. 5.1 g × 2 (0.18 oz × 2) (Headset (including fitting supporters))" | [specifications](https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300700.html) |
| acousticDesign | M | `semi-open` | "Wireless Stereo Headset LinkBuds Open / Model: YY2964" — ring driver leaves the ear canal open by design | specifications page |
| fitType | M | `universal` | interchangeable fitting supporters; no custom/CIEM mould | specifications page |
| connectivity | M | `true-wireless` | "Communication system : Bluetooth Specification version 5.3" | specifications page |
| portable | M | `true` | "Charging time : Approx. 1.5 hours (Headset) Approx. 2.5 hours (Charging case)" | specifications page |
| driverType | M | `dynamic` | single dynamic ring driver | specifications page |
| freqResponseHz | H | `{min:20, max:20000}` | "Transmission range (A2DP) : 20 Hz - 20 000 Hz (Sampling frequency 44.1 kHz)" | specifications page |
| cableTermination | M | `usb-c` | "Power source : DC 5 V (Using a commercially available USB AC Adaptor)" — charging only | specifications page |
| detachableCable | M | `false` | "Using built-in lithium-ion batteries (Product Operation Power: DC 3.85 V)" | specifications page |
| microphone | M | `true` | "A2DP / AVRCP / HFP / HSP TMAP / CSIP / MCP / VCP / CCP" plus the call sections | specifications page |
| foldable | M | `false` | no folding hinge/fold step; boolean feature-absence rule applied | specifications page |
| ipxRating | M | `none` | "Do not splash water forcibly into the sound output parts, air holes, or microphone parts" | [getting wet](https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001300258.html) |
| bluetoothCodecs | H | `SBC, AAC, LC3` | "Supported Codec 3) : SBC AAC LC3" | specifications page |
| anc | M | `none` | "Music playback time (AAC): Max. 8 hours" — no NC/AMB row or NC/AMB button exists | [operating time](https://helpguide.sony.net/mdr/2964/v1/en/contents/TP1001298908.html) |
| batteryLifeHours | M | `{ancOn:null, ancOff:8}` | "Music playback time (AAC): Max. 8 hours / (SBC): Max. 8 hours / (LC3): Max. 8 hours" | operating time page |
| soundSignature | E | `null` | no Crinacle entry, no RTINGS review | protocol null rule |

### INZONE Buds WF-G700N (`products/inzone-buds-wf-g700n.mjs`)

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| wearingStyle | M | `in-ear` | "Mass : Approx. 6.5 g × 2 (0.23 oz × 2) (Headset (including earbud tips (M))) (white, black)" | [specifications](https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273102.html) |
| acousticDesign | M | `closed-back` | sealed in-ear noise-cancelling earbud; no open variant or vent described | specifications page |
| fitType | M | `universal` | interchangeable earbud tips; no custom/CIEM mould | specifications page |
| connectivity | M | `true-wireless` | "Communication system : Bluetooth Specification version 5.3" | specifications page |
| portable | M | `true` | "Approx. 50 g (1.77 oz) (Charging case) ... Approx. 2.9 g (0.11 oz) (USB Transceiver)" | specifications page |
| driverType | M | `dynamic` | single dynamic driver | specifications page |
| freqResponseHz | H | `{min:20, max:20000}` | "Transmission range : 20 Hz - 20 000 Hz (Sampling frequency 48 kHz)" | specifications page |
| cableTermination | M | `usb-c` | "USB transceiver storage compartment / USB Type-C port" — no analogue input | specifications page |
| detachableCable | M | `false` | "Using built-in lithium-ion batteries (Product Operation Power: DC 3.85 V)" | specifications page |
| microphone | M | `true` | "Microphones (left, right) — Picks up the sound of your voice (when you are talking on the phone or using voice chat) and noise" | [parts](https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273041.html) |
| foldable | M | `false` | no folding hinge/fold step; boolean feature-absence rule applied | specifications page |
| ipxRating | M | `none` | "Do not splash water forcibly into the sound output parts, air holes, or microphone parts" | [getting wet](https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273074.html) |
| bluetoothCodecs | H | `LC3` | "Supported Codec 4) : LC3" | specifications page |
| anc | M | `anc` | "LC3 Noise canceling function: ON Max. 18 hours" | [operating time](https://helpguide.sony.net/mdr/2977/v1/en/contents/TP1001273047.html) |
| batteryLifeHours | M | `{ancOn:18, ancOff:24}` | "LC3 Noise canceling function: ON Max. 18 hours / LC3 OFF Max. 24 hours" | operating time page |
| soundSignature | E | `Warm` | "Sound Signature = Warm; Bass Amount = Slightly Emphasized (2 dB); Treble Amount = Balanced (0 dB)" | [RTINGS](https://www.rtings.com/headphones/reviews/sony/inzone-buds-truly-wireless) |

### WH-CH720N (`products/wh-ch720n.mjs`)

| Field | Tier | Value | Exact quote | Source |
|---|---|---|---|---|
| wearingStyle | M | `over-ear` | "Mass: Approx. 192 g (6.8 oz) / Impedance: 325 Ω (1 kHz) (when connecting via the headphone cable with the headset turned on)" | [specifications](https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000783326.html) |
| acousticDesign | M | `closed-back` | closed circumaural noise-cancelling over-ear; no open variant or vent described | specifications page |
| connectivity | M | `hybrid` | "Headphone cable connected (power is turned on) Noise canceling function: ON Max. 35 hours" — wired and Bluetooth | [operating time](https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000776820.html) |
| portable | M | `true` | "Mass: Approx. 192 g (6.8 oz)" | specifications page |
| driverType | M | `dynamic` | "Model: YY2966" — single dynamic driver | specifications page |
| freqResponseHz | H | `{min:7, max:20000}` | "Frequency response: 7 Hz - 20 000 Hz (JEITA) (when connecting via the headphone cable with the headset turned on)" | specifications page |
| cableTermination | M | `3.5mm` | "Headphone cable (approx. 1.2 m (47.25 in.)) (1)" | [package contents](https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000776827.html) |
| detachableCable | M | `true` | "Using the supplied headphone cable" — plugs into a headphone cable input jack on the headset | [supplied cable](https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000777054.html) |
| cableLengthM | H | `1.2` | "Headphone cable (approx. 1.2 m (47.25 in.)) (1)" | package contents page |
| microphone | M | `true` | "Microphone / Picks up the sound of your voice when talking on the phone." | [parts](https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000776825.html) |
| foldable | M | `false` | no folding hinge/fold step; boolean feature-absence rule applied | specifications page |
| ipxRating | M | `none` | "On waterproof performance of the headset The headset is not waterproof. If water or foreign matter enters the headset, this can result in burnout or malfunction." | [getting wet](https://helpguide.sony.net/mdr/2966/v1/en/contents/TP1000784812.html) |
| bluetoothCodecs | H | `SBC, AAC` | "Supported Codec 3) : SBC AAC" | specifications page |
| anc | M | `anc` | "AAC Noise canceling function: ON Max. 35 hours" | operating time page |
| batteryLifeHours | M | `{ancOn:35, ancOff:50}` | "AAC Noise canceling function: ON Max. 35 hours / AAC OFF Max. 50 hours" | operating time page |
| soundSignature | E | `Warm` | "Sound Signature = Warm; Bass Amount = Very Emphasized (5 dB); Treble Amount = Slightly Emphasized (1 dB)" | [RTINGS](https://www.rtings.com/headphones/reviews/sony/wh-ch720n-wireless) |





## Null fields (protocol-compliant, not gaps)

`soundSignature` is the only field left `null` anywhere in this batch, and only
where the protocol requires it — the value exists **only** when a Tier-3
independent measurement source published it:

| Model | soundSignature | Why |
|---|---|---|
| WH-1000XM5 | `Warm` | RTINGS |
| WF-1000XM5 | `Warm` | RTINGS |
| INZONE Buds | `Warm` | RTINGS |
| WH-CH720N | `Warm` | RTINGS |
| LinkBuds (WF-L900) | `null` | Crinacle has no entry; RTINGS reviewed it but published no Sound Signature verdict |
| LinkBuds Fit | `null` | no Crinacle entry, no RTINGS review |
| LinkBuds Open | `null` | no Crinacle entry, no RTINGS review |

Crinacle's IEM and headphone ranking lists were both checked directly and
contain **none** of the seven Sony models (verified by grepping the fetched
ranking pages for `WH-1000XM5`, `WF-1000XM5`, `LinkBuds`, `WF-L900`,
`WF-L910`, `WF-LS910N`, `WF-G700N`, `WH-CH720N` — zero hits; Crinacle's
newest Sony entries are the WH-1000XM4 and older). Per the protocol,
`soundSignature` is `null` when no Tier-3 source measures the product and is
**never** inferred from marketing copy.

## Conflict record

No same-tier Sony source contradiction was encountered in this batch, so the
recency rule was not needed: every value above comes from a single
manufacturer help-guide page, with RTINGS supplying only the Tier-3
`soundSignature` that the manufacturer tier cannot supply by design.

## Patched to Sanity 2026-09-13

All 10 documents patched via `node runPatch.mjs products/<slug>.mjs --write`,
one run per product, each with its own backup file under
`sanity-cms/backups/`. 16 `filterAttributes` fields and 16 `sourcing`
citations written per product.

| Product | `_id` | Rev | Backup |
|---|---|---|---|
| WH-1000XM5 | `moXlkADK7m1DHgGwWtblsT` | `MzerujO1CrL1dzm03ZFnUj` | `backup_headphones_moXlkADK7m1DHgGwWtblsT_2026-09-13T13-37-55-570Z.json` |
| WH-1000XM5 (Pink) | `ZuUKzmkqDyQwdcwhxl9BBF` | `7P2D00ai8KUgrZgiFaNhk6` | `backup_headphones_ZuUKzmkqDyQwdcwhxl9BBF_2026-09-13T13-37-57-969Z.json` |
| WF-1000XM5 | `n10eAegrGspodtsQw12meG` | `7P2D00ai8KUgrZgiFaNRrV` | `backup_headphones_n10eAegrGspodtsQw12meG_2026-09-13T13-37-59-727Z.json` |
| WF-1000XM5 bundle (Black) | `ZuUKzmkqDyQwdcwhxl99sR` | `7P2D00ai8KUgrZgiFaNSAD` | `backup_headphones_ZuUKzmkqDyQwdcwhxl99sR_2026-09-13T13-38-05-791Z.json` |
| WF-1000XM5 bundle (Silver) | `ZuUKzmkqDyQwdcwhxwQPfT` | `Ch755lAE5GLsZ435Cw8k72` | `backup_headphones_ZuUKzmkqDyQwdcwhxwQPfT_2026-09-13T13-38-07-318Z.json` |
| LinkBuds (WF-L900) | `k27n1AQuIbSr5iozG2itJe` | `Ch755lAE5GLsZ435Cw8kIV` | `backup_headphones_k27n1AQuIbSr5iozG2itJe_2026-09-13T13-38-09-160Z.json` |
| LinkBuds Fit | `ZuUKzmkqDyQwdcwhxwQLK7` | `Ch755lAE5GLsZ435Cw8kWW` | `backup_headphones_ZuUKzmkqDyQwdcwhxwQLK7_2026-09-13T13-38-10-833Z.json` |
| LinkBuds Open (WF-L910) | `dLGDVDmEEI2lV8CArIgVky` | `7P2D00ai8KUgrZgiFaNSse` | `backup_headphones_dLGDVDmEEI2lV8CArIgVky_2026-09-13T13-38-14-787Z.json` |
| INZONE Buds (WF-G700N) | `dLGDVDmEEI2lV8CArIgSA0` | `7P2D00ai8KUgrZgiFaNSzf` | `backup_headphones_dLGDVDmEEI2lV8CArIgSA0_2026-09-13T13-38-16-639Z.json` |
| WH-CH720N | `dLGDVDmEEI2lV8CArIgbTY` | `MzerujO1CrL1dzm03ZF6Sp` | `backup_headphones_dLGDVDmEEI2lV8CArIgbTY_2026-09-13T13-38-18-389Z.json` |

A re-run dry-run for all 10 afterwards reports every field unchanged against
live Sanity, and a direct re-read confirms 16/16 fields and 16/16 citations
match the spec files on every document.

**All 29 distinct cited URLs were re-fetched and return HTTP 200** — every
citation in this document and in the 10 spec files was opened and confirmed
live, not assumed. One correction was found and fixed during that pass: the
WH-1000XM5 `foldable` citation originally pointed at a non-existent
`TP1000536952.html`; it now points at the real `TP1000534705.html`
("Setting the headset in the carrying case"), and both WH-1000XM5 documents
were re-patched (`rev MzerujO1CrL1dzm03ZFnUj`, `rev 7P2D00ai8KUgrZgiFaNhk6`).

`requiresAmplifier` and `driverConfigDetail` were deliberately **not** written
— they are D-tier (derived) fields carrying no citation of their own, per
`schema-headphones.md`.


