import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentForm from '@/app/(store)/checkout/payment/_components/PaymentForm';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    confirmPayment: vi.fn(),
  })),
  useStripe: vi.fn(() => ({
    confirmPayment: vi.fn(),
  })),
  useElements: vi.fn(() => ({})),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: vi.fn(() => ({
    confirmPayment: vi.fn(),
  })),
  useElements: vi.fn(() => ({})),
}));

describe('PaymentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders payment element and submit button with amount', () => {
    // Arrange
    const clientSecret = 'pi_123_secret_xxx';
    const totalAmount = 1999;
    const currency = 'usd';

    // Act
    render(<PaymentForm clientSecret={clientSecret} totalAmount={totalAmount} currency={currency} />);

    // Assert
    expect(screen.getByTestId('payment-element')).toBeVisible();
    expect(screen.getByText('Pay $19.99')).toBeVisible();
  });

  it('shows null when no client secret provided', () => {
    // Arrange
    const clientSecret = '';
    const totalAmount = 1999;
    const currency = 'usd';

    // Act
    const { container } = render(<PaymentForm clientSecret={clientSecret} totalAmount={totalAmount} currency={currency} />);

    // Assert
    expect(container.firstChild).toBeNull();
  });
});
