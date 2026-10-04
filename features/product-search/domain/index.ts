// Pure surface: values that lower layers (the data layer, another feature's domain) may import. Explicit named re-exports only; never bare export *.
export { normalizeText, deriveSpacedQuery } from './searchScoring'
export { rankAutocomplete, buildSearchResult } from './searchResults'
