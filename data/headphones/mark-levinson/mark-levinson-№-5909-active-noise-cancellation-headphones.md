---
product_id: "k27n1AQuIbSr5iozG2iyZJ"
product_slug: "mark-levinson-№-5909-active-noise-cancellation-headphones"
brand: "Mark Levinson"
name: "Mark Levinson № 5909 Active Noise Cancellation Headphones"
slice: "headphones"
spec_fields:
  productCategory:
    - "over-ear"
  wearingStyle:
    - "over-ear"
  acousticDesign:
    - "closed-back"
  fitType: null
  connectivity: "hybrid"
  portable: true
  soundSignature: null
  microphone: true
  cableTermination:
    - "3.5mm"
    - "usb-c"
  detachableCable: true
  cableLengthM: 4
  foldable: false
  ipxRating: "none"
  bluetoothCodecs:
    - "SBC"
    - "AAC"
    - "aptX Adaptive"
    - "LDAC"
  anc: "anc"
  batteryLifeHours:
    ancOff: 34
    ancOn: 30
  driverType:
    - "dynamic"
  awards: null
  driverConfigBucket: null
  driverConfigDetail: null
source_urls:
  - "https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current"
  - "https://cdn.shopify.com/s/files/1/1791/0383/files/ML_No5909_Owners_Manual_Rev1_220202.pdf?v=1652392823"
  - "https://cdn.shopify.com/s/files/1/1791/0383/files/SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf?v=1652392823"
  - "https://headphones.com/products/mark-levinson-5909-active-noise-cancellation-headphones"
  - "https://crinacle.com/rankings/headphones/"
verified_at: "2026-09-14"
data_status: "COMPLETE"
---

