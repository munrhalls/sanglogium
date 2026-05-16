# Furgonetka Sandbox API Authentication Problem - RESOLVED

## Problem Statement (Original)
OAuth password grant authentication to Furgonetka sandbox API was failing, and API endpoints were rejecting requests with JSON decode errors.

## Root Cause Analysis (Provided by External Agent)

### Issue 1: Password Grant fails with invalid_grant
The username/password combination is wrong for the sandbox environment. The client credentials work because they're tied to the OAuth app, not the user account. Current status: Rate-limited (429 Too Many Requests) from repeated failed attempts.

### Issue 2: GET requests return "JSON decode error: Syntax error" (RESOLVED)
Sending `Content-Type: application/json` on bodyless GET requests causes Furgonetka's API (built on Symfony/API Platform) to attempt JSON parsing on an empty body, resulting in a syntax error.

**Fix Applied**: Remove Content-Type header from GET requests. Only send Authorization and Accept headers.

## Current Status After Fix

### Test Results (After Removing Content-Type from GET)
- `/account/services`: 401 Unauthorized - `{"code":"access_denied","message":"Error user authentication"}`
- `/configuration/allowed-countries`: 401 Unauthorized - `{"code":"access_denied","message":"Error user authentication"}`
- `/configuration/services-statements`: 400 Bad Request - Missing required parameter (country_relation)

### Remaining Issues
1. **Client credentials token lacks permissions** for user-specific endpoints (401 Unauthorized)
2. **Some endpoints require query parameters** (400 Bad Request on services-statements)
3. **Password grant still rate-limited** (429 Too Many Requests) - need to wait 15-30 minutes or contact support

### Sandbox Credentials
```
Client ID: sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7
Client Secret: bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7
Username: antarcticdepths71@gmail.com
Password: Furgonetkaguars77@
```

### API Endpoints
```
OAuth Token URL: https://api.sandbox.furgonetka.pl/oauth/token
Base API URL: https://api.sandbox.furgonetka.pl
Test Endpoints Attempted:
  - /account/services
  - /configuration/allowed-countries
  - /configuration/services-statements
```

### Headers Attempted
```
v1+json headers (per Furgonetka docs):
  Content-Type: application/vnd.furgonetka.v1+json
  Accept: application/vnd.furgonetka.v1+json

Regular JSON headers:
  Content-Type: application/json
  Accept: application/json
```

## Attempts Made

### Phase 1: OAuth Authentication

**Attempt 1: Password Grant**
- Method: POST to `/oauth/token`
- Headers: Basic Auth (client_id:client_secret base64-encoded)
- Body: `grant_type=password&scope=api&username={username}&password={password}`
- Result: FAILED
  - Initial: 400 Bad Request - `{"error":"invalid_grant","error_description":"The user credentials were incorrect."}`
  - After repeated tests: 429 Too Many Requests - `{"error":"too_many_attempts","error_description":"Za dużo błędnych prób logowania."}`

**Attempt 2: Client Credentials Grant (Fallback)**
- Method: POST to `/oauth/token`
- Headers: Basic Auth (client_id:client_secret base64-encoded)
- Body: `grant_type=client_credentials&scope=api`
- Result: PASSED
  - Status: 200 OK
  - Token type: Bearer
  - Expires in: 3600 seconds
  - Access token acquired successfully

### Phase 2: API Ping Test

Using the access token from client credentials grant:

**Attempt 1: GET with v1+json headers**
- Endpoints: All 3 tested
- Result: 400 Bad Request - `{"errors":{"json":{"error":"JSON decode error: Syntax error"}}}`

**Attempt 2: GET with regular JSON headers**
- Endpoints: All 3 tested
- Result: 400 Bad Request - `{"errors":{"json":{"error":"JSON decode error: Syntax error"}}}`

**Attempt 3: POST with empty body (regular JSON)**
- Endpoints: All 3 tested
- Result: 405 Method Not Allowed

## Current State
- Password grant: FAILED (credentials incorrect or rate-limited)
- Client credentials grant: WORKS (token acquired)
- API access: FAILED (all endpoints reject requests)

## What Needs Resolution
1. Determine correct username/password for sandbox account (or confirm password grant is not supported)
2. Identify correct API endpoints and headers for sandbox environment
3. Understand why GET requests return "JSON decode error"
4. Determine if sandbox account is fully provisioned for API access
5. Get working example of API call with correct headers/body format

## Additional Context
- Client credentials match those in `.env` file
- Existing scripts (`test-furgonetka-carriers.mjs`, `test-furgonetka-password-auth.mjs`) show same endpoints failing
- Production credentials exist but not tested yet (client ID: `sanglogium-77499ed9a74ddeb617e2ac1c28625bac`)
- Furgonetka registration: https://furgonetka.pl/rejestracja
- OAuth apps: https://furgonetka.pl/api/aplikacje-oauth

## Test Script
Run `node scripts/test-furgonetka-auth.mjs` to reproduce the issue. Script tests both authentication methods and multiple endpoints with clear pass/fail output.
