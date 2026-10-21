// Curated option-label overrides, keyed by attribute path then raw data
// value. Seeded from target-snapshot.json's declared option labels — the only
// hand-kept labels left. The adapter applies `override ?? humanize` per
// option: a label here wins, anything else is humanized. This map can rename a
// label but can never add, remove or reorder an option — the option set is
// always exactly the field's distinct data values. Entries whose value no
// product carries are dormant.

export const OPTION_LABEL_OVERRIDES: Record<string, Record<string, string>> = {
  'accessoryType': {
    'cables-interconnects': 'Cables & Interconnects',
    'replacement-parts': 'Replacement Parts',
    'cases-storage-transport': 'Cases & Storage',
    'adapters-converters': 'Adapters & Converters',
    'cleaning-maintenance': 'Cleaning & Maintenance',
    'stands-isolation': 'Stands & Isolation',
  },

  'acousticDesign': {
    'open-back': 'Open-Back',
    'closed-back': 'Closed-Back',
    'semi-open': 'Semi-Open / Hybrid',
  },

  'amplification': {
    'solid-state': 'Solid-State',
    'tube': 'Tube / Valve',
    'hybrid': 'Hybrid (Tube + Solid-State)',
    'class-d': 'Class D (Switching Amp)',
  },

  'anc': {
    'anc': 'Active Noise Cancelling',
    'passive': 'Passive Isolation Only',
    'none': 'No Noise Cancelling',
  },

  'balancedUnbalanced': {
    'balanced': 'Balanced (Noise-Rejecting)',
    'unbalanced': 'Unbalanced (Standard)',
  },

  'bluetoothCodecs': {
    'SBC': 'SBC (Basic)',
    'AAC': 'AAC (Apple-Optimized)',
    'aptX': 'aptX',
    'aptX HD': 'aptX HD (Hi-Res)',
    'aptX Adaptive': 'aptX Adaptive (Auto-Adjusting)',
    'aptX LL': 'aptX LL (Low-Latency)',
    'LDAC': 'LDAC (Hi-Res)',
    'LC3': 'LC3 (LE Audio)',
  },

  'cableFunction': {
    'headphone-cable': 'Headphone Cable',
    'interconnect-rca-xlr': 'Interconnect (RCA/XLR)',
    'digital-usb-coaxial-optical-aes-ebu-ethernet': 'Digital Cable',
  },

  'cableTermination': {
    '3.5mm': '3.5mm SE',
    '2.5mm-balanced': '2.5mm Balanced',
    '4.4mm-balanced': '4.4mm Balanced',
    '4-pin-xlr': '4-Pin XLR',
    '6.35mm': '6.35mm (1/4 inch)',
    'usb-c': 'USB-C',
    'mmcx': 'MMCX (Snap-In)',
    '2-pin': '2-Pin',
  },

  'compatibleProductType': {
    'headphone': 'Headphones',
    'speaker': 'Speakers',
    'amplifier-source': 'Amplifiers & Sources',
    'universal-any': 'Universal',
  },

  'conductorMaterial': {
    'copper-ofc': 'Copper / Oxygen-Free (OFC)',
    'silver': 'Silver',
    'silver-plated-copper': 'Silver-Plated Copper',
  },

  'connectivity': {
    'wired': 'Wired',
    'wireless': 'Wireless (Bluetooth)',
    'hybrid': 'Wired/Wireless Hybrid',
  },

  'connectorTermination': {
    'rca': 'RCA',
    'xlr': 'XLR',
    '3.5mm': '3.5mm',
    '2.5mm': '2.5mm',
    '4.4mm': '4.4mm',
    '6.35mm': '6.35mm',
    '4-pin-mini-xlr': '4-Pin Mini XLR',
    'mini-to-rca': '3.5mm Mini-Jack to RCA',
  },

  'dacChipsetFamily': {
    'ess-sabre': 'ESS Sabre (Crisp, Detailed)',
    'akm': 'AKM (Warm, Smooth)',
    'cirrus-logic': 'Cirrus Logic (Balanced)',
    'r2r-ladder': 'R-2R Ladder (Analog-Style)',
  },

  'deviceConnectivity': {
    'wired': 'Wired',
    'bluetooth': 'Bluetooth',
    'wifi-networked': 'Wi-Fi / Networked',
    'wired-wireless': 'Wired + Wireless (BT/Wi-Fi)',
  },

  'deviceType': {
    'headphone-amplifier': 'Headphone Amplifier',
    'digital-audio-player': 'Digital Audio Player',
    'dac': 'DAC (Converter)',
    'network-streamer': 'Network Streamer',
    'preamplifier': 'Preamplifier (Needs Power Amp)',
    'integrated-amplifier': 'Integrated Amp (All-in-One)',
    'power-amplifier': 'Power Amp (Needs Preamp)',
    'cd-player-transport': 'CD Player / Transport',
  },

  'driverConfigBucket': {
    'single-dynamic': 'Single Dynamic',
    'single-ba': 'Single Balanced Armature',
    'multi-ba': 'Multi Balanced Armature',
    'hybrid-config': 'Hybrid (Multi-Driver Combo)',
    'planar': 'Planar',
    'other': 'Other / Unusual Design',
  },

  'driverType': {
    'dynamic': 'Dynamic',
    'planar-magnetic': 'Planar Magnetic',
    'electrostatic': 'Electrostatic',
    'balanced-armature': 'Balanced Armature',
    'amt': 'AMT / Ribbon (Air-Motion)',
    'bone-conduction': 'Bone Conduction',
    'electret': 'Electret (Electrostatic-Type)',
    'hybrid': 'Hybrid (Mixed Driver Types)',
  },

  'dsdSupport': {
    'none': 'None',
    'dsd64': 'DSD64 (Hi-Res Audio)',
    'dsd128': 'DSD128 (Hi-Res Audio)',
    'dsd256-plus': 'DSD256+ (Hi-Res Audio)',
  },

  'formFactor': {
    'desktop': 'Desktop',
    'portable': 'Portable',
    'dongle': 'Dongle',
  },

  'inputs': {
    'usb': 'USB',
    'optical': 'Optical',
    'coaxial': 'Coaxial',
    'rca': 'RCA',
    'xlr-balanced': 'XLR / Balanced',
    'phono-mm-mc': 'Phono / Turntable (MM/MC)',
    'hdmi-earc': 'HDMI (ARC / eARC)',
    'ethernet-lan': 'Ethernet / LAN',
    'i2s-iis': 'I2S / IIS (Pro Audio)',
    'aes-ebu': 'AES/EBU (Pro Audio)',
  },

  'ipxRating': {
    'none': 'None',
    'IPX2': 'IPX2 (Light Drips)',
    'IPX4': 'IPX4 (Splash-Proof)',
    'IPX5': 'IPX5 (Jets / Heavy Rain)',
    'IPX7': 'IPX7 (30-Min Submersion)',
    'IPX8': 'IPX8 (Swimmable)',
  },

  'partType': {
    'ear-pads-cushions': 'Ear Pads / Cushions',
    'ear-tips': 'Ear Tips',
  },

  'soundSignature': {
    'Neutral': 'Neutral',
    'Warm': 'Warm',
    'Bright/Analytical': 'Bright / Analytical',
    'Dark': 'Dark (Smooth, Laid-Back)',
    'V-Shaped': 'V-Shaped (Bass + Treble Boost)',
    'Basshead': 'Basshead (Heavy Bass)',
    'Mid-Forward': 'Mid-Forward (Prominent Vocals)',
    'Harman-target-like': 'Harman Tuning (Balanced Sound)',
  },

  'streamingPlatformSupport': {
    'airplay2': 'AirPlay 2',
    'chromecast': 'Chromecast built-in',
    'spotify-connect': 'Spotify Connect',
    'tidal-connect': 'TIDAL Connect',
    'roon-ready': 'Roon Ready (Roon Music Server)',
    'dlna': 'DLNA (Legacy Network Share)',
  },
};
