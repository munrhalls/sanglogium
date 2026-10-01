// GUS TERYT ws1 client — free, authoritative Polish address verification.
//
// SOAP 1.1 + WS-Security UsernameToken via fetch (no SDK, no key, 0 cost).
//
// Endpoints (verified against the live service, 2026-08):
//   test: https://uslugaterytws1test.stat.gov.pl/Terytws1.svc  (public creds)
//   prod: https://uslugaterytws1.stat.gov.pl/Terytws1.svc      (free GUS account)
// Env overrides: TERYT_ENDPOINT, TERYT_USER, TERYT_PASS.
//
// Flow (field names verified against the WSDL):
//   WyszukajMiejscowosc(nazwaMiejscowosci)          -> Symbol (SIMC)
//   WyszukajUlice(nazwaulicy, cecha, nazwamiejscowosci) -> IdentyfikatorUlicy
//   WeryfikujAdresDlaUlic(symbolMsc, SymUl)          -> ZweryfikowanyAdres
//
// NOTE: never call verify with an empty street identifier — the service then
// returns an arbitrary street for the locality (false positive). Guarded below.
// Always fails soft (`degraded: true`) so checkout never dead-ends on GUS.

export interface TerytVerifyInput {
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
}

export interface TerytVerifyResult {
  valid: boolean;
  degraded: boolean;
  reason?: string;
  streetName?: string;
}

const DEFAULT_ENDPOINT = "https://uslugaterytws1test.stat.gov.pl/Terytws1.svc";
const DEFAULT_USER = "TestPubliczny";
const DEFAULT_PASS = "1234abcd";

const NS_SOAP = "http://schemas.xmlsoap.org/soap/envelope/";
const NS_TEMPURI = "http://tempuri.org/";
const NS_WSA = "http://www.w3.org/2005/08/addressing";
const NS_WSSE =
  "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd";
const NS_WSU =
  "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd";

