import { verifySession } from "@/features/auth/server";
import { getOrderDetail, OrderDetailView } from "@/features/account/server";

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderNumber } = await params;
  const session = await verifySession();

  const order = await getOrderDetail(orderNumber, session.userId);

  return <OrderDetailView order={order} />;
}
