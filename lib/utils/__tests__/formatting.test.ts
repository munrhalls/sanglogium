import { describe, it, expect } from 'vitest';
import { formatDeliveryEstimate } from '../formatting';

describe('formatDeliveryEstimate', () => {
  it('formats singular day', () => {
    expect(formatDeliveryEstimate(1)).toBe('1 dzień roboczy');
  });

  it('formats plural days', () => {
    expect(formatDeliveryEstimate(3)).toBe('3 dni robocze');
  });
});
