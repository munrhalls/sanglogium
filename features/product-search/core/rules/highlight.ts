interface TextPart {
  text: string;
  match: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Splits `text` into alternating plain / matching parts for every whitespace
 * separated query token of 2+ characters (case-insensitive, literal match).
 * Concatenating the returned parts always reproduces `text`.
 */
export function splitHighlight(text: string, query: string): TextPart[] {
  const tokens = Array.from(
    new Set(
      query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length >= 2)
    )
  );

  if (!text || tokens.length === 0) return [{ text, match: false }];

  // Longest first so "hd800" wins over "hd" when both are tokens.
  tokens.sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi');

  // With one capture group, split() puts the matches at the odd indices.
  return text
    .split(pattern)
    .map((part, index) => ({ text: part, match: index % 2 === 1 }))
    .filter((part) => part.text !== '');
}
