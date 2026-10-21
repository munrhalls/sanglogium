Source: `features/product-filtering/core/definitions/categories/*.ts`, `facetMap.ts`, `sortOptions.ts`.


## headphones

| id | label | group | control | options |
|---|---|---|---|---|
| brand | Brand | commercial | checkbox | derived |
| inStock | In Stock Only | commercial | boolean | — |
| acousticDesign | Acoustic Design | type | checkbox | open-back, closed-back, semi-open |
| connectivity | Connectivity | type | checkbox | wired, wireless, hybrid |
| soundSignature | Signature | sound | checkbox | Neutral, Warm, Bright/Analytical, Dark, V-Shaped, Basshead, Mid-Forward, Harman-target-like |
| impedance | Impedance | sound | range | — |
| sensitivity | Sensitivity | sound | range | — |
| bassExtension | Bass Extension | sound | range | — |
| microphone | Microphone | material | boolean | — |
| cableTermination | Cable Type | material | checkbox | 3.5mm, 2.5mm-balanced, 4.4mm-balanced, 4-pin-xlr, 6.35mm, usb-c, mmcx, 2-pin |
| foldable | Foldable | material | boolean | — |
| cableLength | Cable Length | material | range | — |
| ipx | Water Resistance (IPX) | material | checkbox | none, IPX2, IPX4, IPX5, IPX7, IPX8 |
| requiresAmplifier | Requires Amplifier | material | boolean | — |
| portable | Portable | material | boolean | — |
| codec | Bluetooth Codec | wireless | checkbox | SBC, AAC, aptX, aptX HD, aptX Adaptive, aptX LL, LDAC, LC3 |
| anc | Noise Cancelling | wireless | checkbox | anc, passive, none |
| batteryLife | Battery Life | wireless | range | — |
| driverType | Driver Type | technical | checkbox | dynamic, planar-magnetic, electrostatic, balanced-armature, amt, bone-conduction, electret, hybrid |
| driverConfig | Driver Configuration | technical | checkbox | single-dynamic, single-ba, multi-ba, hybrid-config, planar, other |

## audioElectronics

| id | label | group | control | options |
|---|---|---|---|---|
| brand | Brand | commercial | checkbox | derived |
| inStock | In Stock Only | commercial | boolean | — |
| deviceType | Device Type | type | checkbox | headphone-amplifier, digital-audio-player, dac, network-streamer, preamplifier, integrated-amplifier, power-amplifier, cd-player-transport |
| formFactor | Form Factor | type | checkbox | desktop, portable, dongle |
| deviceConnectivity | Connectivity | connections | checkbox | wired, bluetooth, wifi-networked, wired-wireless |
| inputs | Inputs | connections | checkbox | usb, optical, coaxial, rca, xlr-balanced, phono-mm-mc, hdmi-earc, ethernet-lan, i2s-iis, aes-ebu |
| balancedOutput | Balanced Output | connections | boolean | — |
| amplification | Amplifier Topology | amplification | checkbox | solid-state, tube, hybrid, class-d |
| dacIncluded | Built-in DAC | digital | boolean | — |
| dsdSupport | DSD Support | digital | checkbox | none, dsd64, dsd128, dsd256-plus |
| dacChipsetFamily | DAC Chipset | digital | checkbox | ess-sabre, akm, cirrus-logic, r2r-ladder |
| streamingPlatformSupport | Streaming Platforms | digital | checkbox | airplay2, chromecast, spotify-connect, tidal-connect, roon-ready, dlna |

## accessories

| id | label | group | control | options |
|---|---|---|---|---|
| brand | Brand | commercial | checkbox | derived |
| inStock | In Stock Only | commercial | boolean | — |
| accessoryType | Accessory Type | type | checkbox | cables-interconnects, replacement-parts, cases-storage-transport, adapters-converters, cleaning-maintenance, stands-isolation |
| compatibleProductType | Compatible With | type | checkbox | headphone, speaker, amplifier-source, universal-any |
| cableFunction | Cable Type | cables | checkbox | headphone-cable, interconnect-rca-xlr, digital-usb-coaxial-optical-aes-ebu-ethernet |
| connectorTermination | Connectors | cables | checkbox | rca, xlr, 3.5mm, 2.5mm, 4.4mm, 6.35mm, 4-pin-mini-xlr, mini-to-rca |
| length | Length | cables | range | — |
| conductorMaterial | Conductor Material | cables | checkbox | copper-ofc, silver, silver-plated-copper |
| balanced | Signal Type | cables | checkbox | balanced, unbalanced |
| partType | Part Type | replacementParts | checkbox | ear-pads-cushions, ear-tips |

