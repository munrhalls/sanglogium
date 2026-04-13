# Bus Stop Verification: Checkout Button to Redis Queue

## Flow Overview
**User Action:** Click checkout button on basket page
**Expected Flow:** Button click -> API request formation -> Redis queue addition -> Success response

## Bus Stop Analysis

### Bus Stop 1: Button Click Handler
**Location:** Checkout button component
**Expected:** 
- Button click triggers onClick handler
- UUID v4 generated for request ID
- UUID v4 generated for idempotency key
- Console log: "Checkout button clicked"

**Manual Verification:**
1. Open browser dev tools Console tab
2. Click checkout button on basket page
3. Check for console log showing UUID generation

**Console Log to Add:**
```typescript
console.log('TRACE: Checkout button clicked', { 
  requestId: uuidv4(), 
  idempotencyKey: uuidv4(),
  timestamp: Date.now() 
});
```

---

### Bus Stop 2: Request Formation
**Location:** API request construction
**Expected:**
- QueueRequest object created with all required fields
- Structure matches: `{ id, type: 'create_reservation', idempotencyKey, payload: { clientBasket }, priority: 'normal', createdAt: Date, retryCount: 0 }`
- clientBasket contains products array with stripePriceId

**Manual Verification:**
1. Add console.log before API call
2. Check request object structure in console
3. Verify all required fields present

**Console Log to Add:**
```typescript
console.log('TRACE: Queue request formed', {
  request: {
    id: request.id,
    type: request.type,
    idempotencyKey: request.idempotencyKey,
    payloadKeys: Object.keys(request.payload),
    priority: request.priority,
    createdAt: request.createdAt,
    retryCount: request.retryCount
  }
});
```

---

### Bus Stop 3: API Call Initiation
**Location:** fetch() or API client call
**Expected:**
- HTTP POST to checkout endpoint
- Request body contains QueueRequest
- Headers include Content-Type: application/json

**Manual Verification:**
1. Open Network tab in dev tools
2. Click checkout button
3. Check POST request to /api/checkout/reserve
4. Verify request body structure

**Console Log to Add:**
```typescript
console.log('TRACE: API call initiated', {
  url: '/api/checkout/reserve',
  method: 'POST',
  bodySize: JSON.stringify(request).length,
  headers: { 'Content-Type': 'application/json' }
});
```

---

### Bus Stop 4: Server Receives Request
**Location:** API route handler
**Expected:**
- Request received at /api/checkout/reserve
- Request body parsed successfully
- QueueRequest object reconstructed

**Manual Verification:**
1. Check server console logs
2. Verify request parsing
3. Confirm QueueRequest reconstruction

**Console Log to Add (in API route):**
```typescript
console.log('TRACE: Server received request', {
  endpoint: '/api/checkout/reserve',
  requestId: request.id,
  type: request.type,
  bodyParsed: true
});
```

---

### Bus Stop 5: Redis Connection
**Location:** Redis client initialization
**Expected:**
- Redis connection established (localhost:6379)
- Database selected (DB 0 or configured)
- Connection status: "ready"

**Manual Verification:**
1. Check Redis is running: `redis-cli ping`
2. Verify connection in server logs
3. Check for connection errors

**Console Log to Add:**
```typescript
console.log('TRACE: Redis connection status', {
  connected: redis.status,
  host: redis.options.host,
  port: redis.options.port,
  db: redis.options.db
});
```

---

### Bus Stop 6: Queue Enqueue Operation
**Location:** FIFOQueue.enqueue()
**Expected:**
- Request added to Redis queue
- TTL set (e.g., 300 seconds)
- QueueResponse returned with requestId and status

**Manual Verification:**
1. Check Redis queue: `redis-cli LRANGE queue:reservations 0 -1`
2. Verify request in queue
3. Check TTL: `redis-cli TTL queue:reservations`

**Console Log to Add:**
```typescript
console.log('TRACE: Queue enqueue operation', {
  requestId: request.id,
  queueName: 'queue:reservations',
  operation: 'LPUSH',
  success: true
});
```

---

### Bus Stop 7: Response Formation
**Location:** API response creation
**Expected:**
- QueueResponse object created
- Contains requestId and status: 'processing'
- Response serialized to JSON

**Manual Verification:**
1. Check server logs for response creation
2. Verify response structure
3. Confirm requestId matches request

**Console Log to Add:**
```typescript
console.log('TRACE: Response formed', {
  response: {
    requestId: response.requestId,
    status: response.status,
    timestamp: Date.now()
  }
});
```

---

### Bus Stop 8: API Response Sent
**Location:** API route return
**Expected:**
- HTTP 202 status code (Accepted)
- Response body contains QueueResponse
- Headers include Content-Type: application/json

**Manual Verification:**
1. Check Network tab for response
2. Verify status code 202
3. Check response body structure

**Console Log to Add:**
```typescript
console.log('TRACE: API response sent', {
  statusCode: 202,
  responseSize: JSON.stringify(response).length,
  requestId: response.requestId
});
```

