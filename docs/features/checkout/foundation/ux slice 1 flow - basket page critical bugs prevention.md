#1 bug to prevent - double (or n times more) reserve stock
#2 bug to prevent - race conditions - infinite n amount of customer pc's fire requests at the same time ->  window where one request reserves stock but before the request finishes, other request starts being processed that attempts to reserve the same stock -> -infinite reserved stock vs real stock unhandled attempts are possible

Fresh PaymentIntent (0 failures): ❌ Fails
Race condition: Multiple requests can create multiple PaymentIntents
No atomic "find-delete-create" operation
No Double Reserve (0 double reserves): ❌ Fails
Race condition: Multiple requests reserve same stock
Stock reservation happens before old reservation release
No Infinite Attack (0 infinite attempts): ❌ Fails
No rate limiting
No per-session caps
Bot can deplete all stock
No DDOS (0 UI spam success): ❌ Fails
No throttling
No request queue management
Infinite requests possible



# n multiple charge, n multiple stock reserve

How Double Charges Happen:
Scenario 1: User Double-Click

User clicks "Checkout" → Request 1 sent
User clicks again → Request 2 sent (before Request 1 response)
Both requests create PaymentIntents
User gets charged twice
Scenario 2: Network Timeout + Retry

User clicks "Checkout" → Request sent
Network timeout, no response
Client automatically retries
Server processes both → Two charges
Scenario 3: Browser Refresh

User clicks "Checkout" → Processing
Page refreshes
User clicks again → Duplicate charge
How Double Stock Reserve Happens:
Same scenarios as above, but with stock:

Request 1: Reserve 10 units of Product A
Request 2: Reserve 10 units of Product A
Stock shows 20 reserved (but only 10 exist)
Other customers can't buy those 10 units