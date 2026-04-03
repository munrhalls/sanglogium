import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NavbarActions from '@/app/components/layout/header/NavbarActions';
import { useBasketStore, selectBasketCount } from '@/store/store';

// Mock the basket store
vi.mock('@/store/store', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useBasketStore: vi.fn(),
  };
});

describe('NavbarActions wiring test', () => {
  it('should ignore props and show the REAL cart count from the store (Single Source of Truth)', () => {
    // 1. Mock the store to have 5 items
    vi.mocked(useBasketStore).mockImplementation((selector: any) => {
      // If used as useBasketStore(selectBasketCount)
      if (selector === selectBasketCount) {
        return 5;
      }
      return null;
    });

    // 2. Render with cartCount={0} (which is currently hardcoded in server component)
    render(<NavbarActions isAuthenticated={false} cartCount={0} />);

    // 3. This SHOULD FAIL if the component only looks at props
    // The expected output is '5', but currently it will show nothing (because props=0)
    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
  });

  it('should not show a badge when count is 0', () => {
    // 1. Mock store with 0 items
    vi.mocked(useBasketStore).mockImplementation((selector: any) => {
      if (selector === selectBasketCount) return 0;
      return null;
    });

    render(<NavbarActions isAuthenticated={true} cartCount={0} />);

    // 2. Verify no badge is present
    const badge = screen.queryByRole('status'); // assuming I'll add role or checked by number
    // More simply:
    const itemWithBadge = screen.queryByText('0');
    expect(itemWithBadge).not.toBeInTheDocument();
  });
});
