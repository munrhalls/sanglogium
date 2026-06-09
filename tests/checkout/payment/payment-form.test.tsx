import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
// eslint-disable-next-line no-restricted-imports -- Types needed for TypeScript
import '@testing-library/jest-dom';
import PaymentForm from '@/app/checkout/payment/PaymentForm.client';

const mockFetch = vi.fn();
(globalThis as unknown as Record<string, unknown>).fetch = mockFetch as unknown as typeof fetch;

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element" />,
  ExpressCheckoutElement: () => <div data-testid="express-checkout" />,
  PaymentMethodMessagingElement: () => <div data-testid="messaging-element" />,
  useStripe: vi.fn(() => ({ confirmPayment: vi.fn() })),
  useElements: vi.fn(() => ({ submit: vi.fn(() => Promise.resolve({})) })),
}));

describe('PaymentForm', () => {
  const defaultProps = {
    grandTotal: 12345,
    metadata: { email: 'test@example.com' } as Record<string, string>,
    address: {
      regionCode: 'PL',
      postalCode: '00-001',
      street: 'Testowa',
      streetNumber: '1',
      city: 'Warszawa',
    },
    traceId: 'test-trace-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('shows skeleton while loading clientSecret', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<PaymentForm {...defaultProps} />);
    expect(screen.getByText('Preparing secure payment…')).toBeInTheDocument();
  });

  it('renders Stripe Elements after successful fetch', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clientSecret: 'pi_test_secret' }),
    });
    render(<PaymentForm {...defaultProps} />);
    await waitFor(() => expect(screen.getByTestId('stripe-elements')).toBeInTheDocument());
    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
    expect(screen.getByTestId('express-checkout')).toBeInTheDocument();
  });

  it('shows error state when API returns error', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: 'Stripe API error' }),
    });
    render(<PaymentForm {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('Stripe API error')).toBeInTheDocument());
  });

  it('posts to /api/checkout/payment-intent-session with grandTotal and metadata', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clientSecret: 'pi_test_secret' }),
    });
    render(<PaymentForm {...defaultProps} />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/checkout/payment-intent-session',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grandTotal: 12345, metadata: { email: 'test@example.com' } }),
      })
    );
  });

  it('shows Klarna messaging when grandTotal >= 5000', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clientSecret: 'pi_test_secret' }),
    });
    render(<PaymentForm {...defaultProps} grandTotal={5000} />);
    await waitFor(() => expect(screen.getByTestId('messaging-element')).toBeInTheDocument());
  });

  it('retries on transient failure and succeeds on second attempt (H-04)', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ clientSecret: 'pi_retry_secret' }),
      });
    render(<PaymentForm {...defaultProps} />);
    await waitFor(() => expect(screen.getByTestId('stripe-elements')).toBeInTheDocument());
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('shows error after all retry attempts exhausted (H-04)', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<PaymentForm {...defaultProps} />);
    // Retry delays: 500ms + 1000ms + 2000ms = 3500ms minimum
    await waitFor(() => expect(screen.getByText('Failed to initialize payment.')).toBeInTheDocument(), { timeout: 5000 });
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
