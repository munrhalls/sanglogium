import 'server-only';
// Server-only entry: relevance scoring and result building for the search fetchers.
// Never import from client components or Node .mjs scripts.
export { normalizeText, deriveSpacedQuery } from './domain/searchScoring';
export { rankAutocomplete, buildSearchResult } from './domain/searchResults';
