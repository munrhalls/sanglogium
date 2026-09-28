import { verifySession } from "@/lib/auth/dal";
import { getUserOrders } from "@/sanity-cms/lib/orders/getUserOrders";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/price";

export default async function OrdersPage() {
  const session = await verifySession();

  const orders = await getUserOrders(session.userId);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">My Orders</h1>
      <p className="mb-4">Orders for {session.user.email}</p>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.orderNumber}
              className="border border-gray-200 rounded"
            >
              <Link
                href={`/account/orders/${order.orderNumber}`}
                className="block p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{order.orderNumber}</span>
                  <span className="text-sm text-gray-500 capitalize">
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(order.dates.orderedAt).toLocaleDateString()}
                </div>
                <div className="text-sm font-medium">
                  {formatPrice(order.pricing.total)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href="/" className="mt-4 inline-block text-blue-600 underline">
        Continue shopping
      </Link>
    </div>
  );
}
