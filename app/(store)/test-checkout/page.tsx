'use client';

import { useBasketStore } from '@/store/store';
import { useRouter } from 'next/navigation';

export default function TestCheckoutPage() {
  const basket = useBasketStore((s) => s.basket);
  const addItem = useBasketStore((s) => s.addItem);
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const router = useRouter();

  const testItem = {
    _id: 'test-item-1',
    name: 'Test Product 1',
    displayPrice: 50,
    stock: 10,
    quantity: 1,
    image: '/test-image.jpg',
    slug: 'test-product-1',
    stripePriceId: 'price_1TKDdAEQ2a2vW56gi6JCBoaG'
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Checkout Flow Test</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Basket Status</h2>
          <p>Items in basket: {basket.length}</p>
          {basket.map(item => (
            <div key={item._id} className="text-sm">
              - {item.name} (${item.displayPrice})
            </div>
          ))}
        </div>

        <div className="space-x-4">
          <button
            onClick={() => addItem(testItem)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Test Item
          </button>

          <button
            onClick={clearBasket}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Clear Basket
          </button>

          <button
            onClick={() => router.push('/basket')}
            className="bg-green-500 text-white px-4 py-2 rounded"
            disabled={basket.length === 0}
          >
            Go to Basket
          </button>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Add Test Item" to add a test product</li>
            <li>Click "Go to Basket" to navigate to basket page</li>
            <li>Click "Checkout" button</li>
            <li>Verify navigation to /checkout/address?sessionId=X&amp;idempotencyKey=X</li>
            <li>Fill address form and submit</li>
            <li>Check console for reserveStock response</li>
            <li>Verify navigation to /checkout/payment?sessionId=X</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
