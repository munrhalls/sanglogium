export interface SemanticCategoryRule {
  slug: string;
  title: string;
  positiveKeywords: string[];
  negativeKeywords: string[];
  requiredKeywords?: string[];
  brandMatches?: string[];
  weightings: {
    name: number;
    brand: number;
    required: number;
    positive: number;
    negative: number;
  };
}

export const SEMANTIC_CATEGORIES: Record<string, SemanticCategoryRule> = {
  'open-back': {
    slug: 'open-back',
    title: 'Open-Back Headphones',
    positiveKeywords: ['open back', 'open-back', 'open back', 'open-back headphones'],
    negativeKeywords: ['closed back', 'closed-back', 'in-ear', 'earbud', 'iem', 'monitor'],
    requiredKeywords: ['headphone', 'headphones'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'closed-back': {
    slug: 'closed-back',
    title: 'Closed-Back Headphones',
    positiveKeywords: ['closed back', 'closed-back', 'closed back headphones', 'studio'],
    negativeKeywords: ['open back', 'open-back', 'in-ear', 'earbud', 'iem'],
    requiredKeywords: ['headphone', 'headphones'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'planar-magnetic': {
    slug: 'planar-magnetic',
    title: 'Planar Magnetic Headphones',
    positiveKeywords: ['planar', 'planar magnetic', 'magnetic planar', 'isodynamic'],
    negativeKeywords: ['dynamic', 'electrostatic', 'balanced armature'],
    requiredKeywords: ['headphone', 'headphones'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 25,
      negative: -50
    }
  },
  'dynamic': {
    slug: 'dynamic',
    title: 'Dynamic Driver Headphones',
    positiveKeywords: ['dynamic', 'dynamic driver', 'moving coil'],
    negativeKeywords: ['planar', 'electrostatic', 'balanced armature'],
    requiredKeywords: ['headphone', 'headphones'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 25,
      negative: -50
    }
  },
  'electrostatic': {
    slug: 'electrostatic',
    title: 'Electrostatic Headphones',
    positiveKeywords: ['electrostatic', 'electrostatic headphones', 'es', 'stats'],
    negativeKeywords: ['dynamic', 'planar', 'balanced armature'],
    requiredKeywords: ['headphone', 'headphones'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 25,
      negative: -50
    }
  },
  'semi-open': {
    slug: 'semi-open',
    title: 'Semi-Open Headphones',
    positiveKeywords: ['semi-open', 'semi open', 'vented', 'akg', 'grado', 'semi-closed'],
    negativeKeywords: ['fully open', 'fully closed', 'sealed', 'isolation'],
    requiredKeywords: ['headphone', 'headphones'],
    brandMatches: ['AKG', 'Grado', 'Philips'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'monitors-iems': {
    slug: 'monitors-iems',
    title: 'Monitors (IEMs)',
    positiveKeywords: ['in-ear', 'in ear', 'earbud', 'earbud', 'iem', 'in-ear monitor', 'earphone'],
    negativeKeywords: ['over-ear', 'open back', 'closed back'],
    requiredKeywords: ['monitor', 'iem', 'in-ear'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'desktop-amps': {
    slug: 'desktop-amps',
    title: 'Desktop Amplifiers',
    positiveKeywords: ['desktop amp', 'desktop amplifier', 'headphone amp', 'amplifier'],
    negativeKeywords: ['portable', 'battery', 'dac'],
    requiredKeywords: ['amp', 'amplifier'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'portable-amps': {
    slug: 'portable-amps',
    title: 'Portable Amplifiers',
    positiveKeywords: ['portable amp', 'portable amplifier', 'battery powered', 'mobile amp'],
    negativeKeywords: ['desktop', 'ac powered', 'mains'],
    requiredKeywords: ['amp', 'amplifier', 'portable'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'bluetooth-dac-amps': {
    slug: 'bluetooth-dac-amps',
    title: 'Bluetooth DAC/Amps',
    positiveKeywords: ['bluetooth amp', 'bluetooth dac', 'btr', 'go blu', 'wireless amp', 'bluetooth receiver'],
    negativeKeywords: ['wired only', 'desktop', 'stationary', 'no bluetooth'],
    requiredKeywords: ['bluetooth'],
    brandMatches: ['iFi', 'FiiO', 'Shanling', 'EarStudio'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'standalone-dacs': {
    slug: 'standalone-dacs',
    title: 'Standalone DACs',
    positiveKeywords: ['dac', 'digital to analog converter', 'digital-analog converter'],
    negativeKeywords: ['amp', 'amplifier', 'speaker'],
    requiredKeywords: ['dac'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'dac-amp-combos': {
    slug: 'dac-amp-combos',
    title: 'DAC/Amp Combos',
    positiveKeywords: ['dac amp', 'dac/amp', 'combo', 'integrated', 'all-in-one'],
    negativeKeywords: ['standalone', 'separate'],
    requiredKeywords: ['dac', 'amp'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'usb-c-dacs': {
    slug: 'usb-c-dacs',
    title: 'USB-C/Dongle DACs',
    positiveKeywords: ['usb-c dac', 'dongle', 'usb dac', 'dragonfly', 'cayin ru', 'mobile dac'],
    negativeKeywords: ['standalone', 'desktop', 'separate unit', 'full-size'],
    requiredKeywords: ['usb', 'dac'],
    brandMatches: ['AudioQuest', 'Cayin', 'iFi', 'Hidizs'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'digital-players-daps': {
    slug: 'digital-players-daps',
    title: 'Digital Players (DAPs)',
    positiveKeywords: ['dap', 'digital audio player', 'mp3 player', 'music player'],
    negativeKeywords: ['streaming', 'computer', 'phone'],
    requiredKeywords: ['player', 'dap'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'network-streamers': {
    slug: 'network-streamers',
    title: 'Network Streamers',
    positiveKeywords: ['streamer', 'network', 'wifi', 'ethernet', 'roon', 'spotify connect'],
    negativeKeywords: ['portable', 'battery', 'dap'],
    requiredKeywords: ['streamer', 'network'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'headphone-cables': {
    slug: 'headphone-cables',
    title: 'Headphone Cables',
    positiveKeywords: ['cable', 'cable', 'wire', 'cord', 'headphone cable'],
    negativeKeywords: ['adapter', 'amp', 'dac'],
    requiredKeywords: ['cable'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'interconnects': {
    slug: 'interconnects',
    title: 'Interconnects',
    positiveKeywords: ['interconnect', 'rca', 'xlr', 'balanced', 'unbalanced'],
    negativeKeywords: ['headphone', 'speaker cable'],
    requiredKeywords: ['interconnect', 'cable'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'adapters': {
    slug: 'adapters',
    title: 'Adapters',
    positiveKeywords: ['adapter', 'adaptor', 'converter', '3.5mm', '6.35mm', 'quarter inch'],
    negativeKeywords: ['cable', 'amp', 'dac'],
    requiredKeywords: ['adapter'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'earpads': {
    slug: 'earpads',
    title: 'Earpads',
    positiveKeywords: ['earpad', 'ear pad', 'ear cushion', 'replacement earpad'],
    negativeKeywords: ['headphone', 'cable', 'amp'],
    requiredKeywords: ['earpad'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'eartips': {
    slug: 'eartips',
    title: 'Eartips',
    positiveKeywords: ['eartip', 'ear tip', 'foam tip', 'silicone tip', 'spinfit', 'comply', 'final e'],
    negativeKeywords: ['earpad', 'headphone', 'cable', 'case'],
    requiredKeywords: ['tip', 'eartip'],
    brandMatches: ['SpinFit', 'Comply', 'Final Audio', 'AZLA', 'Symbio'],
    weightings: {
      name: 40,
      brand: 15,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'care-cleaning': {
    slug: 'care-cleaning',
    title: 'Care & Cleaning',
    positiveKeywords: ['cleaning', 'care', 'maintenance', 'cleaner', 'kit'],
    negativeKeywords: ['headphone', 'cable', 'electronic'],
    requiredKeywords: ['cleaning', 'care'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'headphone-stands': {
    slug: 'headphone-stands',
    title: 'Headphone Stands',
    positiveKeywords: ['stand', 'holder', 'hanger', 'headphone stand'],
    negativeKeywords: ['headphone', 'cable', 'electronic'],
    requiredKeywords: ['stand'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'carrying-cases': {
    slug: 'carrying-cases',
    title: 'Carrying Cases',
    positiveKeywords: ['case', 'carrying case', 'protective case', 'storage case'],
    negativeKeywords: ['headphone', 'cable', 'electronic'],
    requiredKeywords: ['case'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  }
};

export const getSemanticRule = (slug: string): SemanticCategoryRule | null => {
  return SEMANTIC_CATEGORIES[slug] || null;
};

export const getAllSemanticSlugs = (): string[] => {
  return Object.keys(SEMANTIC_CATEGORIES);
};
