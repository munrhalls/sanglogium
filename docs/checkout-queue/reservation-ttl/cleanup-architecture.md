# Cleanup Infrastructure Architecture

## Components

### 1. releaseReservedStock(productId: string, quantity: number)
- **Purpose:** Release reservedStock back to available stock
- **Input:** Product ID and quantity to release
- **Logic:** Decrement reservedStock atomically on product
- **Output:** Success/failure
- **Dependencies:** Sanity client

### 2. deleteExpiredReservation(reservationId: string)
- **Purpose:** Delete expired basketReservation document from Sanity
- **Input:** Reservation ID to delete
- **Logic:** Sanity delete operation
- **Output:** Success/failure
- **Dependencies:** Sanity client

### 3. findExpiredReservations()
- **Purpose:** Find all basketReservation docs where expiresAt < now
- **Input:** None
- **Logic:** GROQ query for expired docs
- **Output:** Array of expired reservation IDs with basket items
- **Dependencies:** Sanity client

### 4. backgroundCleanupJob()
- **Purpose:** Orchestrator that runs cleanup periodically
- **Logic:**
  1. Call findExpiredReservations()
  2. For each expired reservation:
     - Release reservedStock for each product in basket
     - Delete the reservation document
- **Output:** Cleanup summary (processed count, errors)
- **Dependencies:** All three functions above

## Data Flow

```
Background Job (runs every X minutes)
  ↓
findExpiredReservations() → [expired reservations]
  ↓
For each reservation:
  releaseReservedStock(productId, quantity) → decrement reservedStock
  deleteExpiredReservation(reservationId) → delete doc
  ↓
Cleanup summary
```

## Error Handling

- Individual reservation failures should not stop entire cleanup
- Log errors for failed operations
- Continue processing remaining reservations

## Scheduling

- Background job runs via cron or interval timer
- Frequency: Every 5 minutes (configurable)
- Should not overlap with active queue processing
