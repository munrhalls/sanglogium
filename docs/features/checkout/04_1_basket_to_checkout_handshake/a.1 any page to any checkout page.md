* `/checkout/*` via url triggers client secret existence and validation check
* existence check checks for client secret
* if missing - user is routed back
* validation checks if client secret is real and valid
* if invalid - user is routed back
* `/checkout/*` is inaccessible via any means unless client secret exists and is validated

```mermaid
flowchart TD
    A[User requests /checkout/*] --> B{Client Secret Exists?}
    B -- No --> C[Route user back]
    B -- Yes --> D{Client Secret Valid?}
    D -- No --> E[Route user back]
    D -- Yes --> F[Access Granted to /checkout/*]