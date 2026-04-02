interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  orderNumber: string;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
}

export function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="mb-8 rounded-lg border border-gray-200 p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Order Summary
      </h2>
      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={item.productId} className="flex justify-between border-b pb-3">
            <div>
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-gray-900">
              ${item.subtotal.toFixed(2)}
            </p>
          </div>
        ))}
        <div className="space-y-2 pt-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${order.pricing.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping:</span>
            <span>${order.pricing.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax:</span>
            <span>${order.pricing.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>Total:</span>
            <span>${order.pricing.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
