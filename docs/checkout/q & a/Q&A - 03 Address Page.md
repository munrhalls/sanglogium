# Q & A - CRITICAL Q'S ONLY INTELLIGENCE GATHERING - Address Page



## The "Bus Stop" Trace: The Checkout Funnel

What happens at each "bus stop" of checkout? Here is the exact technical execution of how data is persisted across your specific scope.

### Stop 2: The Address Page

**Action:** The user fills out their delivery details and clicks "Continue".

**How Data Moves:** The form submits to a Next.js Server Action. The server reads the existing cookie, validates the address data, and appends it to the session.

**Persistence:** The Server Action overwrites the `checkout_session` cookie with the new data and redirects to `/checkout/shipping`.

**State:** Cookie now holds: `{ basket, address }`

---
