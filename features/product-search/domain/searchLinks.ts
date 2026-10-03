export function searchHref(term: string): string {
  return `/search?q=${encodeURIComponent(term.trim())}`;
}

export function productHref(slug: string): string {
  return `/product/${slug}`;
}
