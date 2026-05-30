import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckoutSummary from '@/app/checkout/payment/_components/CheckoutSummary';

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

  it('renders human-readable shipping label when carrier and method are provided', () => {
    const items = [
      { productId: 'prod1', name: 'Product A', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];

    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingCode="fedex_fedex"
        shippingCarrier="FedEx"
        shippingMethodName="Standard"
        subtotal={1999}
        grandTotal={3898}
      />
    );

    expect(screen.getByText('FedEx — Standard')).toBeInTheDocument();
    expect(screen.queryByText('Shipping (fedex_fedex)')).not.toBeInTheDocument();
  });

  it('renders carrier-only label when method name is missing', () => {
    const items = [
      { productId: 'prod1', name: 'Product A', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ];

    render(
      <CheckoutSummary
        items={items}
        shippingCost={1899}
        shippingCode="dpd"
        shippingCarrier="DPD"
        subtotal={1999}
        grandTotal={3898}
      />
    );

    expect(screen.getByText('DPD')).toBeInTheDocument();
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
        shippingCarrier="DPD"
        shippingMethodName="Classic"
        shippingEstimatedDays={3}
        subtotal={1999}
        grandTotal={3898}
      />
    );

    expect(screen.getByText('3 business days')).toBeInTheDocument();
  });
});
