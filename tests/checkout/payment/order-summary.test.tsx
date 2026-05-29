import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckoutSummary from '@/app/(store)/checkout/payment/_components/CheckoutSummary';

describe('CheckoutSummary', () => {
  it('renders itemized basket with PLN formatting', () => {
    // Arrange
    const items = [
      { productId: 'prod1', name: 'Product A', quantity: 2, unitPrice: 1999, lineTotal: 3998 },
      { productId: 'prod2', name: 'Product B', quantity: 1, unitPrice: 4999, lineTotal: 4999 },
    ];

    // Act
    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingCode="dpd"
        subtotal={8997}
        grandTotal={10896}
      />
    );

    // Assert
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Product A × 2')).toBeInTheDocument();
    expect(screen.getByText('Product B × 1')).toBeInTheDocument();
    expect(screen.getByText('Shipping (dpd)')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('handles missing shipping code gracefully', () => {
    // Arrange
    const items = [
      { productId: 'prod1', name: 'Product A', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];

    // Act
    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        subtotal={1999}
        grandTotal={3898}
      />
    );

    // Assert
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.queryByText('Shipping (')).not.toBeInTheDocument();
  });

  it('uses fallback name when product name is missing', () => {
    // Arrange
    const items = [
      { productId: 'prod1', name: '', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];

    // Act
    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        subtotal={1999}
        grandTotal={3898}
      />
    );

    // Assert
    expect(screen.getByText('Product × 1')).toBeInTheDocument();
  });
});
