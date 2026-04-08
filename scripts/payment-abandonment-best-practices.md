# Payment Abandonment Detection - Best Practices Implementation

## 1. Server-Side Reservation Expiration (Primary)

### Database Schema Addition:
```javascript
// Add to product schema or separate reservation table
{
  _id: "reservation_xyz",
  productId: "product_123",
  quantity: 2,
  idempotencyKey: "checkout_abc",
  status: "active", // active, completed, expired
  expiresAt: "2026-04-07T10:42:00Z", // 15 minutes from now
  createdAt: "2026-04-07T10:27:00Z"
}
```

### Implementation:
```javascript
// When reserving stock
const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
await createReservation({
  productId,
  quantity,
  idempotencyKey,
  expiresAt
});

// Background job to clean expired reservations
// Run every 5 minutes
async function cleanExpiredReservations() {
  const expired = await findReservations({
    status: "active",
    expiresAt: { $lt: new Date() }
  });
  
  for (const reservation of expired) {
    await releaseReservation(reservation);
  }
}
```

## 2. Stripe Webhooks (Secondary)

### Webhook Events:
- `checkout.session.expired` - User didn't complete payment
- `checkout.session.completed` - Payment succeeded
- `payment_intent.payment_failed` - Payment failed

### Implementation:
```javascript
// webhook handler
if (event.type === 'checkout.session.expired') {
  const session = event.data.object;
  await releaseReservationForSession(session.id);
}
```

## 3. Client-Side Heartbeat (Optional Enhancement)

### For better UX:
```javascript
// Send heartbeat every 30 seconds while on payment page
const heartbeat = setInterval(() => {
  fetch('/api/checkout/heartbeat', {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey })
  });
}, 30000);

// Clear when payment completes/cancelled
clearInterval(heartbeat);
```

## 4. Hybrid Approach (Recommended)

### Combine multiple methods:
1. **Primary**: 15-minute server-side expiration
2. **Secondary**: Stripe webhooks for immediate cleanup
3. **Enhancement**: Client heartbeat for active sessions

### Why This Works:
- **Reliable**: Server-side doesn't depend on browser
- **Immediate**: Webhooks clean up as soon as payment fails
- **User-friendly**: 15 minutes gives users time to complete payment
- **Scalable**: Background job handles cleanup efficiently

## Implementation Priority:

1. **Phase 1**: Server-side 15-minute expiration
2. **Phase 2**: Stripe webhook integration
3. **Phase 3**: Client heartbeat (optional)

This is how major e-commerce platforms handle payment abandonment.
