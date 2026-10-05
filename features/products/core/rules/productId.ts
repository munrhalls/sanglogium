// Sanity document IDs are alphanumeric plus `_.-` (see Sanity's own ID rules).
// Rejecting anything else before it reaches a Sanity patch path expression
// closes off path injection via a tampered client-supplied productId.
const SANITY_DOC_ID_RE = /^[a-zA-Z0-9_.-]+$/;

export function isValidProductId(id: string): boolean {
  return SANITY_DOC_ID_RE.test(id);
}
