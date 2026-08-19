import { describe, it, expect, vi, beforeEach } from "vitest";
import { validatePolishAddressWithPna } from "./pna-validator";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const baseInput = {
  street: "Balonowa",
  streetNumber: "9",
  postalCode: "54-129",
  city: "Wrocław",
};

describe("validatePolishAddressWithPna", () => {
  beforeEach(() => {
    vi.stubEnv("PNA_POCZTA_TOKEN", "test-token");
    mockFetch.mockReset();
  });

  it("verifies a matching postal code + city", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        codes: ["54-129"],
        addresses: ["Balonowa Wrocław"],
      }),
    });

    const result = await validatePolishAddressWithPna(baseInput);

    expect(result).toEqual({ valid: true, degraded: false });
    // Endpoint uses the token + the postal code as the query.
    const url = String(mockFetch.mock.calls[0][0]);
    expect(url).toBe("https://pna.poczta-polska.pl/test-token/54-129");
  });

  it("rejects a postal code that does not match the city", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        codes: ["00-001"],
        addresses: ["Warszawa"],
      }),
    });

    const result = await validatePolishAddressWithPna(baseInput);

    expect(result.valid).toBe(false);
    expect(result.degraded).toBe(false);
  });

  it("fails soft (degraded) when PNA is unavailable", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 });

    const result = await validatePolishAddressWithPna(baseInput);

    expect(result.degraded).toBe(true);
  });

  it("fails soft on network error", async () => {
    mockFetch.mockRejectedValue(new Error("ECONNRESET"));

    const result = await validatePolishAddressWithPna(baseInput);

    expect(result.degraded).toBe(true);
  });

  it("fails soft on unexpected response shape", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ foo: 1 }) });

    const result = await validatePolishAddressWithPna(baseInput);

    expect(result.degraded).toBe(true);
  });

  it("is degraded when no token is configured", async () => {
    vi.stubEnv("PNA_POCZTA_TOKEN", "");

    const result = await validatePolishAddressWithPna(baseInput);

    expect(result.degraded).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
