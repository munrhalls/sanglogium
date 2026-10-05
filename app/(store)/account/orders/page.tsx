import { verifySession } from "@/features/auth/server";
import { getUserOrders, OrdersView } from "@/features/account/server";

export default async function OrdersPage() {
  const session = await verifySession();

  const orders = await getUserOrders(session.userId);

  return <OrdersView orders={orders} email={session.user.email} />;
}
