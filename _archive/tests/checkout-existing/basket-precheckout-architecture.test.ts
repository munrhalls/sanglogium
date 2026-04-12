import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useBasketStore } from '@/store/store';
import CheckoutButton from '@/app/(store)/basket/CheckoutButton';
import { usePreCheckout } from '@/app/components/features/basket/checkout/usePreCheckout';

// Mock the usePreCheckout hook to verify event dispatching
jest.mock('@/app/components/features/basket/checkout/usePreCheckout');

describe('Basket Pre-Checkout Architecture', () => {
  beforeEach(() => {
    // Reset basket store
    useBasketStore.setState({
      basket: [
        { _id: 'test-product-1', quantity: 1, name: 'Test Product', price: 100 }
      ]
    });
  });

  it('should dispatch START_VALIDATION event when checkout button is clicked', async () => {
    const mockCheckout = jest.fn();
    (usePreCheckout as jest.Mock).mockReturnValue({
      state: 'IDLE',
      checkout: mockCheckout
    });

    render(<CheckoutButton />);
    
    const checkoutButton = screen.getByTestId('checkout-button');
    fireEvent.click(checkoutButton);

    // Verify the checkout function was called (event dispatched)
    expect(mockCheckout).toHaveBeenCalledTimes(1);
  });

  it('should show processing state when state is PROCESSING', () => {
    (usePreCheckout as jest.Mock).mockReturnValue({
      state: 'PROCESSING',
      checkout: jest.fn()
    });

    render(<CheckoutButton />);
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('should show error state when state is ERROR_NETWORK', () => {
    (usePreCheckout as jest.Mock).mockReturnValue({
      state: 'ERROR_NETWORK',
      checkout: jest.fn()
    });

    render(<CheckoutButton />);
    
    expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
  });

  it('should show error state when state is ERROR_VALIDATION', () => {
    (usePreCheckout as jest.Mock).mockReturnValue({
      state: 'ERROR_VALIDATION',
      checkout: jest.fn()
    });

    render(<CheckoutButton />);
    
    expect(screen.getByText('Validation failed. Please review your basket.')).toBeInTheDocument();
  });

  it('should disable button when checkout is not enabled', () => {
    useBasketStore.setState({
      basket: [] // Empty basket makes checkout disabled
    });

    (usePreCheckout as jest.Mock).mockReturnValue({
      state: 'IDLE',
      checkout: jest.fn()
    });

    render(<CheckoutButton />);
    
    const disabledButton = screen.getByText('Checkout');
    expect(disabledButton).toBeDisabled();
  });
});
