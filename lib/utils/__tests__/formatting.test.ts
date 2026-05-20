import { describe, it, expect } from 'vitest';
import { formatPolishPrice, formatDeliveryEstimate } from '../formatting';

describe('formatPolishPrice', () => {
  it('formats price with decimal separator as comma', () => {
    const result = formatPolishPrice(15.69);
    expect(result).toContain('15,69');
    expect(result).toContain('zł');
    expect(result).toContain(',');
  });

  it('formats price with zero padding for cents', () => {
    const result = formatPolishPrice(12.5);
    expect(result).toContain('12,50');
    expect(result).toContain('zł');
  });
});

describe('formatDeliveryEstimate', () => {
  it('formats singular day', () => {
    expect(formatDeliveryEstimate(1)).toBe('1 dzień roboczy');
  });

  it('formats plural days', () => {
    expect(formatDeliveryEstimate(3)).toBe('3 dni robocze');
  });
});
