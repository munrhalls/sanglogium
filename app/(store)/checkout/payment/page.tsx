import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { client } from "@/sanity-cms/lib/client";
import groq from "groq";
import { stripe } from "@/lib/stripe";
import PaymentForm from "./PaymentForm.client";

interface PaymentProduct {
  _id: string;
  price_data: { unit_amount: number } | null;
  stock: number | null;
}

export default async function Page() {
  const session = await getCheckoutSession();
  const checkoutSessionId = session.checkoutSessionId;

  if (!session.basket?.length) {
    redirect("/basket");
  }

  if (session.basket.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1)) {
    redirect("/basket?error=invalid_basket");
  }

  if (!session.address) {
    redirect("/checkout/address");
  }

  if (session.shippingCost === undefined || session.shippingCost === null) {
    redirect("/checkout/shipping");
  }

  const ids = session.basket.map((i) => i.productId);

  const sanityProducts = await client.fetch<PaymentProduct[]>(
    groq`*[_type == "product" && _id in $ids]{ _id, price_data { unit_amount }, stock }`,
    { ids }
  );

  if (sanityProducts.length !== session.basket.length) {
    throw new Error("Product mismatch — basket contains unknown product IDs");
  }

  for (const product of sanityProducts) {
    if (!Number.isFinite(product.price_data?.unit_amount)) {
      throw new Error(`Product ${product._id} has invalid price`);
    }
    if (product.stock === 0) {
      redirect(`/basket?error=out_of_stock&id=${product._id}`);
    }
  }

  const subtotal = session.basket.reduce((sum, item) => {
    const product = sanityProducts.find((p) => p._id === item.productId)!;
    return sum + product.price_data!.unit_amount * item.quantity;
  }, 0);

  const grandTotal = Math.round(subtotal + (session.shippingCost as number));

  if (grandTotal < 1) {
    redirect("/basket?error=invalid_total");
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[PAYMENT PAGE] subtotal:", subtotal, "grandTotal:", grandTotal);
  }

  const address = session.address!;

  const metadata: Record<string, string> = {
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone,
    regionCode: address.regionCode,
    postalCode: address.postalCode,
    street: address.street,
    streetNumber: address.streetNumber,
    city: address.city,
    email: session.email ?? "",
    ...(checkoutSessionId && { checkoutSessionId }),
  };

  let result: { id: string; client_secret: string | null };

  if (session.paymentIntentId) {
    try {
      result = await stripe.paymentIntents.update(session.paymentIntentId, {
        amount: grandTotal,
        metadata,
      });
    } catch (err) {
      session.paymentIntentId = undefined;
      result = await stripe.paymentIntents.create({
        amount: grandTotal,
        currency: "pln",
        automatic_payment_methods: { enabled: true },
        metadata,
      });
      session.paymentIntentId = result.id;
    }
  } else {
    result = await stripe.paymentIntents.create({
      amount: grandTotal,
      currency: "pln",
      automatic_payment_methods: { enabled: true },
      metadata,
    });
    session.paymentIntentId = result.id;
  }

  if (!result.client_secret) {
    throw new Error("Stripe did not return client_secret");
  }

  await session.save();

  const clientSecret = result.client_secret;

  return <PaymentForm clientSecret={clientSecret} address={address} />;
}
