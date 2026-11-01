import { formatPrice } from '@/platform/utils/price';

// How a range's number is read by the shopper. The stored price is in minor units (cents), so it is shown as money; every other range shows its number:
// whole numbers as they are, others with one decimal. The path decides, and only the exact price path.

const CENTS_PATH = 'price_data.unit_amount';

export function formatRangeValue(path: string, value: number): string {
  if (path === CENTS_PATH) return formatPrice(value);
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