---

### Bus Stop 9: Client Receives Response
**Location:** Frontend response handler
**Expected:**
- Response received with status 202
- QueueResponse parsed successfully
- requestId matches original request

**Manual Verification:**
1. Check client console logs
2. Verify response parsing
3. Confirm requestId match

**Console Log to Add:**
```typescript
console.log('TRACE: Client received response', {
  status: response.status,
  requestId: response.requestId,
  receivedAt: Date.now()
});
```

---

### Bus Stop 10: UI State Update
**Location:** Component state management
**Expected:**
- Loading state updated to false
- Success state set to true
- User feedback displayed (e.g., "Reservation created")

**Manual Verification:**
1. Check UI for success message
2. Verify loading indicator disappears
3. Confirm state changes

**Console Log to Add:**
```typescript
console.log('TRACE: UI state updated', {
  loading: false,
  success: true,
  reservationId: response.requestId,
  timestamp: Date.now()
});
```

## Quick Verification Script

### 1. Add Trace Logs
Add these console.log statements to trace the flow:

```typescript
// In checkout button component
const handleCheckout = async () => {
  // Stop 1
  console.log('TRACE: Checkout button clicked', { 
    requestId: uuidv4(), 
    idempotencyKey: uuidv4(),
    timestamp: Date.now() 
  });

  const request: QueueRequest = {
    id: uuidv4(),
    type: 'create_reservation',
    idempotencyKey: uuidv4(),
    payload: { clientBasket },
    priority: 'normal',
    createdAt: new Date(),
    retryCount: 0
  };

  // Stop 2
  console.log('TRACE: Queue request formed', {
    request: {
      id: request.id,
      type: request.type,
      idempotencyKey: request.idempotencyKey,
      payloadKeys: Object.keys(request.payload),
      priority: request.priority,
      createdAt: request.createdAt,
      retryCount: request.retryCount
    }
  });

  // Stop 3
  console.log('TRACE: API call initiated', {
    url: '/api/checkout/reserve',
    method: 'POST',
    bodySize: JSON.stringify(request).length
  });

  try {
    const response = await fetch('/api/checkout/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    // Stop 9
    const result = await response.json();
    console.log('TRACE: Client received response', {
      status: response.status,
      requestId: result.requestId,
      receivedAt: Date.now()
    });

    // Stop 10
    console.log('TRACE: UI state updated', {
      loading: false,
      success: true,
      reservationId: result.requestId,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('TRACE: Error occurred', { error });
  }
};
```

### 2. Server-side Trace Logs
Add to `/api/checkout/reserve` route:

```typescript
// Stop 4
console.log('TRACE: Server received request', {
  endpoint: '/api/checkout/reserve',
  requestId: request.id,
  type: request.type,
  bodyParsed: true
});

// Stop 5
console.log('TRACE: Redis connection status', {
  connected: redis.status,
  host: redis.options.host,
  port: redis.options.port,
  db: redis.options.db
});

// Stop 6
const result = await queue.enqueue(request);
console.log('TRACE: Queue enqueue operation', {
  requestId: request.id,
  queueName: 'queue:reservations',
  operation: 'LPUSH',
  success: true
});

// Stop 7
console.log('TRACE: Response formed', {
  response: {
    requestId: result.requestId,
    status: result.status,
    timestamp: Date.now()
  }
});

// Stop 8
console.log('TRACE: API response sent', {
  statusCode: 202,
  responseSize: JSON.stringify(result).length,
  requestId: result.requestId
});

return Response.json(result, { status: 202 });
```

## Manual Verification Checklist

### Before Testing
- [ ] Redis server running (`redis-cli ping` returns PONG)
- [ ] Next.js dev server running (`npm run dev`)
- [ ] Browser dev tools opened to Console and Network tabs
- [ ] Test products in basket with stripePriceId

### During Testing
- [ ] Console shows all 10 TRACE logs
- [ ] Network tab shows POST to /api/checkout/reserve
- [ ] Request body contains valid QueueRequest
- [ ] Response status is 202
- [ ] Response contains requestId and status

### After Testing
- [ ] Redis contains reservation in queue: `redis-cli LRANGE queue:reservations 0 -1`
- [ ] Queue entry has TTL: `redis-cli TTL queue:reservations`
- [ ] UI shows success state
- [ ] No console errors

## Expected Redis State
After successful checkout:
```
redis-cli> LRANGE queue:reservations 0 -1
1) "{\"id\":\"uuid-here\",\"type\":\"create_reservation\",...}"

redis-cli> TTL queue:reservations
(integer) 300
```

## Common Failure Points

1. **Stop 1 Fails:** Button not connected to handler
2. **Stop 3 Fails:** API endpoint not found (404)
3. **Stop 5 Fails:** Redis not running or connection failed
4. **Stop 6 Fails:** Queue implementation error
5. **Stop 8 Fails:** Response serialization error

## Success Criteria
All 10 bus stops show PASS status with expected console logs and Redis queue contains the reservation request.
