import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderSummary from '@/app/(store)/checkout/payment/_components/OrderSummary';

// Mock fetch
global.fetch = vi.fn();

describe('OrderSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays items quantities and total correctly', async () => {
    // Arrange
    const mockReservation = {
      basketReservation: [
        { _id: 'prod1', quantity: 2, verifiedPrice: 1999 },
        { _id: 'prod2', quantity: 1, verifiedPrice: 4999 },
      ],
      shippingChoice: { provider: 'UPS', serviceLevel: 'ground', amount: 500, currency: 'usd' },
    };

    const mockProducts = {
      data: [
        { _id: 'prod1', name: 'Product 1' },
        { _id: 'prod2', name: 'Product 2' },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservation,
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    // Act
    render(<OrderSummary basketReservationId="res123" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Product 1 × 2')).toBeVisible();
      expect(screen.getByText('Product 2 × 1')).toBeVisible();
      expect(screen.getByText('$39.98')).toBeVisible(); // 2 × $19.99
      expect(screen.getByText('$49.99')).toBeVisible(); // 1 × $49.99
      expect(screen.getByText('Shipping (UPS)')).toBeVisible();
      expect(screen.getByText('$5.00')).toBeVisible();
      expect(screen.getByText('Total')).toBeVisible();
      expect(screen.getByText('$94.97')).toBeVisible(); // $39.98 + $49.99 + $5.00
    });
  });

  it('shows error message when API fails', async () => {
    // Arrange
    (global.fetch as any).mockRejectedValue(new Error('API error'));

    // Act
    render(<OrderSummary basketReservationId="res123" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Unable to load order summary')).toBeVisible();
    });
  });

  it('shows skeleton during loading', () => {
    // Arrange & Act
    render(<OrderSummary basketReservationId="res123" />);

    // Assert
    expect(screen.queryByText('Order Summary')).not.toBeInTheDocument();
  });
});
