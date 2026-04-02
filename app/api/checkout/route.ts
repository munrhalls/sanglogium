import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { checkoutClient } from "@/sanity/lib/checkoutClient";
import type {
  ServerProduct,
  BasketCheckoutItem,
} from "@/app/(store)/checkout/checkout.types";

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}

function sanitizeQuantity(quantity: unknown): number | null {
  const num = typeof quantity === "string" ? parseInt(quantity, 10) : quantity;
  if (typeof num !== "number" || !Number.isFinite(num) || num < 1 || num > 99) {
    return null;
  }
  return Math.floor(num);
}

function validateBasketItem(item: unknown): item is BasketCheckoutItem {
  if (!item || typeof item !== "object") return false;

  const { _id, quantity } = item as Record<string, unknown>;

  if (typeof _id !== "string" || _id.length < 1 || _id.length > 64) {
    return false;
  }

  const sanitizedQty = sanitizeQuantity(quantity);
  if (sanitizedQty === null) {
    return false;
  }

  return true;
}

function validateBasket(basket: unknown): BasketCheckoutItem[] | null {
  if (!Array.isArray(basket) || basket.length === 0 || basket.length > 50) {
    return null;
  }

  const validated: BasketCheckoutItem[] = [];
  for (const item of basket) {
    if (!validateBasketItem(item)) {
      return null;
    }
    validated.push({
      _id: sanitizeId(item._id as string),
      quantity: sanitizeQuantity(item.quantity) as number,
    });
  }

  // Check for duplicate product IDs
  const idSet = new Set(validated.map((i) => i._id));
  if (idSet.size !== validated.length) {
    return null;
  }

  return validated;
}

export async function POST(req: NextRequest) {
  const reservedItems: Array<{ productId: string; quantity: number }> = [];

  try {
    // Rate limiting check
    const clientId =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "anonymous";
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validation: MUST happen before any Sanity query
    const validatedBasket = validateBasket(body.publicBasket);
    if (!validatedBasket) {
      return NextResponse.json(
        { error: "Invalid basket data" },
        { status: 400 }
      );
    }

    const publicBasket = validatedBasket;
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const origin = req.headers.get("origin") || req.nextUrl.origin;

    const productIds = publicBasket.map((item) => item._id);

    const serverProducts: ServerProduct[] = await checkoutClient.fetch(
      `*[_type == "product" && _id in $productIds] {
        _id,
        name,
        stock,
        reservedStock,
        stripePriceId,
        _rev,
      }`,
      { productIds }
    );

    const lineItems: Array<{ price: string; quantity: number }> = [];

    for (const clientItem of publicBasket) {
      const serverProduct = serverProducts.find(
        (p) => p._id === clientItem._id
      );

      if (!serverProduct) {
        return NextResponse.json(
          { error: `Product no longer exists.` },
          { status: 400 }
        );
      }

      const availableStock =
        serverProduct.stock - (serverProduct.reservedStock || 0);

      if (availableStock < clientItem.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${serverProduct.name}.` },
          { status: 409 }
        );
      }

      lineItems.push({
        price: serverProduct.stripePriceId,
        quantity: clientItem.quantity,
      });

      await checkoutClient
        .patch(serverProduct._id)
        .inc({ reservedStock: clientItem.quantity })
        .ifRevisionId(serverProduct._rev)
        .commit();

      reservedItems.push({
        productId: serverProduct._id,
        quantity: clientItem.quantity,
      });
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: lineItems,
        mode: "payment",
        return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        ...(userEmail && {
          customer_email: userEmail,
          customer_creation: "always",
        }),
        metadata: {
          productsIntent: publicBasket
            .map((item) => `${item._id}:${item.quantity}`)
            .join(","),
          clerkUserId: user?.id || "guest",
        },
        expires_at: Math.floor(Date.now() / 1000) + 25 * 60,
      });
    } catch (stripeError) {
      console.error("Stripe session creation failed:", stripeError);
      await rollbackReservations(reservedItems);
      return NextResponse.json(
        { error: "Failed to create payment session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ client_secret: session.client_secret });
  } catch (error) {
    console.error("Checkout error:", error);
    if (reservedItems.length > 0) {
      await rollbackReservations(reservedItems);
    }
    // Generic error message to avoid information leakage
    return NextResponse.json(
      { error: "An error occurred during checkout. Please try again." },
      { status: 500 }
    );
  }
}

async function rollbackReservations(
  items: Array<{ productId: string; quantity: number }>
) {
  for (const item of items) {
    try {
      await checkoutClient
        .patch(item.productId)
        .dec({ reservedStock: item.quantity })
        .commit();
    } catch (rollbackError) {
      console.error(
        `Failed to rollback reservation for ${item.productId}:`,
        rollbackError
      );
    }
  }
}

