// Deduplicate shipping label when carrier and method share words
export function dedupeShippingLabel(carrier?: string, method?: string): string {
  if (!carrier && !method) return "Shipping";
  if (!method) return carrier || "Shipping";
  if (!carrier) return method;
  // If method already contains all words from carrier (case-insensitive), just use method
  const carrierWords = carrier.toLowerCase().split(/\s+/);
  const methodLower = method.toLowerCase();
  const carrierContained = carrierWords.every(w => methodLower.includes(w));
  if (carrierContained) return method;
  // If carrier and method share first word (e.g. "DPD Polska" + "DPD Classic")
  const firstCarrier = carrierWords[0];
  const firstMethod = method.toLowerCase().split(/\s+/)[0];
  if (firstCarrier === firstMethod) return method;
  return `${carrier} — ${method}`;
}