const xmlEscape = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function envelope(action: string, body: string, user: string, pass: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="${NS_SOAP}" xmlns:ns1="${NS_TEMPURI}">
  <soapenv:Header xmlns:wsa="${NS_WSA}">
    <wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="${NS_WSSE}" xmlns:wsu="${NS_WSU}">
      <wsse:UsernameToken wsu:Id="T1">
        <wsse:Username>${xmlEscape(user)}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${xmlEscape(pass)}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
    <wsa:Action>${action}</wsa:Action>
  </soapenv:Header>
  <soapenv:Body>${body}</soapenv:Body>
</soapenv:Envelope>`;
}

async function call(action: string, body: string): Promise<string> {
  const endpoint = process.env.TERYT_ENDPOINT || DEFAULT_ENDPOINT;
  const user = process.env.TERYT_USER || DEFAULT_USER;
  const pass = process.env.TERYT_PASS || DEFAULT_PASS;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8" },
    body: envelope(action, body, user, pass),
  });

  if (!res.ok) {
    throw new Error(`TERYT HTTP ${res.status}`);
  }
  return res.text();
}

/** Extract the text of an exact element (namespace-agnostic, whole-name match). */
const field = (xml: string, name: string): string | undefined =>
  new RegExp(`<[^>]*\\b${name}>([^<]*)</[^>]*\\b${name}>`).exec(xml)?.[1];

/** Diacritics-insensitive, case-insensitive token for matching PL names. */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Known Polish street-type prefixes (spelled out and abbreviated). Stripped
// from both the user's input and TERYT's canonical name before the name
// cross-check, so a spelled-out prefix on input (e.g. "Plac") never
// mismatches TERYT's abbreviated form (e.g. "pl.") and causes a
// false rejection of a genuinely real address.
const STREET_PREFIXES = [
  "ulica", "ul",
  "aleja", "al",
  "plac", "pl",
  "osiedle", "os",
  "rondo",
  "bulwar", "bulw",
  "wybrzeze", "wyb",
  "skwer",
];

const stripStreetPrefix = (s: string): string => {
  const tokens = normalize(s).split(" ").filter(Boolean);
  if (tokens.length > 1 && STREET_PREFIXES.includes(tokens[0])) {
    return tokens.slice(1).join(" ");
  }
  return tokens.join(" ");
};

export async function verifyPolishAddress(
  input: TerytVerifyInput,
): Promise<TerytVerifyResult> {
  const city = input.city.trim();
  const street = input.street.trim();
  const postal = input.postalCode.trim();

  if (!city || !street) {
    return { valid: false, degraded: false, reason: "city/street missing" };
  }
  if (postal && !/^\d{2}-\d{3}$/.test(postal)) {
    return { valid: false, degraded: false, reason: "postal code format" };
  }

  try {
    // 1) Resolve the locality to its TERYT symbol (SIMC).
    const cityResp = await call(
      "http://tempuri.org/ITerytWs1/WyszukajMiejscowosc",
      `<ns1:WyszukajMiejscowosc><ns1:nazwaMiejscowosci>${xmlEscape(city)}</ns1:nazwaMiejscowosci></ns1:WyszukajMiejscowosc>`,
    );
    const simc = field(cityResp, "Symbol");
    if (!simc) {
      return { valid: false, degraded: false, reason: "locality not found in TERYT" };
    }

    // 2) Resolve the street in that locality to its ULIC identifier.
    const streetResp = await call(
      "http://tempuri.org/ITerytWs1/WyszukajUlice",
      `<ns1:WyszukajUlice><ns1:nazwaulicy>${xmlEscape(street)}</ns1:nazwaulicy><ns1:cecha>ul.</ns1:cecha><ns1:nazwamiejscowosci>${xmlEscape(city)}</ns1:nazwamiejscowosci></ns1:WyszukajUlice>`,
    );
    let idul = field(streetResp, "IdentyfikatorUlicy");

    // Retry without the street cecha for al./pl./rondo/... streets.
    if (!idul) {
      const retry = await call(
        "http://tempuri.org/ITerytWs1/WyszukajUlice",
        `<ns1:WyszukajUlice><ns1:nazwaulicy>${xmlEscape(street)}</ns1:nazwaulicy><ns1:nazwamiejscowosci>${xmlEscape(city)}</ns1:nazwamiejscowosci></ns1:WyszukajUlice>`,
      );
      idul = field(retry, "IdentyfikatorUlicy");
    }
    if (!idul) {
      return { valid: false, degraded: false, reason: "street not found in locality" };
    }

    // 3) Street-level verification against the official registry. An empty
    //    street identifier would return an arbitrary street (false positive),
    //    so a resolved idul is mandatory (guarded above).
    const verifyResp = await call(
      "http://tempuri.org/ITerytWs1/WeryfikujAdresDlaUlic",
      `<ns1:WeryfikujAdresDlaUlic><ns1:symbolMsc>${xmlEscape(simc)}</ns1:symbolMsc><ns1:SymUl>${xmlEscape(idul)}</ns1:SymUl></ns1:WeryfikujAdresDlaUlic>`,
    );
    const streetName = field(verifyResp, "NazwaUlicyWPelnymBrzmieniu");
    if (!streetName) {
      return { valid: false, degraded: false, reason: "street/address not verified" };
    }

    // Cross-check the returned official name against the entered street to
    // block any symbol-mismatch false positive. Street-type prefixes (ul.,
    // al., pl., ...) are stripped from both sides first so a spelled-out
    // prefix on input (e.g. "Plac") never mismatches TERYT's abbreviated
    // form (e.g. "pl.") on output.
    const inputCore = stripStreetPrefix(street);
    const officialCore = stripStreetPrefix(streetName);
    const tokens = inputCore.split(" ").filter(Boolean);
    if (tokens.length > 0 && !tokens.every((t) => officialCore.includes(t))) {
      return { valid: false, degraded: false, reason: `street name mismatch: ${streetName}` };
    }

    return { valid: true, degraded: false, streetName };
  } catch (err) {
    console.warn("[TERYT] Service unavailable — failing soft.", err);
    return {
      valid: false,
      degraded: true,
      reason: err instanceof Error ? err.message : "network error",
    };
  }
}

