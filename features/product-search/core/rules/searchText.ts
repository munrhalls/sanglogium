export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function deriveSpacedQuery(value: string): string {
  // Produce a spacing-normalised variant of the raw query so GROQ match
  // can hit both concatenated models ("hd800s") and dashed variants
  // ("HD-800-S"). "SennheiserHD800S" becomes "Sennheiser HD 800S".
  return value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z]+)(\d+)/g, '$1 $2')
    .replace(/(\d+)\s+([a-zA-Z]+)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}
