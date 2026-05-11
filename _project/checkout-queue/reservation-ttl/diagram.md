```mermaid
flowchart LR
    Request[Reservation Request] --> TTL[API Response<br/>includes TTL]
    TTL --> Sanity[Sanity Doc<br/>with expiresAt]
    Sanity --> Redis[Redis Queue<br/>for processing]
    Redis --> Cleanup[Background Cleanup]
    Cleanup --> Stock[Release<br/>reservedStock]
    Cleanup --> Delete[Delete<br/>expired doc]
```
