# Return Page Framed Objective

- Build return page (`/checkout/return/page.tsx`) as pure read-only Server Component
- Verify Stripe payment intent status from URL params using Stripe API
- Implement server-side 2000ms delay after successful payment verification (webhook lag prevention)
- Fetch order document from Sanity using paymentIntentId
- Display order confirmation (items, total, address) if order found
- Display "processing" state with fallback if order not found after delay
- Handle error states (failed, cancelled, processing, invalid intent)
- Do NOT destroy session (Next.js 15 Server Component constraint)
- Session remains intact for next checkout cycle to overwrite
- Follow 4-layer architecture (Layer 1 only - no Layer 2/3, Layer 4 for Stripe/Sanity)
- Use vertical slicing (tracer bullet approach)
