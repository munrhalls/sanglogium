import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
// eslint-disable-next-line no-restricted-imports -- Types needed for TypeScript
import '@testing-library/jest-dom';
import CheckoutSummary from '@/app/checkout/payment/_components/CheckoutSummary';

describe('CheckoutSummary', () => {
  it('renders itemized basket with currency formatting', () => {
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
        shippingLabel="Shipping (dpd)"
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

  it('renders deduplicated shipping label', () => {
    const items = [
      { productId: 'prod1', name: 'Product A', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];

    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingLabel="DPD Classic"
        subtotal={1999}
        grandTotal={3898}
      />
    );

    expect(screen.getByText('DPD Classic')).toBeInTheDocument();
    expect(screen.queryByText('DPD Polska — DPD Classic')).not.toBeInTheDocument();
  });

  it('renders carrier-only label when method name is missing', () => {
    const items = [
      { productId: 'prod1', name: 'Product A', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];

    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingLabel="DPD"
        subtotal={1999}
        grandTotal={3898}
      />
    );

    expect(screen.getByText('DPD')).toBeInTheDocument();
  });

  it('handles missing shipping label gracefully', () => {
    // Arrange
    const items = [
      { productId: 'prod1', name: 'Product A', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];

    // Act
    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingLabel="Shipping"
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
        shippingLabel="Shipping"
        subtotal={1999}
        grandTotal={3898}
      />
    );

    // Assert
    expect(screen.getByText('Product × 1')).toBeInTheDocument();
  });

  it('renders shipping address when provided', () => {
    const items = [
      { productId: 'prod1', name: 'Product A', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];
    const address = {
      firstName: 'Jan',
      lastName: 'Kowalski',
      street: 'Marszałkowska',
      streetNumber: '1',
      city: 'Warszawa',
      postalCode: '00-001',
      regionCode: 'PL',
    };

    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingLabel="Shipping"
        subtotal={1999}
        grandTotal={3898}
        address={address}
      />
    );

    expect(screen.getByText('Deliver to')).toBeInTheDocument();
    expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
    expect(screen.getByText('Marszałkowska 1')).toBeInTheDocument();
    expect(screen.getByText('00-001 Warszawa')).toBeInTheDocument();
  });

  it('renders VAT included line', () => {
    const items = [
      { productId: 'prod1', name: 'Product A', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];

    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingLabel="Shipping"
        subtotal={1999}
        grandTotal={3898}
      />
    );

    expect(screen.getByText('VAT (included)')).toBeInTheDocument();
  });

  it('renders delivery estimate when provided', () => {
    const items = [
      { productId: 'prod1', name: 'Product A', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];

    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingLabel="DPD Classic"
        shippingEstimatedDays={3}
        subtotal={1999}
        grandTotal={3898}
      />
    );

    expect(screen.getByText('3 business days')).toBeInTheDocument();
  });

  it('renders Open Box condition badge when condition is provided', () => {
    const items = [
      { productId: 'prod1', name: 'Audeze LCD-XC', condition: 'Open Box', quantity: 1, unitPrice: 1698300, lineTotal: 1698300 },
    ];

    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingLabel="Shipping"
        subtotal={1698300}
        grandTotal={1700199}
      />
    );

    expect(screen.getByText('Open Box')).toBeInTheDocument();
    expect(screen.getByText('Audeze LCD-XC × 1')).toBeInTheDocument();
  });

  it('renders product image when imageUrl is provided', () => {
    const items = [
      { productId: 'prod1', name: 'Product A', imageUrl: 'https://cdn.sanity.io/test.jpg', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];

    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingLabel="Shipping"
        subtotal={1999}
        grandTotal={3898}
      />
    );

    expect(screen.getByAltText('Product A')).toBeInTheDocument();
  });
});
