import { verifySession } from "@/lib/auth/dal";
import { backendClient } from "@/sanity-cms/lib/backendClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Order } from "@/sanity.types";

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

function formatCurrency(amount: number | undefined, currency: string | undefined) {
  const safeAmount = (amount || 0) / 100;
  const safeCurrency = (currency || "PLN").toUpperCase();
  return safeAmount.toLocaleString("pl-PL", {
    style: "currency",
    currency: safeCurrency,
  });
}

function formatDate(date: string | undefined) {
  return date ? new Date(date).toLocaleDateString("pl-PL") : "—";
}

function displayStatus(status: string | undefined) {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").toUpperCase();
}

function formatAddress(
  address: Order["shippingAddress"],
  fallback?: Order["shippingAddress"]
) {
  if (!address) {
    return fallback ? "Same as shipping" : "Not recorded";
  }

  const parts = [
    address.name,
    address.line1,
    address.line2,
    [address.postalCode, address.city, address.state].filter(Boolean).join(" "),
    address.country,
    address.phone,
  ].filter(Boolean);

  return parts.join("\n");
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderNumber } = await params;
  const session = await verifySession();

  const order = await backendClient.fetch<Order>(
    `*[_type == "order" && orderNumber == $orderNumber && userId == $userId][0]{
      orderNumber, status, items, shippingAddress, billingAddress,
      shippingMethod, pricing, dates, payment, metadata
    }`,
    { orderNumber, userId: session.userId }
  );

  if (!order) {
    notFound();
  }

  const pricing = order.pricing;
  const currency = pricing?.currency;
  const items = order.items || [];
  const shippingMethod = order.shippingMethod;

  return (
    <div className="p-6 max-w-4xl">
      <Link
        href="/account/orders"
        className="mb-4 inline-block text-blue-600 underline"
      >
        ← Back to My Orders
      </Link>

      <h1 className="mb-1 text-2xl font-bold">Order {order.orderNumber}</h1>
      <div className="mb-6 text-sm text-gray-600">
        <span className="font-medium text-gray-800">{displayStatus(order.status)}</span>
        {" · "}
        <span>{formatDate(order.dates?.orderedAt)}</span>
      </div>

      <section className="mb-8">
        <h2 className="type-section-hed mb-4">Items</h2>
        <div className="divide-y divide-gray-200 border border-gray-200 rounded">
          {items.length === 0 ? (
            <p className="p-4 text-gray-500">No items.</p>
          ) : (
            items.map((item) => (
              <div
                key={item._key}
                className="flex items-start gap-4 p-4"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name || "Product"}
                    className="w-16 h-16 object-cover rounded bg-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-200 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.name || item.productId}</p>
                  {item.variant && (
                    <p className="text-sm text-gray-600">
                      {[
                        item.variant.sku && `SKU: ${item.variant.sku}`,
                        item.variant.size && `Size: ${item.variant.size}`,
                        item.variant.color && `Color: ${item.variant.color}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {item.quantity} × {formatCurrency(item.price, currency)}
                  </p>
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(item.subtotal, currency)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <section>
          <h2 className="type-section-hed mb-4">Shipping Address</h2>
          <div className="card-base p-4 whitespace-pre-line text-sm text-gray-700">
            {formatAddress(order.shippingAddress)}
          </div>
        </section>

        <section>
          <h2 className="type-section-hed mb-4">Billing Address</h2>
          <div className="card-base p-4 whitespace-pre-line text-sm text-gray-700">
            {formatAddress(order.billingAddress, order.shippingAddress)}
          </div>
        </section>
      </div>

      <section className="mb-8">
        <h2 className="type-section-hed mb-4">Shipping Method</h2>
        <div className="card-base p-4 text-sm text-gray-700">
          {shippingMethod ? (
            <>
              <p className="font-medium">{shippingMethod.name}</p>
              {shippingMethod.carrier && <p>Carrier: {shippingMethod.carrier}</p>}
              {shippingMethod.estimatedDays && (
                <p>Estimated: {shippingMethod.estimatedDays} business days</p>
              )}
              {shippingMethod.price !== undefined && (
                <p>{formatCurrency(shippingMethod.price, currency)}</p>
              )}
              {shippingMethod.trackingNumber && (
                <p>
                  Tracking: {shippingMethod.trackingNumber}
                  {shippingMethod.trackingUrl && (
                    <>
                      {" "}
                      <a
                        href={shippingMethod.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Track package
                      </a>
                    </>
                  )}
                </p>
              )}
            </>
          ) : (
            <p>Not recorded</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="type-section-hed mb-4">Payment</h2>
        <div className="card-base p-4 text-sm text-gray-700">
          {order.payment ? (
            <>
              {order.payment.brand && order.payment.last4 ? (
                <p className="font-medium capitalize">
                  {order.payment.brand} ending in {order.payment.last4}
                </p>
              ) : (
                <p className="font-medium capitalize">
                  {order.payment.method || "Payment method recorded"}
                </p>
              )}
              {order.payment.stripePaymentIntentId && (
                <p className="text-gray-500 text-xs mt-1">
                  ID: {order.payment.stripePaymentIntentId}
                </p>
              )}
            </>
          ) : (
            <p>Not recorded</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="type-section-hed mb-4">Order Summary</h2>
        <div className="card-base p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(pricing?.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{formatCurrency(pricing?.shipping, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>{formatCurrency(pricing?.tax, currency)}</span>
          </div>
          {pricing?.discount !== undefined && pricing.discount > 0 && (
            <div className="flex justify-between text-success-500">
              <span>Discount</span>
              <span>-{formatCurrency(pricing.discount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2 font-medium">
            <span>Total</span>
            <span>{formatCurrency(pricing?.total, currency)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
