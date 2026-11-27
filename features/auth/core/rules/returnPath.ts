// A return address is followed only if it stays on this shop. It is read with the URL rules browsers use,
// so "//other.site", "/\\other.site" and hidden tabs or line breaks all count as another site.
const HERE = "https://this-shop.invalid";

export function safeReturnPath(value: string | null, fallback = "/account"): string {
  if (!value || !value.startsWith("/")) return fallback;
  try {
    const url = new URL(value, HERE);
    return url.origin === HERE ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
