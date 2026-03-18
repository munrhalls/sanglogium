# Scope: Programmatic Sanity Data Entry

## Objective
Establish a simple, robust, and fast programmatic pipeline to update the Sanity `homepageData` document directly from the terminal, completely bypassing the Sanity Studio UI.

## Core Strategy
Utilize a local JSON payload file and a Node.js script executed via PowerShell to send `patch` mutations to the Sanity backend. The script must support partial updates (e.g., updating only `spotlight1Data` or `featured` arrays without overwriting the rest of the document).

## In Scope
- A minimal Node.js script utilizing `@sanity/client` to read a JSON file and patch the document.
- Local JSON templates mapping to the required schema fields (Spotlights, Arrays, etc.).
- PowerShell execution commands to trigger the updates.

## Out of Scope
- Sanity Studio UI interactions or debugging.
- Schema modifications or improvements.
- Complex data validation before patching (relying on Sanity's backend validation).
- Overly abstracted or complex CLI tools; keeping it to simple read-and-patch logic.
