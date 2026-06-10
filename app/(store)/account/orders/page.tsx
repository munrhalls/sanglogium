import { verifySession } from "@/lib/auth/dal";
import { backendClient } from "@/sanity-cms/lib/backendClient";
import Link from "next/link";

interface OrderDoc {
  orderNumber: string;
  status: string;
  pricing: {
    total: number;
    currency: string;
  };
  dates: {
    orderedAt: string;
  };
}

export default async function OrdersPage() {
  const session = await verifySession();

  const orders = await backendClient.fetch<OrderDoc[]>(
    `*[_type == "order" && userId == $userId] | order(dates.orderedAt desc) {
      orderNumber, status, pricing, dates
    }`,
    { userId: session.userId }
  );

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
              className="border border-gray-200 p-4 rounded"
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
                {order.pricing.total / 100} {order.pricing.currency.toUpperCase()}
              </div>
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
