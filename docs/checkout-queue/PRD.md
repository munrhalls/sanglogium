# Scope: checkout button click on basket page -> basket reservation flow -> ui response, saving basket reservation id to session.

## Definition of Done - happy path

- [ ] API endpoint `/api/checkout-queue` accepts valid BasketReservation requests and queues them for processing
- [ ] Queue processes requests atomically (FIFO, one at a time) with trace logging for verification
- [ ] Creates basketReservation document in Sanity with verified prices (stripePriceId stripped, verifiedPrice added)
- [ ] Increments reservedStock atomically on each product by requested quantity
- [ ] Returns BasketReservationResponse with reservationId and product snapshot (stock, reservedStock, realPrice)
- [ ] Saves reservationId to session and navigates user to checkout address page

