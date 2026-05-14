import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentPage from '@/app/(store)/checkout/payment/page';

const mockPush = vi.fn();

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('./_components/OrderSummary', () => ({
  default: () => <div data-testid="order-summary">Order Summary</div>,
}));

vi.mock('./_components/PaymentForm', () => ({
  default: () => <div data-testid="payment-form">Payment Form</div>,
}));

global.fetch = vi.fn();

describe('PaymentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('redirects to basket when no reservation ID in session storage', async () => {
    // Arrange
    const sessionStorageGetItem = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    // Act
    render(<PaymentPage />);

    // Assert
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/basket');
    });

    sessionStorageGetItem.mockRestore();
  });

  it('shows error state when API fails', async () => {
    // Arrange
    const sessionStorageGetItem = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('res123');
    (global.fetch as any).mockRejectedValue(new Error('API error'));

    // Act
    render(<PaymentPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Payment Error')).toBeVisible();
      expect(screen.getByText('Unable to prepare payment. Please try again.')).toBeVisible();
      expect(screen.getByText('Try Again')).toBeVisible();
      expect(screen.getByText('Go Back')).toBeVisible();
    });

    sessionStorageGetItem.mockRestore();
  });

});
