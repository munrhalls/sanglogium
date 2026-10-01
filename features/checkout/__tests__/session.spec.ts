// # Execution Specs: Checkout Session — Fail Closed
//
// The checkout_session cookie carries values the payment route trusts (e.g. shippingCost),
// so it must never be sealed with a default password. Without SESSION_SECRET, checkout stops.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({ getIronSession: vi.fn() }));

vi.mock("iron-session", () => ({ getIronSession: mocks.getIronSession }));
vi.mock("next/headers", () => ({ cookies: vi.fn().mockResolvedValue({}) }));

import { getCheckoutSession } from "../adapters/session";

describe("Checkout Session", () => {
  beforeEach(() => {
    mocks.getIronSession.mockReset().mockResolvedValue({});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("when SESSION_SECRET is not set", () => {
    it("throws instead of falling back to a default password", async () => {
      vi.stubEnv("SESSION_SECRET", "");

      await expect(getCheckoutSession()).rejects.toThrow("SESSION_SECRET is not set");
      expect(mocks.getIronSession).not.toHaveBeenCalled();
    });
  });

  describe("when SESSION_SECRET is set", () => {
    it("seals the session cookie with it", async () => {
      const secret = "x".repeat(32);
      vi.stubEnv("SESSION_SECRET", secret);

      await getCheckoutSession();

      expect(mocks.getIronSession).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ password: secret, cookieName: "checkout_session" })
      );
    });
  });
});
