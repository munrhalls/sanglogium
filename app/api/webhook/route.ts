import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/stripe";
import { checkoutClient } from "@/sanity/lib/checkoutClient";
import { backendClient } from "@/sanity/lib/backendClient";
import { createOrder } from "@/sanity/lib/orders/addOrder";
import type { CreateOrderOptions } from "@/sanity/lib/orders/orderTypes";
import Stripe from "stripe";

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
    `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]`,
    { sessionId: sessionData.id }
  );

  if (existingOrder) {
    console.log(`Order already exists for session ${sessionData.id}`);
    return;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionData.id, {
    expand: ["line_items", "line_items.data.price.product"],
  });

  const calculatedTotal =
    session.line_items?.data.reduce(
      (sum, item) => sum + (item.amount_total || 0),
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

  const orderItems = (session.line_items?.data || []).map((item, index) => {
    const productData = products.find(
      (p) => p._id === productQuantities[index]?.productId
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

  console.log(`Order created: ${result.order.orderNumber}`);
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
  for (const item of items) {
    try {
      await checkoutClient
        .patch(item.productId)
        .dec({ reservedStock: item.quantity })
        .commit();
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
  const transaction = checkoutClient.transaction();

  for (const item of items) {
    transaction.patch(item.productId, (p) =>
      p.dec({ stock: item.quantity, reservedStock: item.quantity })
    );
  }

  await transaction.commit();
}
