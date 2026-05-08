import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/stripe";
import { checkoutClient } from "@/sanity-cms/lib/checkoutClient";
import { backendClient } from "@/sanity-cms/lib/backendClient";
import { createOrder } from "@/sanity-cms/lib/orders/addOrder";
import type { CreateOrderOptions } from "@/sanity-cms/lib/orders/orderTypes";
import Stripe from "stripe";

/**
 * SECURITY NOTE (SG-03):
 * The checkout system currently uses a JWT-based cookie for address persistence.
 * There is a known risk where lib/utils/cookies.ts falls back to a "dev-secret-key"
 * if CHECKOUT_JWT_SECRET is undefined. This MUST be corrected in production environments
 * by ensuring the environment variable is set and removing the fallback in cookies.ts.
 */


export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  const permittedEvents = [
    "checkout.session.completed",
    "checkout.session.expired",
    "checkout.session.async_payment_failed",
  ];

  if (!permittedEvents.includes(event.type)) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.expired":
        await handleSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.async_payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function handleCheckoutCompleted(sessionData: Stripe.Checkout.Session) {
  const existingOrder = await backendClient.fetch(
    `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]{ _id, status }`,
    { sessionId: sessionData.id }
  );

  if (existingOrder) {
    // SG-01: Improved idempotency check
    if (existingOrder.status === "paid" || existingOrder.status === "processing") {
      console.log(`Order already processed and finalized for session ${sessionData.id}`);
      return;
    }

    // Order exists but stock is NOT finalized (status is likely 'pending_payment')
    console.log(`Order exists but stock not finalized for session ${sessionData.id}. Finalizing now.`);
    const productsIntent = sessionData.metadata?.productsIntent || "";
    const productQuantities = parseProductsIntent(productsIntent);

    await finalizeStock(productQuantities);

    // Update order status to finalized
    await backendClient
      .patch(existingOrder._id)
      .set({ status: "paid" })
      .commit();

    return;
  }

  // Use the sessionData directly if it has all necessary fields, otherwise retrieve from Stripe
  let session: Stripe.Checkout.Session;

  if (sessionData.line_items && sessionData.customer_details && sessionData.shipping_details) {
    // Session data is complete, use it directly
    session = sessionData;
  } else {
    // Retrieve from Stripe for missing data
    session = await stripe.checkout.sessions.retrieve(sessionData.id, {
      expand: ["line_items", "line_items.data.price.product"],
    }) as any;
  }

  const calculatedTotal =
    session.line_items?.data.reduce(
      (sum: number, item: any) => sum + (item.amount_total || 0),
      0
    ) || 0;

  if (calculatedTotal !== session.amount_total) {
    throw new Error(
      `Amount mismatch: calculated ${calculatedTotal}, session ${session.amount_total}`
    );
  }

  const productsIntent = session.metadata?.productsIntent || "";
  const productQuantities = parseProductsIntent(productsIntent);

  const productIds = productQuantities.map((item) => item.productId);
  const products = await backendClient.fetch(
    `*[_type == "product" && _id in $productIds] { _id, name, slug, image }`,
    { productIds }
  );

  const orderItems = (session.line_items?.data || []).map((item: any, index: number) => {

    const productData = products.find(
      (p: any) => p._id === productQuantities[index]?.productId
    );
    const quantity = item.quantity || 1;
    const price = (item.price?.unit_amount || 0) / 100;

    return {
      productId: productQuantities[index]?.productId || "",
      name: productData?.name || "Product",
      slug: productData?.slug?.current,
      imageUrl: productData?.image?.asset?._ref,
      price,
      quantity,
      subtotal: price * quantity,
    };
  });

  const shippingDetails = session.shipping_details || session.customer_details;
  const shippingAddress = {
    name: shippingDetails?.name || session.customer_details?.name || "Guest",
    line1: shippingDetails?.address?.line1 || "",
    line2: shippingDetails?.address?.line2 || undefined,
    city: shippingDetails?.address?.city || "",
    state: shippingDetails?.address?.state || "",
    postalCode: shippingDetails?.address?.postal_code || "",
    country: shippingDetails?.address?.country || "",
    phone: shippingDetails?.phone || undefined,
  };

  const orderOptions: CreateOrderOptions = {
    clerkUserId: session.metadata?.clerkUserId !== "guest" ? session.metadata?.clerkUserId : undefined,
    customerEmail: session.customer_details?.email || "unknown@example.com",
    isGuest: session.metadata?.clerkUserId === "guest",
    items: orderItems,
    shippingAddress,
    pricing: {
      subtotal: (session.amount_subtotal || 0) / 100,
      shipping: (session.total_details?.amount_shipping || 0) / 100,
      tax: (session.total_details?.amount_tax || 0) / 100,
      total: (session.amount_total || 0) / 100,
      currency: session.currency || "usd",
    },
    payment: {
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string | undefined,
      stripeCustomerId: session.customer as string | undefined,
    },
  };

  const result = await createOrder(orderOptions);

  if (!result.success) {
    throw new Error(`Order creation failed: ${result.error}`);
  }

  await finalizeStock(productQuantities);

  // SG-01: Update status to 'paid' after stock is finalized to mark as complete
  await backendClient
    .patch(result.order._id)
    .set({ status: "paid" })
    .commit();

  console.log(`Order created and stock finalized: ${result.order.orderNumber}`);
}