## Verification Notes
- **productCategory** (marketing-fact): over-ear — manufacturer PDP headline "HIGH-RESOLUTION WIRELESS HEADPHONES WITH ACTIVE NOISE CANCELLATION" and headphones.com lists "Wearing style: Over-ear" — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **wearingStyle** (marketing-fact): over-ear — manufacturer PDP describes "Premium leather headband and replaceable leather ear cushions"; the Owner's Manual uses no on-ear/in-ear wording — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **acousticDesign** (marketing-fact): closed-back — headphones.com structured spec block lists "Cup style: Closed-Back"; the manufacturer PDP and manual never use a closed-back token, so this one field falls to the audited retailer per the widened M-tier order — https://headphones.com/products/mark-levinson-5909-active-noise-cancellation-headphones
- **fitType** (marketing-fact): null — not an IEM; field does not apply to over-ear headphones — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **connectivity** (marketing-fact): hybrid — manufacturer PDP lists "Bluetooth 5.1 with LDAC, AAC and aptX™ Adaptive technologies" and ships a 1.25 m USB-C to 3.5 mm audio cable; the Owner's Manual PASSIVE section confirms wired analog operation — https://cdn.shopify.com/s/files/1/1791/0383/files/ML_No5909_Owners_Manual_Rev1_220202.pdf?v=1652392823
- **portable** (marketing-fact): true — "Designed For Travel — A hard-shell carrying case discretely stores a complete assortment of cables and accessories"; the manual ships a Travel Storage Case — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **soundSignature** (editorial): null — no Crinacle, ASR, or Rtings measurement exists for the № 5909. Crinacle rankings and WordPress search API returned no Mark Levinson content; the ASR thread contains no measurements; the Rtings product URL returns 404 — https://crinacle.com/rankings/headphones/
- **microphone** (marketing-fact): true — "Four-microphone voice array with Smart Wind Adaption"; the Owner's Manual overview lists "8 Microphones (4 talk microphones and 4 ANC microphones)" — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **cableTermination** (marketing-fact): 3.5mm, usb-c — "Cables (audio): 4 m USB-C to 3.5 mm audio cable / 1.25 m USB-C to 3.5 mm audio cable"; the manual describes plugging the USB-C connection end into the right ear cup, accepting proprietary interchangeable cables — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **detachableCable** (marketing-fact): true — Owner's Manual: "Plug the USB-C connection end into the USB-C input on the Right ear cup" and "Choose the appropriate length (1.25m or 4m) proprietary audio cable" — https://cdn.shopify.com/s/files/1/1791/0383/files/ML_No5909_Owners_Manual_Rev1_220202.pdf?v=1652392823
- **cableLengthM** (hard-spec): 4 — two cables supplied (4 m and 1.25 m); the schema has a single value, so the longer cable is recorded and the 1.25 m is noted (same gap already recorded for Focal Clear Mg / Meze) — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **foldable** (marketing-fact): false — boolean feature-absence rule: no folding / hinge / collapse / flat-fold claim anywhere across the manufacturer PDP, the Owner's Manual, or the Spec Sheet; the manual's only adjustability language is "Adjust to find optimal fit" and "Rotates for comfort around neck" — https://cdn.shopify.com/s/files/1/1791/0383/files/ML_No5909_Owners_Manual_Rev1_220202.pdf?v=1652392823
- **ipxRating** (marketing-fact): none — no IPX / water-resistance / sweat rating appears in the Spec Sheet's complete specification list or the PDP feature list; "none" is the schema's own enum value for "no rating" — https://cdn.shopify.com/s/files/1/1791/0383/files/SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf?v=1652392823
- **bluetoothCodecs** (marketing-fact): SBC, AAC, aptX Adaptive, LDAC — Owner's Manual: "connectivity via Bluetooth 5.1 with LDAC, AAC, and aptX™ Adaptive"; SBC is the mandatory baseline codec of A2DP ("Bluetooth profile version: A2DP 1.3.1" in the spec sheet) — https://cdn.shopify.com/s/files/1/1791/0383/files/ML_No5909_Owners_Manual_Rev1_220202.pdf?v=1652392823
- **anc** (marketing-fact): anc — "Adaptive Active Noise Cancellation (ANC) with three modes"; the Owner's Manual ANC button maps "x1: ANC ON (HIGH, ADAPTIVE, LOW modes)" — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **batteryLifeHours** (marketing-fact): ancOff 34, ancOn 30 — Spec Sheet: "Music playtime with BT on: 34 hrs" / "Music playtime with BT & ANC on: 30 hrs" — https://cdn.shopify.com/s/files/1/1791/0383/files/SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf?v=1652392823
- **driverType** (hard-spec): dynamic — manufacturer PDP: "Expertly tuned 40 mm Beryllium coated drivers"; Spec Sheet: "Driver size: 40mm Beryllium Coated Driver" — https://cdn.shopify.com/s/files/1/1791/0383/files/SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf?v=1652392823
- **impedanceOhms** (hard-spec): 32 — "Impedance: 32 ohm" — https://cdn.shopify.com/s/files/1/1791/0383/files/SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf?v=1652392823
- **sensitivityDbMw** (hard-spec): 97 — "Sensitivity: 97dB SPL @1kHz/1mW" — https://cdn.shopify.com/s/files/1/1791/0383/files/SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf?v=1652392823
- **freqResponseHz** (hard-spec): 10–40,000 — "Frequency response (Passive): 10Hz – 40kHz" — https://cdn.shopify.com/s/files/1/1791/0383/files/SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf?v=1652392823
- **awards** (marketing-fact): null — the manufacturer PDP hosts reviewer superlatives, but these are review-outlet blurbs hosted as marketing, not dated named awards conferred on the SKU — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **driverConfigBucket** (marketing-fact): null — not an IEM; field does not apply to over-ear headphones — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **driverConfigDetail** (marketing-fact): null — not an IEM; field does not apply to over-ear headphones — https://web.archive.org/web/20230331215112/https://www.marklevinson.com/products/headphones/NO5909-.html?dwvar_NO5909-_color=Black-AM-Current
- **CONFLICT — freqResponseHz**: The Spec Sheet publishes two frequency responses: "Frequency response (Passive): 10Hz – 40kHz" and "Frequency response (Active): 20Hz – 20kHz". The schema has a single {min, max} pair, so this is a schema-granularity limitation. Resolved by recording the passive figure (10–40,000 Hz) because it is the wider range and the one the manufacturer headlines for its Hi-Res claim; the active figure (20–20,000 Hz) is retained here for a later pass. — https://cdn.shopify.com/s/files/1/1791/0383/files/SC04510_NA_Mark_Levinson_No5909_Spec_Sheet_v2_HR.pdf?v=1652392823
- **CONFLICT — connectivity**: headphones.com's structured spec block says "Connectivity: Wireless", matching the prior POC value. The manufacturer sources, however, ship two wired analog cables and the manual devotes a PASSIVE section to wired operation. Resolved in favour of the schema's "hybrid" value (wired + wireless) as the more accurate; the retailer's narrower "Wireless" value is recorded here. — https://headphones.com/products/mark-levinson-5909-active-noise-cancellation-headphones
