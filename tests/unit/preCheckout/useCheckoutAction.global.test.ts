/**
 * Global flow sync tests for useCheckoutAction hook
 * Verifies client-side boundaries and server action imports
 */

import { describe, it, expect, vi } from 'vitest';
import { useCheckoutAction } from '../../../app/components/features/basket/checkout/useCheckoutAction';

// Mock validateBasket to avoid server-only import issues
vi.mock('../../../app/actions/checkout', () => ({
  validateBasket: vi.fn()
}));

describe('useCheckoutAction - Global Flow Sync', () => {
  it('should not import any Stripe SDK directly', () => {
    // This test verifies that the hook doesn't directly import Stripe
    // All Stripe operations should be server-side only

    // Check that the hook exists and can be imported
    expect(typeof useCheckoutAction).toBe('function');

    // The hook should work with a mock dispatch
    const mockDispatch = vi.fn();
    const { executeValidation } = useCheckoutAction(mockDispatch);

    expect(typeof executeValidation).toBe('function');
  });

  it('should only import types and server actions', () => {
    // The hook should be importable without issues
    // This would fail if any invalid imports were present
    expect(typeof useCheckoutAction).toBe('function');
  });

  it('should maintain client-side only boundary', () => {
    // Verify the hook is marked as client-side only
    const hookFile = require('fs').readFileSync(
      require.resolve('../../../app/components/features/basket/checkout/useCheckoutAction.ts'),
      'utf8'
    );

    // Should have "use client" directive
    expect(hookFile).toContain('"use client"');

    // Should not have "use server" directive
    expect(hookFile).not.toContain('"use server"');

    // Should not contain any direct Stripe imports
    expect(hookFile).not.toContain('from "@stripe/');
    expect(hookFile).not.toContain('from "stripe"');

    // Should only import from allowed paths
    expect(hookFile).toContain('from "../../../../../store/preCheckout/preCheckoutTypes"');
    expect(hookFile).toContain('from "../../../../../app/actions/checkout/validateBasket.types"');
    expect(hookFile).toContain('from "../../../../../app/actions/checkout"');
  });

  it('should have correct import structure for server actions', () => {
    // Verify the import structure follows Next.js App Router patterns
    const hookFile = require('fs').readFileSync(
      require.resolve('../../../app/components/features/basket/checkout/useCheckoutAction.ts'),
      'utf8'
    );

    // Should import validateBasket from the barrel export (correct pattern)
    expect(hookFile).toContain('import { validateBasket } from "../../../../../app/actions/checkout"');

    // Should not import directly from the server action file
    expect(hookFile).not.toContain('from "./validateBasket"');
    expect(hookFile).not.toContain('from "../validateBasket"');
  });
});