function parseProductsIntent(intent: string): Array<{ productId: string; quantity: number }> {
  if (!intent) return [];
  return intent.split(",").map((pair) => {
    const [productId, quantity] = pair.split(":");
    return { productId, quantity: parseInt(quantity, 10) };
  });
}

async function handleSessionExpired(session: Stripe.Checkout.Session) {
  const productsIntent = session.metadata?.productsIntent || "";
  const productQuantities = parseProductsIntent(productsIntent);

  await releaseReservations(productQuantities);

  console.log(`Released reservations for expired session ${session.id}`);
}

async function handlePaymentFailed(session: Stripe.Checkout.Session) {
  const productsIntent = session.metadata?.productsIntent || "";
  const productQuantities = parseProductsIntent(productsIntent);

  await releaseReservations(productQuantities);

  console.log(`Released reservations for failed payment session ${session.id}`);
}

async function releaseReservations(
  items: Array<{ productId: string; quantity: number }>
) {
  const productIds = items.map((item) => item.productId);
  const products = await backendClient.fetch(
    `*[_type == "product" && _id in $productIds] { _id, reservedStock }`,
    { productIds }
  );

  for (const item of items) {
    try {
      const product = products.find((p: any) => p._id === item.productId);
      const currentReservedStock = product?.reservedStock || 0;

      // SG-02: Safe decrement to prevent negative reservedStock
      const safeQty = Math.min(item.quantity, currentReservedStock);

      // reservedStock field is guaranteed to exist on all products
      if (safeQty > 0) {
        await checkoutClient
          .patch(item.productId)
          .dec({ reservedStock: safeQty })
          .commit();
      }
    } catch (error) {
      console.error(
        `Failed to release reservation for ${item.productId}:`,
        error
      );
    }
  }
}


async function finalizeStock(
  items: Array<{ productId: string; quantity: number }>
) {
  const productIds = items.map((item) => item.productId);
  const products = await backendClient.fetch(
    `*[_type == "product" && _id in $productIds] { _id, reservedStock }`,
    { productIds }
  );

  const transaction = checkoutClient.transaction();

  for (const item of items) {
    const product = products.find((p: any) => p._id === item.productId);
    const currentReservedStock = product?.reservedStock || 0;

    // SG-02: Safe decrement to prevent negative reservedStock
    const safeReservedQty = Math.min(item.quantity, currentReservedStock);

    // reservedStock field is guaranteed to exist on all products
    transaction.patch(item.productId, (p: any) => {
      return p.dec({ stock: item.quantity, reservedStock: safeReservedQty });
    });
  }

  await transaction.commit();
}

