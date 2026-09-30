// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here or from ./server.
// Never re-export server-only or Sanity code here.
// Explicit named re-exports only; never bare export *.
export { CATEGORY_SUGGESTIONS, POPULAR_SEARCHES } from './config/searchSuggestions';
export { splitHighlight } from './domain/highlight';
export { buildSuggestionEntries } from './domain/suggestionEntries';
export type { SuggestionEntry } from './domain/suggestionEntries';
export { detectSearchRedirect } from './domain/detectSearchRedirect';
