import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { Component, createRef, type ReactNode } from 'react';
import AddressForm from './AddressForm';
import { saveAddress } from '@/app/actions/checkout';

class TestErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return null;
    }
    return this.props.children;
  }
}

vi.mock('@/app/actions/checkout', () => ({
  saveAddress: vi.fn(),
}));

vi.mock('../_components/CheckoutStepper', () => ({
  default: ({ currentStep }: { currentStep: number }) => (
    <nav data-testid="stepper">Step {currentStep}</nav>
  ),
}));

const mockFetch = vi.fn();
(globalThis as unknown as Record<string, unknown>).fetch = mockFetch as unknown as typeof fetch;

describe('AddressForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  const fillAndSubmit = async (
    user: ReturnType<typeof userEvent.setup>,
    ui: ReactNode = <AddressForm traceId="test-trace" />
  ) => {
    render(ui);

    const getInput = (name: string) => document.querySelector(`[name="${name}"]`);

    await user.type(getInput('firstName') as HTMLElement, 'Jan');
    await user.type(getInput('lastName') as HTMLElement, 'Kowalski');
    await user.type(getInput('phone') as HTMLElement, '+48 123 456 789');
    await user.selectOptions(getInput('regionCode') as HTMLElement, 'PL');
    await user.type(getInput('city') as HTMLElement, 'Wrocław');
    await user.type(getInput('street') as HTMLElement, 'Balonowa');
    await user.type(getInput('streetNumber') as HTMLElement, '9');
    await user.type(getInput('postalCode') as HTMLElement, '54-129');

    await user.click(screen.getByRole('button', { name: 'Continue to Shipping' }));
  };

  it('shows the server validation message when address is FIX', async () => {
    const user = userEvent.setup();
    const serverMessage = 'Apartment number is required.';
    vi.mocked(saveAddress).mockResolvedValue({
      status: 'FIX',
      errors: { message: serverMessage },
    });

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByText(serverMessage)).toBeInTheDocument();
    });
    expect(saveAddress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Continue to Shipping' })).toBeEnabled();
  });

  it('shows fallback message when FIX response has no message', async () => {
    const user = userEvent.setup();
    vi.mocked(saveAddress).mockResolvedValue({
      status: 'FIX',
    });

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(
        screen.getByText('Address could not be verified. Please check your details and try again.')
      ).toBeInTheDocument();
    });
  });

  it('displays a generic error when saveAddress throws a non-redirect error', async () => {
    const user = userEvent.setup();
    vi.mocked(saveAddress).mockRejectedValue(new Error('Network error'));

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Continue to Shipping' })).toBeEnabled();
  });

  it('rethrows NEXT_REDIRECT errors so the framework can navigate', async () => {
    const user = userEvent.setup();
    const errorBoundaryRef = createRef<TestErrorBoundary>();
    const redirectError = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;push;/checkout/shipping;307;',
    });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(saveAddress).mockRejectedValue(redirectError);

    await fillAndSubmit(
      user,
      <TestErrorBoundary ref={errorBoundaryRef}>
        <AddressForm traceId="test-trace" />
      </TestErrorBoundary>
    );

    await waitFor(() => {
      expect(errorBoundaryRef.current?.state.error?.message).toBe('NEXT_REDIRECT');
    });
    expect(screen.queryByText('NEXT_REDIRECT')).not.toBeInTheDocument();
    expect(screen.queryByText('Failed to save address')).not.toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  it('offers Poland only in the country dropdown', () => {
    render(<AddressForm traceId="test-trace" />);

    const select = document.querySelector(
      'select[name="regionCode"]'
    ) as HTMLSelectElement;
    const optionValues = Array.from(select.options).map((o) => o.value);

    expect(optionValues).toEqual(['', 'PL']);
    expect(screen.getByRole('option', { name: 'Poland' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'United Kingdom' })
    ).not.toBeInTheDocument();
  });

  it('shows the escape-hatch button on a FIX error and resubmits with skipValidation', async () => {
    const user = userEvent.setup();
    vi.mocked(saveAddress).mockResolvedValue({
      status: 'FIX',
      errors: { message: 'Apartment number is required.' },
    });

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByText('Apartment number is required.')).toBeInTheDocument();
    });

    const escapeButton = screen.getByRole('button', {
      name: 'Continue with entered address',
    });
    expect(escapeButton).toBeInTheDocument();

    await user.click(escapeButton);

    await waitFor(() => {
      expect(saveAddress).toHaveBeenCalledTimes(2);
    });
    expect(saveAddress).toHaveBeenLastCalledWith(
      expect.objectContaining({
        firstName: 'Jan',
        lastName: 'Kowalski',
        regionCode: 'PL',
        city: 'Wrocław',
      }),
      { skipValidation: true }
    );
  });
});
