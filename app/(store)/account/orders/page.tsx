import { verifySession } from "@/lib/auth/dal";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await verifySession();

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">My Orders</h1>
      <p className="mb-4">Orders for {session.user.email}</p>
      <p className="text-gray-500">No orders yet.</p>
      <Link href="/" className="mt-4 inline-block text-blue-600 underline">
        Continue shopping
      </Link>
    </div>
  );
}
