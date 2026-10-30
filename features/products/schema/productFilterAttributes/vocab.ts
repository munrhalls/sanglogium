// Studio authoring vocabulary: the closed option lists an editor may pick
// from on a product's filterAttributes fields. This list is upstream of the
// data — a value can only reach a product (and therefore a filter) through
// here. Runtime filtering never reads it: controls, options and the URL
// vocabulary are all derived from the stored product data itself.
// Keyed by the filter param/facet id each schema field serves.

export const FILTER_VOCAB: Record<string, string[]> = {
  wearingStyle: ['over-ear', 'on-ear', 'in-ear'],
  acousticDesign: ['open-back', 'closed-back', 'semi-open'],
  connectivity: ['wired', 'wireless', 'true-wireless', 'hybrid'],
  soundSignature: ['Neutral', 'Warm', 'Bright/Analytical', 'Dark', 'V-Shaped', 'Basshead', 'Mid-Forward', 'Harman-target-like'],
  anc: ['anc', 'passive', 'none'],
  driverType: ['dynamic', 'planar-magnetic', 'electrostatic', 'balanced-armature', 'hybrid', 'amt', 'bone-conduction', 'electret'],
  deviceType: ['headphone-amplifier', 'digital-audio-player', 'dac', 'network-streamer', 'preamplifier', 'integrated-amplifier', 'power-amplifier', 'cd-player-transport'],
  deviceConnectivity: ['wired', 'bluetooth', 'wifi-networked', 'wired-wireless'],
  formFactor: ['desktop', 'portable', 'dongle'],
  amplification: ['solid-state', 'tube', 'hybrid', 'class-d'],
  inputs: ['usb', 'optical', 'coaxial', 'rca', 'bluetooth', 'xlr-balanced', 'phono-mm-mc', 'hdmi-earc', 'ethernet-lan', 'i2s-iis', 'aes-ebu'],
  dsdSupport: ['none', 'dsd64', 'dsd128', 'dsd256-plus'],
  dacChipsetFamily: ['ess-sabre', 'akm', 'cirrus-logic', 'r2r-ladder'],
  streamingPlatformSupport: ['airplay2', 'chromecast', 'spotify-connect', 'tidal-connect', 'roon-ready', 'dlna'],
  condition: ['new', 'open-box', 'refurbished'],
  accessoryType: ['cables-interconnects', 'replacement-parts', 'cases-storage-transport', 'adapters-converters', 'cleaning-maintenance', 'stands-isolation'],
  compatibleProductType: ['headphone', 'speaker', 'amplifier-source', 'universal-any'],
  cableFunction: ['headphone-cable', 'interconnect-rca-xlr', 'digital-usb-coaxial-optical-aes-ebu-ethernet'],
  connectorTermination: ['rca', 'xlr', '3.5mm', '2.5mm', '4.4mm', '6.35mm', '4-pin-mini-xlr', 'mini-to-rca'],
  conductorMaterial: ['copper-ofc', 'silver', 'silver-plated-copper'],
  partType: ['ear-pads-cushions', 'ear-tips'],
};

/** The closed option list for the field whose filter param is `param`.
 *  Throws when no list is declared for that param. */
export function vocabFor(param: string): string[] {
  const vocab = FILTER_VOCAB[param];
  if (!vocab) throw new Error(`No Studio option list for filter param "${param}"`);
  return vocab;
}
