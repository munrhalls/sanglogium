# b.0 Basket to API Checkout POST Request - Public Basket Data Pre-flight Validation

## Concept Flow
The client initiates checkout and updates its local state to indicate processing. It sends the `publicBasket` payload to the API. The server strictly validates the structural integrity and base logic of the incoming payload itself (e.g., ensuring it is an array, id exists, and quantity is a positive integer).

* **Failure:** If the payload is malformed or invalid, the server immediately rejects the request, triggering the client to display an inline error and refresh UI.
* **Success:** If the data structure is valid, the server successfully advances the request to further validation phases.

## Specifications
* **Trigger:** Checkout button click results in `handleCheckout` function call.
* **State Change:** Zustand basket state update: `basketCheckoutStatus` transitions from `'none'` to `'processing'`.
* **Network:** `handleCheckout` makes `/api/checkout` POST request.
* **Payload:** `/api/checkout` POST route receives `publicBasket` payload containing `id` and `quantity` for each cart item.
* **Validation:** `/api/checkout` POST route strictly validates the data types and values of the `publicBasket` payload (e.g., id is a valid string, quantity is an integer strictly greater than 0).

## Case Branching

### Fail Case
* **Condition:** If any structural or base validation constraint fails.
* **Server Outcome:** The server immediately halts processing and returns a `400 Bad Request` with a `'publicBasket data invalid'` error.
* **Client State:** Zustand basket state update: `basketCheckoutStatus` transitions to `'publicBasketDataInvalid'`.
* **UI Outcome:** Client UI displays an **Inline Message**: a generic message and refresh button directly inside the basket UI, replacing the checkout button to keep context immediate and actionable.

### Success Case
* **Condition:** If all `publicBasket` data validation constraints pass.
* **Outcome:** The `/api/checkout` POST route proceeds to further validation phases.

---

## Architecture Diagram

```mermaid
sequenceDiagram
    participant C as Client (Zustand & UI)
    participant API as /api/checkout POST

    C->>C: Set basketCheckoutStatus = 'processing'
    C->>API: POST { publicBasket: [{id, quantity}] }

    API->>API: Validate publicBasket data structure (id exists, quantity > 0)

    alt Validation: Invalid Data
        API-->>C: 400 Bad Request ('publicBasket data invalid')
        C->>C: Set basketCheckoutStatus = 'publicBasketDataInvalid'
        C->>C: Replace checkout button with inline refresh UI
    else Validation: Valid Data
        API->>API: Proceed to further validation phases
    end