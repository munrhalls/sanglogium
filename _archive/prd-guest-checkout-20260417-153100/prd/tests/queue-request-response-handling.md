# Queue Request/Response Handling Test Specification

## Test Overview
Tests the HTTP request/response handling for the queue system, ensuring proper validation, idempotency, and error responses.

## Test 1: Create Reservation Request Structure

### Setup
- API endpoint running
- Valid client basket data

### Test Steps
1. Send POST to /api/checkout/reserve with valid headers
2. Include Content-Type: application/json
3. Include Idempotency-Key: UUIDv4
4. Include clientBasket in body
5. Verify response status 202 (processing)
6. Check response contains requestId
7. Verify response structure matches specification

### Verification
- Request accepted for processing
- Response format correct
- Required headers validated

## Test 2: Rollback Reservation Request Structure

### Setup
- Active reservation token
- API endpoint running

### Test Steps
1. Send POST to /api/checkout/rollback
2. Include Content-Type: application/json
3. Include Idempotency-Key: UUIDv4
4. Include reservationToken in body
5. Verify response status 202 or 200
6. Check response structure matches specification

### Verification
- Rollback request accepted
- Response format correct
- Token properly validated

## Test 3: Request Validation and Error Handling

### Setup
- API endpoint running
- Invalid request data

### Test Steps
1. Send request without Content-Type header
2. Verify 400 Bad Request response
3. Send request without Idempotency-Key
4. Verify 400 Bad Request response
5. Send malformed JSON body
6. Verify 400 Bad Request response
7. Check error response structure

### Verification
- Validation errors caught early
- Proper error codes returned
- Error messages descriptive

## Test 4: Idempotency Key Handling

### Setup
- API endpoint running
- Same request sent twice

### Test Steps
1. Send create reservation request
2. Note the idempotency key used
3. Send identical request with same key
4. Verify cached response returned
5. Send request with same key but different body
6. Verify parameter mismatch error
7. Check idempotency store behavior

### Verification
- Duplicate requests return cached response
- Parameter changes detected
- Idempotency keys stored correctly

## Test 5: HTTP Status Code Mapping

### Setup
- API endpoint running
- Various request scenarios

### Test Steps
1. Send valid request - expect 202 (processing) or 200 (completed)
2. Send invalid request - expect 400 (bad request)
3. Send with invalid token - expect 404 (not found)
4. Send during maintenance - expect 503 (service unavailable)
5. Check status codes match specification

### Verification
- Status codes correct for each scenario
- Error responses include proper codes
- Client can handle different statuses

## Test 6: Request ID and Tracing

### Setup
- API endpoint with logging enabled
- Optional X-Request-ID header

### Test Steps
1. Send request without X-Request-ID
2. Verify server generates request ID
3. Send request with custom X-Request-ID
4. Verify custom ID used in response
5. Check logs contain request ID
6. Verify tracing works across systems

### Verification
- Request IDs generated when missing
- Custom IDs preserved
- Tracing works end-to-end

## Test 7: Response Data Structure

### Setup
- Successful reservation creation
- API endpoint running

### Test Steps
1. Create reservation successfully
2. Verify response contains success: true
3. Check data.reservationToken exists
4. Verify data.reservedBasket structure
5. Check data.expiresAt is valid ISO timestamp
6. Verify requestId matches

### Verification
- Response data complete
- All required fields present
- Data types correct

## Test 8: Error Response Structure

### Setup
- API endpoint running
- Error conditions triggered

### Test Steps
1. Trigger validation error
2. Verify response contains success: false
3. Check error.code exists
4. Verify error.message is descriptive
5. Check error.details if present
6. Verify requestId present

### Verification
- Error responses consistent
- Error codes meaningful
- Messages helpful for debugging

## Test 9: Webhook Request Handling

### Setup
- Stripe webhook endpoint
- Valid webhook signature

### Test Steps
1. Send webhook with valid stripe-signature
2. Verify signature validation passes
3. Check webhook type processed correctly
4. Extract reservation token from metadata
5. Verify realize request created
6. Test invalid signature rejection

### Verification
- Webhook signatures validated
- Metadata extracted correctly
- Invalid signatures rejected

## Test 10: Concurrent Request Handling

### Setup
- Multiple simultaneous requests
- Same reservation token

### Test Steps
1. Send two rollback requests simultaneously
2. Verify one succeeds, one fails
3. Check operation_in_progress error
4. Verify proper error response
5. Test with different tokens works fine

### Verification
- Concurrent operations prevented
- Proper error responses
- Race conditions handled

## Test 11: Request Size Limits

### Setup
- API endpoint with size limits
- Large client basket

### Test Steps
1. Send request with oversized basket
2. Verify 413 Payload Too Large
3. Check error message descriptive
4. Test with normal size works
5. Verify limits enforced consistently

### Verification
- Size limits enforced
- Proper error responses
- Normal requests unaffected

## Test 12: Request Timeout Handling

### Setup
- API endpoint with timeout
- Slow processing simulation

### Test Steps
1. Send request that takes too long
2. Verify timeout response
3. Check status code appropriate
4. Verify client can retry
5. Test with fast request works

### Verification
- Timeouts handled gracefully
- Retry logic works
- Fast requests unaffected

## Test 13: Response Compression

### Setup
- API endpoint with compression
- Large response data

### Test Steps
1. Send request expecting large response
2. Verify Accept-Encoding handled
3. Check response compressed
4. Verify decompression works
5. Test with small response

### Verification
- Compression applied appropriately
- Headers set correctly
- Decompression works

## Test 14: CORS and Security Headers

### Setup
- API endpoint with CORS
- Cross-origin request

### Test Steps
1. Send request from different origin
2. Verify CORS headers present
3. Check OPTIONS preflight
4. Verify security headers set
5. Test with same origin

### Verification
- CORS configured correctly
- Security headers present
- Preflight requests handled
