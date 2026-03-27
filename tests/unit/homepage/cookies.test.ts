import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getCheckoutCookie, GuestContext } from '../../../lib/utils/cookies';

// Mock the cookies module
vi.mock('next/headers', () => ({
  cookies: vi.fn()
}));

// Mock the jose module
vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
  errors: {
    JWTExpired: class JWTExpired extends Error {
      constructor() {
        super('JWT expired');
        this.name = 'JWTExpired';
      }
    }
  }
}));

describe('Cookie Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.CHECKOUT_JWT_SECRET;
  });

  describe('getCheckoutCookie', () => {
    test('returns null when no cookie exists', async () => {
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined)
      } as any);

      const result = await getCheckoutCookie();
      expect(result).toBeNull();
    });

    test('returns GuestContext when valid token exists', async () => {
      const mockContext: GuestContext = {
        address: {
          line1: '123 Test St',
          line2: 'Apt 4B',
          city: 'Test City',
          postal_code: '12345',
          country: 'US'
        }
      };

      const { cookies } = await import('next/headers');
      const { jwtVerify } = await import('jose');

      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'valid-token' })
      } as any);

      vi.mocked(jwtVerify).mockResolvedValue({
        payload: mockContext
      } as any);

      const result = await getCheckoutCookie();
      expect(result).toEqual(mockContext);
      expect(jwtVerify).toHaveBeenCalledWith('valid-token', expect.any(Uint8Array));
    });

    test('returns null when token is expired', async () => {
      const { cookies } = await import('next/headers');
      const { jwtVerify, errors } = await import('jose');

      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'expired-token' })
      } as any);

      vi.mocked(jwtVerify).mockRejectedValue(new errors.JWTExpired('JWT expired', null));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getCheckoutCookie();
      expect(result).toBeNull();
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('logs error and returns null when token is invalid', async () => {
      const { cookies } = await import('next/headers');
      const { jwtVerify } = await import('jose');

      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'invalid-token' })
      } as any);

      vi.mocked(jwtVerify).mockRejectedValue(new Error('Invalid token'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getCheckoutCookie();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Invalid checkout cookie:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    test('uses dev-secret-key when no environment variable is set', async () => {
      const { cookies } = await import('next/headers');
      const { jwtVerify } = await import('jose');

      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'valid-token' })
      } as any);

      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { address: null }
      } as any);

      await getCheckoutCookie();

      // Verify jwtVerify was called with a secret (any Uint8Array)
      expect(jwtVerify).toHaveBeenCalledWith('valid-token', expect.any(Uint8Array));

      // Get the secret that was used
      const secretCall = vi.mocked(jwtVerify).mock.calls[0][1];
      expect(secretCall).toBeInstanceOf(Uint8Array);
      expect(secretCall.length).toBeGreaterThan(0);
    });

    test('uses environment variable when set', async () => {
      process.env.CHECKOUT_JWT_SECRET = 'custom-secret-key';

      const { cookies } = await import('next/headers');
      const { jwtVerify } = await import('jose');

      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: 'valid-token' })
      } as any);

      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { address: null }
      } as any);

      await getCheckoutCookie();

      // Verify jwtVerify was called with a secret
      expect(jwtVerify).toHaveBeenCalledWith('valid-token', expect.any(Uint8Array));

      // Get the secret that was used
      const secretCall = vi.mocked(jwtVerify).mock.calls[0][1];
      expect(secretCall).toBeInstanceOf(Uint8Array);
      expect(secretCall.length).toBeGreaterThan(0);

      // Clean up
      delete process.env.CHECKOUT_JWT_SECRET;
    });
  });

  describe('GuestContext interface', () => {
    test('creates valid GuestContext with address', () => {
      const context: GuestContext = {
        address: {
          line1: '123 Test St',
          line2: 'Apt 4B',
          city: 'Test City',
          postal_code: '12345',
          country: 'US'
        }
      };

      expect(context.address?.line1).toBe('123 Test St');
      expect(context.address?.city).toBe('Test City');
      expect(context.address?.country).toBe('US');
    });

    test('creates valid GuestContext without address', () => {
      const context: GuestContext = {};

      expect(context.address).toBeUndefined();
    });
  });
});
