import { requireOwner, getPaymentsWithoutOrder } from "@/features/admin/server";
import { PaymentsWithoutOrderTable } from "@/features/admin";

export default async function Manager() {
  await requireOwner();
  const payments = await getPaymentsWithoutOrder();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <h2 className="mt-6 text-lg font-semibold">Paid payments with no order (last 30 days)</h2>
      <p className="mt-1 text-sm text-gray-600">Each one is money taken with no parcel to send. Open it in Stripe to refund it.</p>
      <PaymentsWithoutOrderTable payments={payments} />
    </div>
  );
}
