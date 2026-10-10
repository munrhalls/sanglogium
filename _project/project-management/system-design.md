The map, in learning order:

Requirements and constraints. Separate what the system does from how well it must do it (scale, latency, consistency, cost). Every design choice is a trade against these.
Data modeling. Entities, relationships, and the single source of truth for each piece of data. This is the hardest thing to change later.
Storage and consistency. SQL vs NoSQL, indexes, transactions, and what “eventually consistent” costs you.
APIs and boundaries. Contracts between parts, idempotency, and deciding where one module ends and the next begins.
Caching. What to cache, where (browser, CDN, app, DB), and how it goes stale.
Async work and queues. What doesn’t need to happen inside the request, plus retries and duplicate delivery.
Scaling and bottlenecks. Stateless services, replicas, and back-of-envelope math to find the real limit.
Failure and observability. Timeouts, partial failure, logs and metrics. Assume everything breaks.


