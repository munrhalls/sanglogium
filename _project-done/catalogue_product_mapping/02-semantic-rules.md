# VFS Mapping Semantic Lookup Table - 2026-03-27

## Overview

This document contains the semantic mapping lookup table used by the VFS mapping script to automatically determine product catalogue locations based on their traits and features.

## Semantic Map Configuration

The following mapping connects catalogue leaf node slugs to semantic keywords found in product `overviewFields` and `name`:

```javascript
const semanticMap = {
  'desktop-amps': ['integrated amplifier', 'integrated amp'],
  'dac-amp-combos': ['d/a conversion', 'reference quality d/a conversion', 'hi-res d/a conversion'],
  'standalone-dacs': ['standalone dac', 'separate dac'],
  'portable-amps': ['portable amplifier', 'portable amp'],
  'network-streamers': ['network streamer', 'streaming device'],
  'digital-players-daps': ['digital audio player', 'dap'],
  'interconnects': ['rca cable', 'xlr cable'],
  'headphone-cables': ['headphone cable', 'detachable cable'],
  'adapters': ['adapter', 'adaptor'],
  'carrying-cases': ['carrying case', 'protective case'],
  'headphone-stands': ['headphone stand', 'display stand'],
  'earpads': ['earpad', 'ear pad'],
  'care-cleaning': ['cleaning kit', 'care solution'],
  'closed-back': ['closed back headphone'],
  'open-back': ['open back headphone'],
  'monitors-iems': ['in-ear monitor', 'iem'],
  'true-wireless-tws': ['true wireless'],
  'dynamic': ['dynamic driver'],
  'planar-magnetic': ['planar magnetic', 'planar driver'],
  'electrostatic': ['electrostatic headphone']
};
```

## Mapping Logic

The script uses the following algorithm to determine catalogue locations:

1. **Extract Product Traits**: 
   - Product name + all `overviewFields` values
   - Combined into normalized "knowledge string"

2. **Semantic Matching**:
   - For each leaf node, check if any semantic keywords exist in knowledge string
   - Case-insensitive matching
   - Returns all matching leaf node IDs

3. **Deduplication**:
   - Removes duplicate IDs
   - Returns clean array of catalogue location IDs

## Category Breakdown

### Audio Electronics - Amplification
- **Desktop Amps**: Products with "integrated amplifier" or "integrated amp"
- **Portable Amps**: Products with "portable amplifier" or "portable amp"

### Audio Electronics - Digital Sources
- **DAC/Amp Combos**: Products with "d/a conversion", "reference quality d/a conversion", or "hi-res d/a conversion"
- **Standalone DACs**: Products with "standalone dac" or "separate dac"
- **Network Streamers**: Products with "network streamer" or "streaming device"
- **Digital Players (DAPs)**: Products with "digital audio player" or "dap"

### Accessories - Connectivity
- **Interconnects**: Products with "rca cable" or "xlr cable"
- **Headphone Cables**: Products with "headphone cable" or "detachable cable"
- **Adapters**: Products with "adapter" or "adaptor"

### Accessories - Maintenance
- **Earpads**: Products with "earpad" or "ear pad"
- **Care & Cleaning**: Products with "cleaning kit" or "care solution"

### Accessories - Storage
- **Headphone Stands**: Products with "headphone stand" or "display stand"
- **Carrying Cases**: Products with "carrying case" or "protective case"

### Headphones - By Design
- **Closed-Back**: Products with "closed back headphone"
- **Open-Back**: Products with "open back headphone"

### Headphones - By Driver
- **Dynamic**: Products with "dynamic driver"
- **Planar Magnetic**: Products with "planar magnetic" or "planar driver"
- **Electrostatic**: Products with "electrostatic headphone"

### Headphones - In-Ear & Wireless
- **Monitors (IEMs)**: Products with "in-ear monitor" or "iem"
- **True Wireless (TWS)**: Products with "true wireless"

## Example Usage

**Product**: Marantz PM6007 Integrated Amplifier with Digital Connectivity
**Traits**: "integrated current feedback amplifier", "d/a conversion", "reference quality d/a conversion"
**Matches**: 
- `desktop-amps` (contains "integrated amplifier")
- `dac-amp-combos` (contains "d/a conversion")
**Result**: `['o6mz3kbs5xla8ixastppktsd', 'o37u0yjphzt3qu91ewnww2yj']`

## Maintenance

- Add new keywords to existing categories as needed
- Create new categories for emerging product types
- Update keyword precision to reduce false positives
- Test with real product data to ensure accuracy

Last updated: 2026-03-27
