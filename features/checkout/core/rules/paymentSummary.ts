export interface PaymentProductInput {
  _id: string;
  name: string | null;
  price_data: { unit_amount: number } | null;
  imageUrl: string | null;
}

export interface PaymentLineItem {
  productId: string;
  name: string;
  condition?: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export function buildPaymentLineItems(
  basket: { productId: string; quantity: number }[],
  products: PaymentProductInput[]
): PaymentLineItem[] {
  return basket.map((item) => {
    const product = products.find((p) => p._id === item.productId)!;
    const unitPrice = product.price_data!.unit_amount;
    const rawName = product.name ?? "Product";
    // Extract "Open Box" condition if present
    const openBoxMatch = rawName.match(/^Open Box\s*[×xX]\s*\d+\s+(.*)/i);
    const condition = openBoxMatch ? "Open Box" : undefined;
    const displayName = openBoxMatch ? openBoxMatch[1].trim() : rawName;
    return {
      productId: item.productId,
      name: displayName,
      condition,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });
}

export function calculateGrandTotal(subtotal: number, shippingCost: number): number {
  return Math.round(subtotal + shippingCost);
}

export function computePaymentTotals(
  items: PaymentLineItem[],
  shippingCost: number
): { subtotal: number; grandTotal: number; vatAmount: number } {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const grandTotal = calculateGrandTotal(subtotal, shippingCost);
  const vatAmount = grandTotal - Math.round(grandTotal / 1.23);
  return { subtotal, grandTotal, vatAmount };
}
