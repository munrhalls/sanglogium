diff --git a/app/(store)/basket/Basket.tsx b/app/(store)/basket/Basket.tsx
index 1921c3b4..dfb609b1 100644
--- a/app/(store)/basket/Basket.tsx
+++ b/app/(store)/basket/Basket.tsx
@@ -36,52 +36,51 @@ export default function Basket() {
       {basket.map((item) => {
         const isRemoving = removingIds.has(item._id);
         return (
-        <div
-          key={item._id}
-          className={`grid grid-cols-1 gap-5 border-b border-border-secondary p-5 lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] transition-all duration-200 hover:bg-secondary-900/50 ${
-            isRemoving ? 'opacity-0 max-h-0 overflow-hidden py-0 px-5 border-b-0' : 'opacity-100 max-h-96'
-          }`}
-          style={isRemoving ? { transitionDuration: '200ms, 300ms', transitionProperty: 'opacity, max-height, padding' } : undefined}
-        >
-          {/* Product column */}
-          <div className="flex items-center gap-5">
-            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-surface-productImage relative">
-              <Image
-                src={item.image}
-                alt={item.name}
-                fill
-                unoptimized
-                className="object-contain"
-              />
+          <div
+            key={item._id}
+            className={`grid grid-cols-1 gap-5 border-b border-border-secondary p-5 lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] transition-all duration-200 hover:bg-secondary-900/50 ${isRemoving ? 'opacity-0 max-h-0 overflow-hidden py-0 px-5 border-b-0' : 'opacity-100 max-h-96'
+              }`}
+            style={isRemoving ? { transitionDuration: '200ms, 300ms', transitionProperty: 'opacity, max-height, padding' } : undefined}
+          >
+            {/* Product column */}
+            <div className="flex items-center gap-5">
+              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-surface-productImage relative">
+                <Image
+                  src={item.image}
+                  alt={item.name}
+                  fill
+                  unoptimized
+                  className="object-contain"
+                />
+              </div>
+              <div>
+                <Link href={`/product/${item.slug}`}>
+                  <h3 className="type-body hover:text-brand-100 transition-colors">
+                    {item.name}
+                  </h3>
+                </Link>
+                <p className="type-metadata lg-desktop:hidden lg-touch:hidden">
+                  <Price value={item.displayPrice} />
+                  {" "}├ù {item.quantity}
+                </p>
+              </div>
             </div>
-            <div>
-              <Link href={`/product/${item.slug}`}>
-                <h3 className="type-body hover:text-brand-100 transition-colors">
-                  {item.name}
-                </h3>
-              </Link>
-              <p className="type-metadata lg-desktop:hidden lg-touch:hidden">
-                <Price value={item.displayPrice} />
-                {" "}├ù {item.quantity}
-              </p>
-            </div>
-          </div>
 
-          {/* Price column - desktop only */}
-          <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-center">
-            <Price value={item.displayPrice} />
-          </div>
+            {/* Price column - desktop only */}
+            <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-center">
+              <Price value={item.displayPrice} />
+            </div>
 
-          {/* Quantity column */}
-          <div className="flex items-center lg-desktop:justify-center lg-touch:justify-center">
-            <BasketControls product={item} onRemoveStart={handleRemoveStart} />
-          </div>
+            {/* Quantity column */}
+            <div className="flex items-center lg-desktop:justify-center lg-touch:justify-center">
+              <BasketControls product={item} onRemoveStart={handleRemoveStart} />
+            </div>
 
-          {/* Total column - desktop only */}
-          <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-end">
-            <Price value={item.displayPrice * item.quantity} />
+            {/* Total column - desktop only */}
+            <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-end">
+              <Price value={item.displayPrice * item.quantity} />
+            </div>
           </div>
-        </div>
         );
       })}
     </div>
diff --git a/app/(store)/checkout/layout.tsx b/app/(store)/checkout/layout.tsx
index ec1cb277..5a836ae3 100644
--- a/app/(store)/checkout/layout.tsx
+++ b/app/(store)/checkout/layout.tsx
@@ -44,7 +44,6 @@ export default async function CheckoutLayout({
               postalCode: savedAddr.postalCode!,
               regionCode: savedAddr.country!,
             };
-            initialStatus = "CONFIRMED";
           } else {
             console.warn("Incomplete address data in Sanity:", {
               hasLine1: !!savedAddr.line1,
@@ -71,7 +70,6 @@ export default async function CheckoutLayout({
         postalCode: guestContext.address.postal_code,
         regionCode: guestContext.address.country,
       };
-      initialStatus = "CONFIRMED";
     }
   }
 
diff --git a/app/api/webhook/route.ts b/app/api/webhook/route.ts
index 5088d2f0..b10819d5 100644
--- a/app/api/webhook/route.ts
+++ b/app/api/webhook/route.ts
@@ -7,6 +7,15 @@ import { createOrder } from "@/sanity/lib/orders/addOrder";
 import type { CreateOrderOptions } from "@/sanity/lib/orders/orderTypes";
 import Stripe from "stripe";
 
+/**
+ * SECURITY NOTE (SG-03):
+ * The checkout system currently uses a JWT-based cookie for address persistence.
+ * There is a known risk where lib/utils/cookies.ts falls back to a "dev-secret-key"
+ * if CHECKOUT_JWT_SECRET is undefined. This MUST be corrected in production environments
+ * by ensuring the environment variable is set and removing the fallback in cookies.ts.
+ */
+
+
 export async function POST(req: Request) {
   let event: Stripe.Event;
 
@@ -72,25 +81,46 @@ export async function POST(req: Request) {
 
 async function handleCheckoutCompleted(sessionData: Stripe.Checkout.Session) {
   const existingOrder = await backendClient.fetch(
-    `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]`,
+    `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]{ _id, status }`,
     { sessionId: sessionData.id }
   );
 
   if (existingOrder) {
-    console.log(`Order already exists for session ${sessionData.id}`);
+    // SG-01: Improved idempotency check
+    if (existingOrder.status === "paid" || existingOrder.status === "processing") {
+      console.log(`Order already processed and finalized for session ${sessionData.id}`);
+      return;
+    }
+
+    // Order exists but stock is NOT finalized (status is likely 'pending_payment')
+    console.log(`Order exists but stock not finalized for session ${sessionData.id}. Finalizing now.`);
+    const productsIntent = sessionData.metadata?.productsIntent || "";
+    const productQuantities = parseProductsIntent(productsIntent);
+    
+    await finalizeStock(productQuantities);
+    
+    // Update order status to finalized
+    await backendClient
+      .patch(existingOrder._id)
+      .set({ status: "paid" })
+      .commit();
+      
     return;
   }
 
+
   const session = await stripe.checkout.sessions.retrieve(sessionData.id, {
     expand: ["line_items", "line_items.data.price.product"],
-  });
+  }) as any;
+
 
   const calculatedTotal =
     session.line_items?.data.reduce(
-      (sum, item) => sum + (item.amount_total || 0),
+      (sum: number, item: any) => sum + (item.amount_total || 0),
       0
     ) || 0;
 
+
   if (calculatedTotal !== session.amount_total) {
     throw new Error(
       `Amount mismatch: calculated ${calculatedTotal}, session ${session.amount_total}`
@@ -106,9 +136,10 @@ async function handleCheckoutCompleted(sessionData: Stripe.Checkout.Session) {
     { productIds }
   );
 
-  const orderItems = (session.line_items?.data || []).map((item, index) => {
+  const orderItems = (session.line_items?.data || []).map((item: any, index: number) => {
+
     const productData = products.find(
-      (p) => p._id === productQuantities[index]?.productId
+      (p: any) => p._id === productQuantities[index]?.productId
     );
     const quantity = item.quantity || 1;
     const price = (item.price?.unit_amount || 0) / 100;
@@ -164,9 +195,16 @@ async function handleCheckoutCompleted(sessionData: Stripe.Checkout.Session) {
 
   await finalizeStock(productQuantities);
 
-  console.log(`Order created: ${result.order.orderNumber}`);
+  // SG-01: Update status to 'paid' after stock is finalized to mark as complete
+  await backendClient
+    .patch(result.order._id)
+    .set({ status: "paid" })
+    .commit();
+
+  console.log(`Order created and stock finalized: ${result.order.orderNumber}`);
 }
 
+
 function parseProductsIntent(intent: string): Array<{ productId: string; quantity: number }> {
   if (!intent) return [];
   return intent.split(",").map((pair) => {
@@ -196,11 +234,23 @@ async function handlePaymentFailed(session: Stripe.Checkout.Session) {
 async function releaseReservations(
   items: Array<{ productId: string; quantity: number }>
 ) {
+  const productIds = items.map((item) => item.productId);
+  const products = await backendClient.fetch(
+    `*[_type == "product" && _id in $productIds] { _id, reservedStock }`,
+    { productIds }
+  );
+
   for (const item of items) {
     try {
+      const product = products.find((p: any) => p._id === item.productId);
+      const currentReservedStock = product?.reservedStock || 0;
+
+      // SG-02: Safe decrement to prevent negative reservedStock
+      const safeQty = Math.min(item.quantity, currentReservedStock);
+
       await checkoutClient
         .patch(item.productId)
-        .dec({ reservedStock: item.quantity })
+        .dec({ reservedStock: safeQty })
         .commit();
     } catch (error) {
       console.error(
@@ -211,16 +261,30 @@ async function releaseReservations(
   }
 }
 
+
 async function finalizeStock(
   items: Array<{ productId: string; quantity: number }>
 ) {
+  const productIds = items.map((item) => item.productId);
+  const products = await backendClient.fetch(
+    `*[_type == "product" && _id in $productIds] { _id, reservedStock }`,
+    { productIds }
+  );
+
   const transaction = checkoutClient.transaction();
 
   for (const item of items) {
-    transaction.patch(item.productId, (p) =>
-      p.dec({ stock: item.quantity, reservedStock: item.quantity })
+    const product = products.find((p: any) => p._id === item.productId);
+    const currentReservedStock = product?.reservedStock || 0;
+
+    // SG-02: Safe decrement to prevent negative reservedStock
+    const safeReservedQty = Math.min(item.quantity, currentReservedStock);
+
+    transaction.patch(item.productId, (p: any) =>
+      p.dec({ stock: item.quantity, reservedStock: safeReservedQty })
     );
   }
 
   await transaction.commit();
 }
+
diff --git a/data/catalogue-index.json b/data/catalogue-index.json
index 4c75554a..d718a3b6 100644
--- a/data/catalogue-index.json
+++ b/data/catalogue-index.json
@@ -1,5 +1,5 @@
 {
-  "generatedAt": "2026-04-03T12:19:19.810Z",
+  "generatedAt": "2026-04-03T16:36:03.088Z",
   "slugToIdMap": {
     "open-back": "o7c6baiuobsr7ni2y2vf22sh",
     "headphones/open-back": "o7c6baiuobsr7ni2y2vf22sh",
