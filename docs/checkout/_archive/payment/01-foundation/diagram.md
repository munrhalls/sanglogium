# Payment Foundation - Setup Diagram

```mermaid
flowchart TD
    A[Verify session types] --> B[Verify Stripe env vars]
    B --> C[Verify Stripe Dashboard config]
    C --> D[Verify error.tsx exists]
```