## Sort options (shared)

| value | label |
|---|---|
| newest | Recently Added |
| price-asc | Price, Low to High |
| price-desc | Price, High to Low |
| alpha-asc | Alphabetically, A-Z |
| alpha-desc | Alphabetically, Z-A |

## facetMap — storage type + urlParam per facet

| facet | attribute | type | urlParam | categories |
|---|---|---|---|---|
| Price | price | range | price | * |
| Brand | brand | multi | brand | * |
| In stock only | inStock | boolean | inStock | * |
| Category | category | multi | category | all-products |
| Wearing style | wearingStyle | multi | wearingStyle | headphones |
| Back design | acousticDesign | multi | acousticDesign | headphones |
| Driver type | driverType | multi | driverType | headphones |
| Connectivity | connectivity | enum | connectivity | headphones |
| Connector / plug | cableTermination | multi | cableTermination | headphones |
| Microphone | microphone | boolean | microphone | headphones |
| Noise cancelling | anc | enum | anc | headphones |
| Requires amplifier | requiresAmplifier | boolean | requiresAmplifier | headphones |
| Product category | productCategory | multi | productCategory | headphones |
| Fit type | fitType | enum | fitType | headphones |
| Portable | portable | boolean | portable | headphones |
| Sound signature | soundSignature | enum | soundSignature | headphones |
| Detachable cable | detachableCable | boolean | detachableCable | headphones |
| Foldable | foldable | boolean | foldable | headphones |
| Water / sweat resistance | ipxRating | enum | ipx | headphones |
| Bluetooth codec | bluetoothCodecs | multi | codec | headphones |
| Driver configuration | driverConfigBucket | enum | driverConfig | headphones |
| Impedance | impedanceOhms | range | impedance | headphones |
| Sensitivity | sensitivityDbMw | range | sensitivity | headphones |
| Frequency response -- bass extension | freqResponseHz.min | range | bassExtension | headphones |
| Cable length | cableLengthM | range | cableLength | headphones |
| Battery life | batteryLifeHours.ancOff | range | batteryLife | headphones |
| Device type | deviceType | enum | deviceType | audio-electronics |
| Connectivity | deviceConnectivity | enum | deviceConnectivity | audio-electronics |
| DSD support | dsdSupport | enum | dsdSupport | audio-electronics |
| DAC chipset family | dacChipsetFamily | multi | dacChipsetFamily | audio-electronics |
| Streaming platform support | streamingPlatformSupport | multi | streamingPlatformSupport | audio-electronics |
| Form factor | formFactor | enum | formFactor | audio-electronics |
| Amplification | amplification | enum | amplification | audio-electronics |
| DAC included | dacIncluded | boolean | dacIncluded | audio-electronics |
| Balanced output | balancedOutput | boolean | balancedOutput | audio-electronics |
| Inputs | inputs | multi | inputs | audio-electronics |
| Accessory type | accessoryType | enum | accessoryType | accessories |
| Connector / termination | connectorTermination | multi | connectorTermination | accessories |
| Awards / recognition | awards | multi | awards | headphones |
| Condition | condition | enum | condition | audio-electronics |
| Compatible product type | compatibleProductType | multi | compatibleProductType | accessories |
| Cable function | cableFunction | multi | cableFunction | accessories |
| Length | lengthM | range | length | accessories |
| Conductor material | conductorMaterial | multi | conductorMaterial | accessories |
| Balanced / unbalanced | balancedUnbalanced | enum | balanced | accessories |
| Part type | partType | enum | partType | accessories |
