import type { PaymentWithoutOrder } from "@/features/admin/core/types/adminTypes";

export function PaymentsWithoutOrderTable({ payments }: { payments: PaymentWithoutOrder[] }) {
  if (payments.length === 0) {
    return <p className="mt-4">None: every paid payment of the last 30 days has an order.</p>;
  }
  return (
    <table className="mt-4 w-full border-collapse">
      <thead>
        <tr className="border-b text-left">
          <th className="py-2 pr-4">Paid at (UTC)</th>
          <th className="py-2 pr-4">Amount</th>
          <th className="py-2 pr-4">Payment</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((p) => (
          <tr key={p.paymentIntentId} className="border-b">
            <td className="py-2 pr-4">{p.createdAt.slice(0, 16).replace("T", " ")}</td>
            <td className="py-2 pr-4">{(p.amount / 100).toFixed(2)} {p.currency.toUpperCase()}</td>
            <td className="py-2 pr-4">
              <a
                href={`https://dashboard.stripe.com/payments/${p.paymentIntentId}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {p.paymentIntentId}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
